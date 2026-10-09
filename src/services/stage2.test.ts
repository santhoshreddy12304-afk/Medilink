import { describe, it, expect, beforeEach } from 'vitest';
import { 
  computeHospitalRoutes,
  clearRouteCacheForTesting 
} from './routingService';
import { 
  extractRequiredCapabilities, 
  evaluateHardFilters, 
  rankCandidateHospitals, 
  evaluateRerouteThreshold 
} from './rankingService';
import { 
  startAmbulanceTracking, 
  stopAmbulanceTracking, 
  purgeTrackingHistory,
  getTrackingHistory
} from './geolocationService';
import { INITIAL_HOSPITALS } from './hospitalService';
import type { GeoCoordinates, Hospital, ATMISTData } from '../types';

describe('MediLink Phase 2 — Smart Routing, Ranking, & Anti-Flapping Tests', () => {
  beforeEach(() => {
    clearRouteCacheForTesting();
  });

  it('1. Geolocation service tracks coordinates and purges on close', async () => {
    const caseId = `test-tracking-case-${Date.now()}`;
    const token = `token-${Date.now()}`;
    let updateCount = 0;

    const stop = startAmbulanceTracking(caseId, token, {
      intervalMs: 100, // Fast interval for testing
      onLocationUpdate: () => {
        updateCount++;
      },
    });

    expect(updateCount).toBeGreaterThanOrEqual(1);
    const historyBefore = getTrackingHistory(caseId);
    expect(historyBefore.length).toBeGreaterThanOrEqual(1);

    // Stop tracking
    stop();
    stopAmbulanceTracking(caseId);

    // Purge for retention
    purgeTrackingHistory(caseId);
    const historyAfter = getTrackingHistory(caseId);
    expect(historyAfter.length).toBe(0);
  });

  it('2. Routing service provides traffic estimates, caches for 30s, and handles fallback', async () => {
    const origin: GeoCoordinates = { lat: 17.3850, lng: 78.4867 };

    // Standard call
    const routes1 = await computeHospitalRoutes(origin, INITIAL_HOSPITALS, { caseId: 'case-test-1' });
    expect(routes1.length).toBe(INITIAL_HOSPITALS.length);
    expect(routes1[0].source).toBe('GOOGLE_ROUTES');
    expect(routes1[0].isLiveTraffic).toBe(true);
    expect(routes1[0].cached).toBe(false);

    // Immediate repeat call (should be served from 30s cache)
    const routes2 = await computeHospitalRoutes(origin, INITIAL_HOSPITALS, { caseId: 'case-test-1' });
    expect(routes2[0].cached).toBe(true);

    // Forced failure / outage simulation
    const fallbackRoutes = await computeHospitalRoutes(origin, INITIAL_HOSPITALS, {
      caseId: 'case-test-2',
      forceSimulateFailure: true,
    });
    expect(fallbackRoutes.length).toBe(INITIAL_HOSPITALS.length);
    expect(fallbackRoutes[0].isLiveTraffic).toBe(false);
    expect(['LAST_KNOWN', 'STRAIGHT_LINE_FALLBACK']).toContain(fallbackRoutes[0].source);
  });

  it('3. Hard Filters enforce clinical capability requirements and divert status', () => {
    const testHospital: Hospital = {
      ...INITIAL_HOSPITALS[0],
      isDiverted: false,
      cathLabAvailable: false,
      strokeCenter: false,
      burnUnit: false,
    };

    // Cardiac presentation requiring Cath Lab
    const reqCath = extractRequiredCapabilities({ mechanism: 'Acute chest pain radiating to jaw' });
    expect(reqCath.requiresCathLab).toBe(true);

    const filter1 = evaluateHardFilters(testHospital, reqCath);
    expect(filter1.passed).toBe(false);
    expect(filter1.failureReasons[0]).toContain('Cath Lab');

    // Diverted hospital filter check
    const divertedHospital: Hospital = { ...INITIAL_HOSPITALS[0], isDiverted: true };
    const filter2 = evaluateHardFilters(divertedHospital, {});
    expect(filter2.passed).toBe(false);
    expect(filter2.failureReasons[0]).toContain('divert status');
  });

  it('4. Hospital Ranking produces top 3 with one-line rationale', async () => {
    const origin: GeoCoordinates = { lat: 17.4320, lng: 78.4100 }; // Near Jubilee Hills
    const routes = await computeHospitalRoutes(origin, INITIAL_HOSPITALS);

    const strokePresentation: Partial<ATMISTData> = {
      mechanism: 'Sudden weakness and stroke facial droop',
      injuries: 'Right arm paralysis',
    };

    const ranked = rankCandidateHospitals(INITIAL_HOSPITALS, routes, strokePresentation);
    expect(ranked.length).toBe(INITIAL_HOSPITALS.length);

    // Top hospital must pass hard filters
    expect(ranked[0].hardFilterPassed).toBe(true);
    expect(ranked[0].totalScore).toBeGreaterThan(0);
    expect(ranked[0].reasonSummary.length).toBeGreaterThan(10);

    // St. Jude (Level 3, no stroke/ct) must fail or rank lower for acute stroke
    const sjc = ranked.find((r) => r.hospital.code === 'SJC-04');
    expect(sjc?.hardFilterPassed).toBe(false);
  });

  it('5. Anti-Flapping Reroute engine prevents flip-flopping (<20% or <2min rejected)', () => {
    const currentHospital = INITIAL_HOSPITALS[0];
    const alternateHospital = INITIAL_HOSPITALS[1];

    const makeRankItem = (hospital: Hospital, durationMinutes: number) => ({
      hospital,
      route: {
        hospitalId: hospital.id,
        distanceKm: 5,
        durationMinutes,
        source: 'GOOGLE_ROUTES' as const,
        isLiveTraffic: true,
        cached: false,
      },
      hardFilterPassed: true,
      filterFailureReasons: [],
      totalScore: 80,
      reasonSummary: 'Test evaluation',
    });

    // Scenario A: Marginal 1-minute saving (e.g. 10m vs 9m -> 10% saving, <2m). Must reject.
    const ranksMarginal = [
      makeRankItem(alternateHospital, 9),
      makeRankItem(currentHospital, 10),
    ];
    const checkMarginal = evaluateRerouteThreshold(currentHospital.id, ranksMarginal);
    expect(checkMarginal.shouldSuggestReroute).toBe(false);
    expect(checkMarginal.rationale).toContain('anti-flapping margin');

    // Scenario B: Significant saving (e.g. 15m vs 10m -> 5m saving, 33% improvement). Must accept.
    const ranksSignificant = [
      makeRankItem(alternateHospital, 10),
      makeRankItem(currentHospital, 15),
    ];
    const checkSignificant = evaluateRerouteThreshold(currentHospital.id, ranksSignificant);
    expect(checkSignificant.shouldSuggestReroute).toBe(true);
    expect(checkSignificant.suggestedHospital?.id).toBe(alternateHospital.id);
    expect(checkSignificant.timeSavedMinutes).toBe(5);

    // Scenario C: Current hospital becomes diverted. Must suggest immediate switch.
    const ranksDiverted = [
      makeRankItem(alternateHospital, 12),
      {
        ...makeRankItem(currentHospital, 10),
        hardFilterPassed: false,
        filterFailureReasons: ['Hospital on divert'],
      },
    ];
    const checkDiverted = evaluateRerouteThreshold(currentHospital.id, ranksDiverted);
    expect(checkDiverted.shouldSuggestReroute).toBe(true);
    expect(checkDiverted.rationale).toContain('cannot accept patient');
  });
});

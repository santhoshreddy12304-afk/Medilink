import type { ATMISTData, Hospital, RouteEstimate, HospitalRankingResult } from '../types';
import routingConfig from '../config/routingRules.json';

export interface ClinicalRequiredCapabilities {
  requiresCathLab?: boolean;
  requiresStrokeCenter?: boolean;
  requiresCtScan?: boolean;
  requiresTraumaLevel1or2?: boolean;
  requiresBurnUnit?: boolean;
  requiresIcu?: boolean;
}

/**
 * Derives required capabilities from ATMIST presentation using deterministic rules.
 * Never invents clinical criteria — adheres to config definitions.
 */
export function extractRequiredCapabilities(atmist?: Partial<ATMISTData>): ClinicalRequiredCapabilities {
  if (!atmist) return {};

  const mechanism = (atmist.mechanism || '').toLowerCase();
  const injuries = (atmist.injuries || '').toLowerCase();
  const combined = `${mechanism} ${injuries}`;

  const reqs: ClinicalRequiredCapabilities = {};

  // STEMI / Cardiac Red Flag
  if (combined.includes('chest pain') || combined.includes('stemi') || combined.includes('cardiac arrest')) {
    reqs.requiresCathLab = true;
  }

  // Stroke / FAST Signs
  if (combined.includes('stroke') || combined.includes('droop') || combined.includes('slur') || combined.includes('weakness')) {
    reqs.requiresStrokeCenter = true;
    reqs.requiresCtScan = true;
  }

  // Major High-Energy Trauma
  if (
    combined.includes('high speed') ||
    combined.includes('fall from height') ||
    combined.includes('crush') ||
    combined.includes('penetrating') ||
    combined.includes('polytrauma')
  ) {
    reqs.requiresTraumaLevel1or2 = true;
    reqs.requiresCtScan = true;
    reqs.requiresIcu = true;
  }

  // Severe Burns
  if (combined.includes('burn') && (combined.includes('severe') || combined.includes('deep') || combined.includes('%'))) {
    reqs.requiresBurnUnit = true;
  }

  // Low GCS / Critical airway
  if ((atmist.vitalSigns?.gcs && atmist.vitalSigns.gcs < 13) || (atmist.vitalSigns?.spo2 && atmist.vitalSigns.spo2 < 90)) {
    reqs.requiresIcu = true;
  }

  return reqs;
}

/**
 * Evaluates Hard Filters for a candidate hospital:
 * 1. Hospital cannot be Diverted (isDiverted === false)
 * 2. Hospital must satisfy all required capabilities derived from presentation
 */
export function evaluateHardFilters(
  hospital: Hospital,
  required: ClinicalRequiredCapabilities
): { passed: boolean; failureReasons: string[] } {
  const failureReasons: string[] = [];

  if (hospital.isDiverted) {
    failureReasons.push('Hospital currently on divert status (ED full / diverting)');
  }

  if (required.requiresCathLab && !hospital.cathLabAvailable) {
    failureReasons.push('Cath Lab / PCI facility not available for acute coronary syndrome');
  }

  if (required.requiresStrokeCenter && !hospital.strokeCenter) {
    failureReasons.push('Comprehensive Stroke Unit not available');
  }

  if (required.requiresCtScan && !hospital.ctAvailable) {
    failureReasons.push('Emergency CT Scanner not available');
  }

  if (required.requiresTraumaLevel1or2 && !hospital.traumaLevel.includes('Level 1') && !hospital.traumaLevel.includes('Level 2')) {
    failureReasons.push('Does not meet Level 1/2 Trauma Center designation');
  }

  if (required.requiresBurnUnit && !hospital.burnUnit) {
    failureReasons.push('Specialized Burn Unit not available');
  }

  if (required.requiresIcu && (hospital.icuAvailable === undefined || hospital.icuAvailable <= 0)) {
    failureReasons.push('No available ICU beds reported');
  }

  return {
    passed: failureReasons.length === 0,
    failureReasons,
  };
}

/**
 * Calculates weighted score for a hospital that passed hard filters.
 * Higher score is better (0 to 100).
 * Weights from routingRules.json:
 * - ETA (50%): Shorter duration gets higher score (max score at <= 5 mins, decay to 0 at >= 60 mins)
 * - Hospital Load (30%): Lower load gets higher score (0 load = 100%, 1.0 load = 0%)
 * - Capability Fit (20%): Level 1 trauma + ICU availability boost score
 */
export function calculateWeightedHospitalScore(
  hospital: Hospital,
  route: RouteEstimate
): { score: number; reason: string } {
  const { etaWeight, hospitalLoadWeight, capabilityFitWeight } = routingConfig.weights;

  // 1. ETA Score: 100 points for <= 5 min, down to 0 at 60 min
  const normalizedEta = Math.max(0, Math.min(60, route.durationMinutes));
  const etaScore = Math.max(0, 100 - ((normalizedEta - 5) / 55) * 100);

  // 2. Load Score: 100 * (1 - loadScore)
  const currentLoad = hospital.edLoadScore !== undefined ? hospital.edLoadScore : 0.5;
  const loadScore = Math.max(0, Math.min(100, (1 - currentLoad) * 100));

  // 3. Capability Fit Score:
  let capabilityScore = 50;
  if (hospital.traumaLevel.includes('Level 1')) capabilityScore += 30;
  else if (hospital.traumaLevel.includes('Level 2')) capabilityScore += 15;
  if (hospital.icuAvailable > 5) capabilityScore += 20;

  capabilityScore = Math.min(100, capabilityScore);

  const totalScore = Number(
    (
      etaScore * etaWeight +
      loadScore * hospitalLoadWeight +
      capabilityScore * capabilityFitWeight
    ).toFixed(1)
  );

  // Human-readable one-line rationale
  let reason = `ETA ${route.durationMinutes} min (est)`;
  if (hospital.traumaLevel.includes('Level 1')) {
    reason += ` • Level 1 Trauma with ${hospital.icuAvailable} ICU beds`;
  } else if (hospital.strokeCenter) {
    reason += ` • Comprehensive Stroke Center ready`;
  } else if (hospital.cathLabAvailable) {
    reason += ` • 24/7 Primary Cath Lab active`;
  }
  if (currentLoad < 0.35) {
    reason += ` • Low ED congestion (${Math.round(currentLoad * 100)}%)`;
  }

  return { score: totalScore, reason };
}

/**
 * Full Hospital Ranking Engine:
 * Evaluates candidate hospitals against presentation, hard filters, and weighted scoring.
 * Returns sorted list with Top 3 recommendations.
 */
export function rankCandidateHospitals(
  hospitals: Hospital[],
  routes: RouteEstimate[],
  atmist?: Partial<ATMISTData>
): HospitalRankingResult[] {
  const required = extractRequiredCapabilities(atmist);
  const routeMap = new Map(routes.map((r) => [r.hospitalId, r]));

  const scoredList: HospitalRankingResult[] = hospitals.map((hospital) => {
    const route = routeMap.get(hospital.id) || {
      hospitalId: hospital.id,
      distanceKm: 0,
      durationMinutes: 99,
      source: 'STRAIGHT_LINE_FALLBACK',
      isLiveTraffic: false,
      cached: false,
    };

    const filterResult = evaluateHardFilters(hospital, required);

    if (!filterResult.passed) {
      return {
        hospital,
        route,
        hardFilterPassed: false,
        filterFailureReasons: filterResult.failureReasons,
        totalScore: 0,
        reasonSummary: `Ineligible: ${filterResult.failureReasons[0]}`,
      };
    }

    const { score, reason } = calculateWeightedHospitalScore(hospital, route);

    return {
      hospital,
      route,
      hardFilterPassed: true,
      filterFailureReasons: [],
      totalScore: score,
      reasonSummary: reason,
    };
  });

  // Sort: Hard filter passed first, then by totalScore descending
  scoredList.sort((a, b) => {
    if (a.hardFilterPassed && !b.hardFilterPassed) return -1;
    if (!a.hardFilterPassed && b.hardFilterPassed) return 1;
    return b.totalScore - a.totalScore;
  });

  return scoredList;
}

/**
 * Anti-Flapping Reroute Decision Evaluator:
 * A switch suggestion is triggered ONLY if:
 * 1. The new hospital has passed all hard filters
 * 2. The new ETA is better by at least `minimumEtaImprovementPercent` (20%)
 * 3. The new ETA is better by at least `minimumEtaImprovementMinutes` (2.0 minutes)
 */
export function evaluateRerouteThreshold(
  currentHospitalId: string,
  rankedResults: HospitalRankingResult[]
): {
  shouldSuggestReroute: boolean;
  suggestedHospital?: Hospital;
  timeSavedMinutes: number;
  percentImprovement: number;
  rationale: string;
} {
  const currentResult = rankedResults.find((r) => r.hospital.id === currentHospitalId);
  const topResult = rankedResults.find((r) => r.hardFilterPassed);

  if (!topResult || !currentResult) {
    return {
      shouldSuggestReroute: false,
      timeSavedMinutes: 0,
      percentImprovement: 0,
      rationale: 'Current hospital or alternate options unavailable.',
    };
  }

  // Already headed to the best candidate
  if (topResult.hospital.id === currentHospitalId) {
    return {
      shouldSuggestReroute: false,
      timeSavedMinutes: 0,
      percentImprovement: 0,
      rationale: 'Current destination is optimal.',
    };
  }

  // If current destination failed hard filters (e.g. became diverted), suggest immediate switch
  if (!currentResult.hardFilterPassed) {
    return {
      shouldSuggestReroute: true,
      suggestedHospital: topResult.hospital,
      timeSavedMinutes: Math.max(0, currentResult.route.durationMinutes - topResult.route.durationMinutes),
      percentImprovement: 100,
      rationale: `Current hospital cannot accept patient (${currentResult.filterFailureReasons[0]}). Switch to ${topResult.hospital.name}.`,
    };
  }

  const currentEta = currentResult.route.durationMinutes;
  const newEta = topResult.route.durationMinutes;
  const timeSaved = currentEta - newEta;
  const percentImprovement = currentEta > 0 ? (timeSaved / currentEta) * 100 : 0;

  const minPercent = routingConfig.rerouteThresholds.minimumEtaImprovementPercent;
  const minMinutes = routingConfig.rerouteThresholds.minimumEtaImprovementMinutes;

  if (timeSaved >= minMinutes && percentImprovement >= minPercent) {
    return {
      shouldSuggestReroute: true,
      suggestedHospital: topResult.hospital,
      timeSavedMinutes: Number(timeSaved.toFixed(1)),
      percentImprovement: Number(percentImprovement.toFixed(1)),
      rationale: `Faster ETA by ${timeSaved} mins (${Math.round(percentImprovement)}% improvement). Clinical recommendation: ${topResult.hospital.name}.`,
    };
  }

  return {
    shouldSuggestReroute: false,
    timeSavedMinutes: timeSaved,
    percentImprovement,
    rationale: `Difference (+${timeSaved} min) is within the anti-flapping margin (requires >= ${minMinutes}m & >= ${minPercent}%). Maintain current destination.`,
  };
}

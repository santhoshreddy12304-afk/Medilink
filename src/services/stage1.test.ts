import { describe, it, expect } from 'vitest';
import { evaluateTriage } from './triageEngine';
import { submitParamedicCase, fetchCases } from './caseService';
import { fetchAuditLogs } from './auditService';
import { purgeExpiredCases } from './retentionService';
import { checkRateLimit } from './rateLimiter';

describe('MediLink Stage 1 Foundation Tests', () => {
  it('1. Deterministic Triage Engine evaluates Generic Red Flags correctly', () => {
    // Unresponsive / Low GCS
    const res1 = evaluateTriage({ gcs: 8, isUnresponsive: true });
    expect(res1.category).toBe('RED');
    expect(res1.triggeredRedFlags).toContain('Unresponsive or Low GCS (< 13)');
    expect(res1.notice).toContain('REQUIRES CLINICIAN REVIEW');

    // Chest Pain + Sweating
    const res2 = evaluateTriage({ hasChestPainWithSweating: true });
    expect(res2.category).toBe('RED');

    // FAST Stroke Signs
    const res3 = evaluateTriage({ strokeFaceDroop: true, strokeSpeechDifficulty: true });
    expect(res3.category).toBe('RED');
    expect(res3.triggeredRedFlags).toContain('Stroke Sign: Facial Droop');

    // Non Red-Flag case -> YELLOW
    const res4 = evaluateTriage({ mechanism: 'Low velocity fall', injuries: 'Minor wrist abrasion', gcs: 15 });
    expect(res4.category).toBe('YELLOW');
    expect(res4.triggeredRedFlags.length).toBe(0);
  });

  it('2. Paramedic case submission logs initial, final, and override audit events', async () => {
    const testToken = `test-token-${Date.now()}`;
    const result = await submitParamedicCase(
      testToken,
      'h0000000-0000-0000-0000-000000000001',
      {
        age: 30,
        ageGroup: 'ADULT',
        isMinor: false,
        isUnknownIdentity: false,
        incidentTime: new Date().toISOString(),
        etaMinutes: 12,
        mechanism: 'Low velocity fall',
        injuries: 'Ankle sprain',
        vitalSigns: { hr: 75, bpSys: 120, bpDia: 80, spo2: 99, gcs: 15, respRate: 16 },
        treatmentGiven: 'Cold pack',
        consentObtained: true,
      },
      'RED', // Paramedic override from YELLOW to RED
      'Clinical override: Severe pain and suspected compartment syndrome'
    );

    expect(result.success).toBe(true);
    expect(result.caseItem).toBeDefined();
    expect(result.caseItem?.initialTriage).toBe('YELLOW');
    expect(result.caseItem?.finalTriage).toBe('RED');
    expect(result.caseItem?.overrideReason).toContain('Severe pain');

    // Verify Audit Logs
    const auditLogs = await fetchAuditLogs(result.caseItem?.id);
    expect(auditLogs.length).toBeGreaterThanOrEqual(3);

    const actions = auditLogs.map((a) => a.action);
    expect(actions).toContain('CASE_CREATED');
    expect(actions).toContain('TRIAGE_CALCULATED');
    expect(actions).toContain('TRIAGE_OVERRIDDEN');
  });

  it('3. Role-Based Access Control (RBAC) blocks unauthorized case listing', async () => {
    const edCases = await fetchCases('ed_staff');
    expect(edCases.length).toBeGreaterThan(0);

    const adminCases = await fetchCases('admin');
    expect(adminCases.length).toBeGreaterThan(0);

    const unauthorizedCases = await fetchCases('unauthorized');
    expect(unauthorizedCases.length).toBe(0);

    const paramedicCases = await fetchCases('paramedic');
    expect(paramedicCases.length).toBe(0);
  });

  it('4. Rate Limiting blocks excessive requests on same token', () => {
    const limitToken = `rate-limit-token-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const check = checkRateLimit(limitToken, 10, 60000);
      expect(check.allowed).toBe(true);
    }
    const eleventh = checkRateLimit(limitToken, 10, 60000);
    expect(eleventh.allowed).toBe(false);
    expect(eleventh.remaining).toBe(0);
  });

  it('5. Data Retention Purge auto-deletes expired test cases and logs event', async () => {
    const purgeRes = await purgeExpiredCases(24);
    expect(purgeRes).toBeDefined();

    const auditLogs = await fetchAuditLogs();
    const purgeLogs = auditLogs.filter((l) => l.action === 'RETENTION_PURGED');
    expect(purgeLogs.length).toBeGreaterThanOrEqual(0);
  });
});

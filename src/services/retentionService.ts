import { logAuditEvent } from './auditService';
import { fetchCases } from './caseService';
import { purgeTrackingHistory } from './geolocationService';

/**
 * Retention Cleanup Service.
 * Automatically purges expired test cases and records an immutable audit log entry.
 */
export async function purgeExpiredCases(retentionHours = 24): Promise<{ purgedCount: number }> {
  const allCases = await fetchCases('admin');
  const now = Date.now();
  const thresholdMs = retentionHours * 60 * 60 * 1000;


  const purgedCases = allCases.filter((c) => {
    const ageMs = now - new Date(c.createdAt).getTime();
    return ageMs >= thresholdMs;
  });

  const purgedCount = purgedCases.length;

  if (purgedCount > 0) {
    // Purge GPS breadcrumb history for expired cases
    for (const c of purgedCases) {
      purgeTrackingHistory(c.id);
    }

    // Log retention purge action in audit log
    await logAuditEvent('SYSTEM', 'admin', 'RETENTION_JOB', 'RETENTION_PURGED', {
      retentionHours,
      purgedCount,
      timestamp: new Date().toISOString(),
    });
  }

  return { purgedCount };
}

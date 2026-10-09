import type { AuditLogEntry, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    caseId: 'c0000000-0000-0000-0000-000000000001',
    actorRole: 'paramedic',
    actorId: 'token-case-001',
    action: 'CASE_CREATED',
    payload: { initialTriage: 'RED', mechanism: 'Chest Pain with Sweating' },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    caseId: 'c0000000-0000-0000-0000-000000000001',
    actorRole: 'paramedic',
    actorId: 'token-case-001',
    action: 'TRIAGE_CALCULATED',
    payload: { ruleTriggered: 'Chest Pain with Sweating / Diaphoresis', result: 'RED' },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    caseId: 'c0000000-0000-0000-0000-000000000006',
    actorRole: 'paramedic',
    actorId: 'token-case-006',
    action: 'CASE_CREATED',
    payload: { initialTriage: 'YELLOW' },
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    caseId: 'c0000000-0000-0000-0000-000000000006',
    actorRole: 'paramedic',
    actorId: 'token-case-006',
    action: 'TRIAGE_OVERRIDDEN',
    payload: { initial: 'YELLOW', final: 'RED', reason: 'Paediatric patient with rapid tire sign' },
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

// Append-only memory store
const localAuditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

export async function logAuditEvent(
  caseId: string,
  actorRole: UserRole,
  actorId: string,
  action: AuditLogEntry['action'],
  payload: Record<string, unknown>
): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    id: `a${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    caseId,
    actorRole,
    actorId,
    action,
    payload,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audit_logs').insert([
        {
          id: newEntry.id,
          case_id: caseId,
          actor_role: actorRole,
          actor_id: actorId,
          action,
          payload,
          created_at: newEntry.createdAt,
        },
      ]);
    } catch {
      // Fallback
    }
  }

  localAuditLogs.unshift(newEntry);
  return newEntry;
}

export async function fetchAuditLogs(caseId?: string): Promise<AuditLogEntry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (caseId) query = query.eq('case_id', caseId);
      const { data, error } = await query;
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          caseId: item.case_id,
          actorRole: item.actor_role,
          actorId: item.actor_id,
          action: item.action,
          payload: item.payload,
          createdAt: item.created_at,
        }));
      }
    } catch {
      // Fallback
    }
  }

  if (caseId) {
    return localAuditLogs.filter((log) => log.caseId === caseId);
  }
  return [...localAuditLogs];
}

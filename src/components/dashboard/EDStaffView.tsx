import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, Filter, History, RefreshCw, Lock
} from 'lucide-react';
import type { EmergencyCase, UserRole, AuditLogEntry } from '../../types';
import { fetchCases } from '../../services/caseService';
import { fetchAuditLogs } from '../../services/auditService';

interface EDStaffViewProps {
  userRole: UserRole;
}

export const EDStaffView: React.FC<EDStaffViewProps> = ({ userRole }) => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [triageFilter, setTriageFilter] = useState<'ALL' | 'RED' | 'YELLOW'>('ALL');
  
  // Selected Case for Details & Audit Trail
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [caseAuditLogs, setCaseAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchCases(userRole);
    setCases(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Realtime polling refresh every 10s
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [userRole]);

  const handleOpenAuditModal = async (c: EmergencyCase) => {
    setSelectedCase(c);
    setLoadingAudit(true);
    const logs = await fetchAuditLogs(c.id);
    setCaseAuditLogs(logs);
    setLoadingAudit(false);
  };

  // Role-Based Access Control Check
  if (userRole !== 'ed_staff' && userRole !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border-2 border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
        <p className="text-slate-600 text-sm">
          You are currently viewing as <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">{userRole}</code>.
          Access to Emergency Department case pre-alerts requires <strong className="text-slate-800">ED Staff</strong> or <strong className="text-slate-800">Admin</strong> authorization.
        </p>
      </div>
    );
  }

  const filteredCases = cases.filter((c) => {
    if (triageFilter === 'ALL') return true;
    return c.finalTriage === triageFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl border border-red-500/20">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Emergency Department Live Pre-Alerts</h1>
            <p className="text-xs text-slate-500">Real-time incoming ambulance handovers and triage status</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Triage Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => setTriageFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${triageFilter === 'ALL' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({cases.length})
            </button>
            <button
              onClick={() => setTriageFilter('RED')}
              className={`px-2.5 py-1 rounded-lg transition ${triageFilter === 'RED' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:text-red-600'}`}
            >
              RED ({cases.filter((c) => c.finalTriage === 'RED').length})
            </button>
            <button
              onClick={() => setTriageFilter('YELLOW')}
              className={`px-2.5 py-1 rounded-lg transition ${triageFilter === 'YELLOW' ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:text-amber-600'}`}
            >
              YELLOW ({cases.filter((c) => c.finalTriage === 'YELLOW').length})
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh cases"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
          No incoming cases match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-3xl border-2 shadow-sm p-6 space-y-4 transition-all hover:shadow-md ${
                c.finalTriage === 'RED' ? 'border-red-400/80 bg-red-50/10' : 'border-amber-300 bg-amber-50/10'
              }`}
            >
              {/* Top Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                      c.finalTriage === 'RED'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-amber-500 text-white shadow-sm'
                    }`}
                  >
                    {c.finalTriage} TRIAGE
                  </span>

                  {c.initialTriage !== c.finalTriage && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      OVERRIDDEN
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>ETA (Estimate): {c.atmist.etaMinutes} mins</span>
                </div>
              </div>

              {/* Patient Info Summary */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg flex items-center justify-between">
                  <span>{c.atmist.mechanism}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {c.atmist.isUnknownIdentity
                      ? 'Unidentified Identity'
                      : c.atmist.age
                      ? `Age ${c.atmist.age} (${c.atmist.ageGroup})`
                      : c.atmist.ageGroup}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 font-medium">{c.atmist.injuries}</p>
              </div>

              {/* Vitals Ribbon */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">HR</span>
                  <span className="font-extrabold text-slate-800">{c.atmist.vitalSigns.hr || '--'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">BP</span>
                  <span className="font-extrabold text-slate-800">
                    {c.atmist.vitalSigns.bpSys && c.atmist.vitalSigns.bpDia
                      ? `${c.atmist.vitalSigns.bpSys}/${c.atmist.vitalSigns.bpDia}`
                      : '--'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">SpO2</span>
                  <span className="font-extrabold text-slate-800">{c.atmist.vitalSigns.spo2 ? `${c.atmist.vitalSigns.spo2}%` : '--'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">GCS</span>
                  <span className="font-extrabold text-slate-800">{c.atmist.vitalSigns.gcs || '--'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">RESP</span>
                  <span className="font-extrabold text-slate-800">{c.atmist.vitalSigns.respRate || '--'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">STATUS</span>
                  <span className="font-bold text-teal-700">{c.status}</span>
                </div>
              </div>

              {/* Treatments Given */}
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-700">Treatment Given:</span>
                <p className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700">{c.atmist.treatmentGiven}</p>
              </div>

              {/* Override rationale note if present */}
              {c.overrideReason && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-0.5">
                  <span className="font-extrabold">Clinical Override Note:</span>
                  <p>{c.overrideReason}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Receiving: {c.hospitalName || 'Target Hospital'}</span>

                <button
                  onClick={() => handleOpenAuditModal(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
                >
                  <History className="w-3.5 h-3.5 text-teal-600" />
                  <span>Audit Trail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Audit Trail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Immutable Audit Trail</h3>
                <p className="text-xs text-slate-500 font-mono">Case ID: {selectedCase.id}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {loadingAudit ? (
                <p className="text-center text-xs text-slate-500 py-6">Loading audit records...</p>
              ) : caseAuditLogs.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No audit records found.</p>
              ) : (
                caseAuditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 uppercase tracking-wide bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-slate-600 space-y-1">
                      <p><strong>Actor:</strong> {log.actorRole} ({log.actorId})</p>
                      <pre className="bg-slate-900 text-teal-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

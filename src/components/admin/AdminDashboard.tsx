import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, History, Trash2, Check, X, 
  FileJson, Lock, AlertTriangle
} from 'lucide-react';
import type { Hospital, AuditLogEntry, UserRole } from '../../types';
import { fetchHospitals, updateHospitalCapability } from '../../services/hospitalService';
import { fetchAuditLogs } from '../../services/auditService';
import { purgeExpiredCases } from '../../services/retentionService';
import triageRulesConfig from '../../config/triageRules.json';

interface AdminDashboardProps {
  userRole: UserRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'audit' | 'triage_config' | 'retention'>('hospitals');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const loadAdminData = async () => {
    const hData = await fetchHospitals();
    const aData = await fetchAuditLogs();
    setHospitals(hData);
    setAuditLogs(aData);
  };

  useEffect(() => {
    loadAdminData();
  }, [userRole]);

  // RBAC enforcement check
  if (userRole !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border-2 border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Admin Access Restricted</h2>
        <p className="text-slate-600 text-sm">
          You are currently logged in as <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">{userRole}</code>.
          Access to hospital capability settings, system audit logs, and retention policies requires <strong className="text-slate-800">Admin</strong> role.
        </p>
      </div>
    );
  }

  const handleToggleCapability = async (hospitalId: string, key: keyof Hospital, currentVal: boolean | number) => {
    if (typeof currentVal === 'boolean') {
      await updateHospitalCapability(hospitalId, { [key]: !currentVal });
    } else if (typeof currentVal === 'number') {
      const newVal = prompt(`Update ICU beds count:`, String(currentVal));
      if (newVal !== null && !isNaN(Number(newVal))) {
        await updateHospitalCapability(hospitalId, { [key]: Number(newVal) });
      }
    }
    loadAdminData();
  };

  const handleRunRetentionPurge = async () => {
    const res = await purgeExpiredCases(24);
    setPurgeResult(`Retention job executed: ${res.purgedCount} expired test cases purged from database.`);
    loadAdminData();
  };

  return (
    <div className="space-y-6">
      {/* Admin Title & Navigation Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-600 rounded-2xl border border-teal-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">System Administration</h1>
            <p className="text-xs text-slate-500">Hospital capabilities, append-only audit trail, & retention policies</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'hospitals' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospitals ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('triage_config')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'triage_config' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Triage Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('retention')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'retention' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Data Retention</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Hospitals & Emergency Capabilities */}
      {activeTab === 'hospitals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Synthetic Hospital Emergency Capabilities Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Hospital Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Trauma Designation</th>
                  <th className="p-3 text-center">ICU Beds</th>
                  <th className="p-3 text-center">CT Scan</th>
                  <th className="p-3 text-center">MRI</th>
                  <th className="p-3 text-center">Cath Lab</th>
                  <th className="p-3 text-center">Stroke Center</th>
                  <th className="p-3 text-center">Burn Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-slate-900">
                      {h.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{h.phone}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{h.code}</td>
                    <td className="p-3 font-bold text-teal-700">{h.traumaLevel}</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'icuAvailable', h.icuAvailable)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-900"
                      >
                        {h.icuAvailable} beds
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'ctAvailable', h.ctAvailable)}
                        className={`p-1.5 rounded-lg font-bold ${h.ctAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {h.ctAvailable ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto" />}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'mriAvailable', h.mriAvailable)}
                        className={`p-1.5 rounded-lg font-bold ${h.mriAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {h.mriAvailable ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto" />}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'cathLabAvailable', h.cathLabAvailable)}
                        className={`p-1.5 rounded-lg font-bold ${h.cathLabAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {h.cathLabAvailable ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto" />}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'strokeCenter', h.strokeCenter)}
                        className={`p-1.5 rounded-lg font-bold ${h.strokeCenter ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {h.strokeCenter ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto" />}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleCapability(h.id, 'burnUnit', h.burnUnit)}
                        className={`p-1.5 rounded-lg font-bold ${h.burnUnit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {h.burnUnit ? <Check className="w-4 h-4 mx-auto" /> : <X className="w-4 h-4 mx-auto" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: System-Wide Audit Log (Append-Only) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Append-Only Immutable Audit Log</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono font-bold">
              RLS Protection: NO UPDATE / NO DELETE
            </span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded text-[11px] uppercase">
                      {log.action}
                    </span>
                    <span className="text-slate-500 font-medium">Actor: {log.actorRole} ({log.actorId})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <pre className="bg-slate-900 text-teal-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Triage Config Rules Inspection */}
      {activeTab === 'triage_config' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-950">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">{triageRulesConfig.notice}</h4>
              <p className="text-xs text-amber-900">
                Deterministic Red Flag rules are defined in <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">triageRules.json</code>. No AI inference is used.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl">
            <pre className="text-teal-300 font-mono text-xs overflow-x-auto">
              {JSON.stringify(triageRulesConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tab Content 4: Retention Policy & Purge */}
      {activeTab === 'retention' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Data Retention & Auto-Purge Manager</h2>
            <p className="text-xs text-slate-500">
              MediLink automatically purges expired test cases after a 24-hour retention window.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Configured Retention Period:</span>
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg">24 Hours</span>
            </div>

            <button
              onClick={handleRunRetentionPurge}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Run Manual Retention Cleanup Job</span>
            </button>

            {purgeResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium">
                {purgeResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

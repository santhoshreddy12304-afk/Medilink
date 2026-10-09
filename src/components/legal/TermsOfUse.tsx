import React from 'react';
import { ShieldAlert, FileText } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <ShieldAlert className="w-8 h-8 shrink-0 text-red-600" />
        <div>
          <h4 className="font-bold text-lg uppercase tracking-wide">DRAFT PLACEHOLDER - NEEDS LAWYER REVIEW</h4>
          <p className="text-sm text-red-600">
            This document is a temporary prototype draft for demo purposes only and has not been vetted by legal counsel.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <FileText className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Terms of Use</h1>
            <p className="text-sm text-slate-500">Last updated: October 2026 (Draft)</p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">1. Acceptance of Terms</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            By accessing or using the MediLink Safe Emergency Pre-Alert System (&quot;MediLink&quot;), emergency responders, paramedics, and hospital personnel agree to abide by these Terms of Use. If you do not agree to these terms, you may not use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">2. Emergency Operations Limitation</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            MediLink is an emergency pre-alert communication utility designed to send pre-arrival clinical data from ambulances to hospital emergency departments. MediLink is <strong>not</strong> a substitute for public emergency call dispatchers (108/112). In any medical emergency, primary dispatch protocols must be initiated via official emergency telephone numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">3. User Responsibilities & Data Integrity</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Users must ensure that all handover information submitted via the ATMIST form represents true and accurate observations to the best of their clinical knowledge. Misuse or intentional falsification of emergency pre-alerts is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">4. Audit & System Compliance</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            All case creation, triage evaluations, triage overrides, and view events are permanently recorded in an append-only audit log for safety, legal compliance, and quality assurance.
          </p>
        </section>
      </div>
    </div>
  );
};

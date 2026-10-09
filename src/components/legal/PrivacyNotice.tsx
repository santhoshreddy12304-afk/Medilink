import React from 'react';
import { ShieldAlert, Lock, Trash2, Mail, HelpCircle } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <ShieldAlert className="w-8 h-8 shrink-0 text-red-600" />
        <div>
          <h4 className="font-bold text-lg uppercase tracking-wide">DRAFT PLACEHOLDER - NEEDS LAWYER REVIEW</h4>
          <p className="text-sm text-red-600">
            This Privacy Notice is a draft policy template for demo purposes and requires review by qualified legal counsel.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Lock className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Privacy Notice & Data Governance</h1>
            <p className="text-sm text-slate-500">MediLink Patient Data Protection Standard (Draft)</p>
          </div>
        </div>

        {/* Section 1: Data Collected */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">1</span>
            Data Collected
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            MediLink enforces a strict <strong>minimum data collection principle</strong>. In emergency pre-alert handovers, we collect:
          </p>
          <ul className="list-disc pl-6 text-sm text-slate-600 space-y-1">
            <li><strong>Demographics:</strong> Numerical age or age group (Infant, Child, Adult, Elderly). Patient identity defaults to UNKNOWN for emergency handovers unless required.</li>
            <li><strong>ATMIST Clinical Handover:</strong> Incident time, estimated ETA, mechanism of injury, observed injuries, vital signs (HR, BP, SpO2, GCS, Resp Rate), and emergency treatments administered.</li>
            <li><strong>Audit Metadata:</strong> Timestamp, paramedic access token ID, and triage confirmation/override decisions.</li>
          </ul>
        </section>

        {/* Section 2: Purpose of Collection */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">2</span>
            Purpose of Collection
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Collected data is strictly used to notify receiving Emergency Department (ED) staff in advance so resuscitation bays, trauma teams, CT scanners, or cath labs can be prepared prior to patient arrival.
          </p>
        </section>

        {/* Section 3: Data Retention & Auto-Deletion */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-teal-600" />
            3. Data Retention & Auto-Purge Policy
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Emergency pre-alert cases are stored in transient storage and automatically purged after a configurable retention window (default: <strong>24 hours</strong>). Once purged, case records cannot be restored. Audit logs record a <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-slate-700">RETENTION_PURGED</code> event.
          </p>
        </section>

        {/* Section 4: How to Withdraw Consent */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            4. Consent & Consent Withdrawal
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Patient or proxy consent is requested prior to submitting non-anonymized data. For incapacitated, unconscious, or unidentified patients, minimum emergency data collection protocols apply. Patients or legal proxies may request immediate withdrawal of pre-alert records by contacting the grievance officer below.
          </p>
        </section>

        {/* Section 5: Grievance Contact */}
        <section className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-600" />
            5. Grievance Officer & Contact
          </h2>
          <p className="text-xs text-slate-600">
            For privacy inquiries, data deletion requests, or grievance reporting:
          </p>
          <div className="text-xs font-mono text-slate-700 space-y-0.5">
            <p><strong>Officer:</strong> Privacy & Data Protection Officer, MediLink Core</p>
            <p><strong>Email:</strong> privacy-grievance@medilink-demo.org</p>
            <p><strong>Address:</strong> MediLink Digital Health Foundation, Jubilee Hills, Hyderabad, TG, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};

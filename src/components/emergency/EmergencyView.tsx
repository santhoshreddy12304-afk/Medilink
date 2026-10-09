import React, { useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmergencyView: React.FC = () => {
  const { profile, setCurrentView } = useApp();
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);

  const emergencySymptoms = [
    {
      title: 'Chest Discomfort or Pressure',
      description: 'Sensation of tightness, squeezing, or severe pressure in the center of the chest.',
      urgency: 'HIGH CRITICAL',
      guidance: 'Sit down, stay calm, and dial 112 immediately. Do not attempt to drive yourself to a hospital.'
    },
    {
      title: 'Severe Difficulty Breathing',
      description: 'Gasping for air, inability to speak full sentences, or blue lips/fingertips.',
      urgency: 'HIGH CRITICAL',
      guidance: 'Position yourself upright, loosen tight clothing around the neck, and dial 112 immediately.'
    },
    {
      title: 'Signs of Stroke (F.A.S.T.)',
      description: 'Facial drooping, Arm weakness on one side, Speech difficulty or slurring.',
      urgency: 'HIGH CRITICAL',
      guidance: 'Note the time symptoms started and dial 112 immediately. Immediate hospital response is vital.'
    },
    {
      title: 'Unconsciousness or Fainting',
      description: 'Sudden loss of responsiveness or inability to wake up.',
      urgency: 'HIGH CRITICAL',
      guidance: 'Ensure person is lying flat on their back, check breathing, and dial 112 right away.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* 1. TOP URGENT EMERGENCY BANNER */}
      <div className="bg-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden border border-rose-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                CRITICAL RESPONSE PROTOCOL
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Emergency Care Support</h1>
              <p className="text-xs text-rose-100 mt-1">
                National Emergency Number in India: <strong className="text-white">112</strong>
              </p>
            </div>
          </div>

          <a
            href="tel:112"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-rose-700 font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-3 shrink-0"
          >
            <PhoneCall className="w-5 h-5 text-rose-600" />
            <span>Call 112 (India) Now</span>
          </a>
        </div>
      </div>

      {/* 2. PROTOTYPE NON-DISPATCH WARNING BOX */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>PROTOTYPE DISCLAIMER • NO AUTOMATIC DISPATCH</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          MediLink AI is a prototype web application and <strong>does NOT automatically contact ambulances, hospitals, or emergency dispatch services</strong>. In any life-threatening situation, use your device to call 112 or local emergency services directly.
        </p>
      </div>

      {/* 3. CONFIGURED EMERGENCY CONTACT FROM PROFILE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Your Configured Emergency Contact</h2>
              <p className="text-xs text-slate-500">From Health Profile</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('profile')}
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            Edit in Profile →
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {profile?.emergencyContactName || 'Sam Morgan'}
            </h3>
            <p className="text-xs text-slate-500">
              {profile?.emergencyContactRelation || 'Spouse'} • Primary Contact
            </p>
          </div>

          <a
            href={`tel:${profile?.emergencyContactPhone || '+919876500000'}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-teal-400" />
            <span>Call {profile?.emergencyContactPhone || '+91 98765 00000'}</span>
          </a>
        </div>
      </div>

      {/* 4. HIGH-RISK CRITICAL SYMPTOM SCREENER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Urgent Red-Flag Symptom Guidance</h2>
          </div>
          <p className="text-xs text-slate-500">
            Click a symptom below for immediate action instructions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencySymptoms.map((sym, i) => (
            <div
              key={i}
              onClick={() => setSelectedSymptom(selectedSymptom === sym.title ? null : sym.title)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                selectedSymptom === sym.title
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{sym.title}</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {sym.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{sym.description}</p>
              
              {selectedSymptom === sym.title && (
                <div className="pt-2 border-t border-rose-200 text-xs text-rose-950 space-y-2 animate-in fade-in duration-200">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" /> Immediate Protocol:
                  </p>
                  <p className="bg-white p-3 rounded-xl border border-rose-200 font-medium">
                    {sym.guidance}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

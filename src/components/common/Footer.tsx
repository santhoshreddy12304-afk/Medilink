import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, AlertCircle, FileText, Lock, Stethoscope } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">MediLink Core</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Safe Emergency Pre-Alert Foundation. Connecting paramedic ambulances directly with receiving hospital emergency departments for deterministic triage and pre-arrival preparations.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Row-Level Security • Append-Only Audit Logs • Synthetic Data Only</span>
            </div>
          </div>

          {/* Col 2: Legal Draft Pages */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Legal & Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentView('terms')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Terms of Use (Draft)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('privacy')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Privacy Notice (Draft)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('disclaimer')} className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Medical Disclaimer (Draft)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Numbers */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Emergency Hotline</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Demo system. Not a replacement for 108/112. In a real emergency call 108/112 immediately.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-semibold text-sm transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>Call Ambulance: 108</span>
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl font-semibold text-sm transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Emergency Helpline: 112</span>
              </a>
            </div>
          </div>
        </div>

        {/* Safety Notice Banner */}
        <div className="bg-amber-950/60 rounded-2xl p-4 border border-amber-800/60 mb-8 flex flex-col sm:flex-row items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 space-y-1">
            <p className="font-semibold text-amber-100">Permanent Safety Guarantee & Demographics Rule</p>
            <p className="text-amber-300/80 leading-normal">
              Demo system. Not a replacement for 108/112. In a real emergency call 108/112. MediLink uses synthetic seed data only with no real patient data. Minimum necessary patient data is collected, and cases auto-delete after a configurable 24-hour retention window.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediLink Core. Stage 1 Emergency Pre-Alert System.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('terms')} className="hover:text-slate-300">Terms</button>
            <span>•</span>
            <button onClick={() => setCurrentView('privacy')} className="hover:text-slate-300">Privacy</button>
            <span>•</span>
            <button onClick={() => setCurrentView('disclaimer')} className="hover:text-slate-300">Disclaimer</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

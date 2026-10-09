import React from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DisclaimerBanner: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="bg-amber-950/90 text-amber-100 text-xs py-2.5 px-4 shadow-inner border-b border-amber-800/60 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            SAFETY NOTICE
          </span>
          <p className="text-amber-100 font-medium">
            Demo system. Not a replacement for 108/112. In a real emergency call 108/112.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('disclaimer')}
            className="flex items-center gap-1.5 font-semibold text-amber-300 hover:text-white transition-colors underline text-[11px]"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Clinical Disclaimer</span>
          </button>

          <span className="text-amber-700 hidden sm:inline">|</span>

          <a
            href="tel:108"
            className="flex items-center gap-1.5 font-bold text-rose-300 hover:text-rose-200 transition-colors bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-700/50"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Call 108 / 112 Now</span>
          </a>
        </div>
      </div>
    </div>
  );
};

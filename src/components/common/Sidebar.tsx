import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Calendar, 
  User, 
  ShieldAlert, 
  Home, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewMode } from '../../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const menuItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'assistant', label: 'AI Health Assistant', icon: <Bot className="w-5 h-5" />, badge: 'Demo AI' },
    { id: 'doctors', label: 'Doctor Discovery', icon: <Calendar className="w-5 h-5" /> },
    { id: 'profile', label: 'Health Profile', icon: <User className="w-5 h-5" /> },
    { id: 'emergency', label: 'Emergency Support', icon: <ShieldAlert className="w-5 h-5 text-rose-500" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Patient Portal
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              const isEmergency = item.id === 'emergency';
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? isEmergency
                        ? 'bg-rose-50 text-rose-700 font-bold shadow-2xs'
                        : 'bg-teal-50 text-teal-800 font-bold shadow-2xs border border-teal-100'
                      : isEmergency
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quick Actions
          </p>
          <button
            onClick={() => setCurrentView('landing')}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-slate-400" />
              <span>Back to Landing</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stage 1 Helper Box */}
      <div className="p-4 m-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-teal-500/20 text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-100">Stage 1 Prototype</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          MediLink Core Stage 1 Foundation with deterministic triage & append-only audit logging.
        </p>
      </div>
    </aside>
  );
};

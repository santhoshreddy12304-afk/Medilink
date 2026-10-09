import React, { useState } from 'react';
import { 
  Ambulance, Stethoscope, ShieldCheck, HeartPulse, Menu, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewMode } from '../../types';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, setUserRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; role?: 'paramedic' | 'ed_staff' | 'admin' }[] = [
    { id: 'paramedic', label: 'Paramedic Handover', icon: <Ambulance className="w-4 h-4 text-teal-600" />, role: 'paramedic' },
    { id: 'ed_staff', label: 'ED Staff Live Feed', icon: <Stethoscope className="w-4 h-4 text-red-500" />, role: 'ed_staff' },
    { id: 'admin', label: 'Admin Portal', icon: <ShieldCheck className="w-4 h-4 text-amber-500" />, role: 'admin' },
  ];

  const legalItems: { id: ViewMode; label: string }[] = [
    { id: 'terms', label: 'Terms' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'disclaimer', label: 'Medical Disclaimer' },
  ];

  const handleNav = (view: ViewMode, role?: 'paramedic' | 'ed_staff' | 'admin') => {
    if (role) setUserRole(role);
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & tagline */}
          <div 
            onClick={() => handleNav('paramedic', 'paramedic')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">MediLink</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  CORE STAGE 1
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Safe Emergency Pre-Alert Foundation
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id, item.role)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Legal Links */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
            {legalItems.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className="hover:text-teal-700 hover:underline px-2 py-1 transition"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl space-y-2">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id, item.role)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  currentView === item.id ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            {legalItems.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

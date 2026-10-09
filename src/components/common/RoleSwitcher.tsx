import React from 'react';
import type { UserRole } from '../../types';
import { Shield, Ambulance, Stethoscope, Lock } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div className="bg-slate-900 text-white py-2 px-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-teal-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Active Role:
        </span>
        <span className="font-mono bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 font-bold">
          {currentRole.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
        <button
          onClick={() => onRoleChange('paramedic')}
          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-[11px] ${
            currentRole === 'paramedic' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ambulance className="w-3 h-3" />
          <span>Paramedic Link</span>
        </button>

        <button
          onClick={() => onRoleChange('ed_staff')}
          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-[11px] ${
            currentRole === 'ed_staff' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-3 h-3" />
          <span>ED Staff</span>
        </button>

        <button
          onClick={() => onRoleChange('admin')}
          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-[11px] ${
            currentRole === 'admin' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => onRoleChange('unauthorized')}
          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-[11px] ${
            currentRole === 'unauthorized' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>No Role (Blocked)</span>
        </button>
      </div>
    </div>
  );
};

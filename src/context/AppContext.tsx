import React, { createContext, useContext, useEffect, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { profileService } from '../services/profileService';
import type { Appointment, UserProfile, ViewMode, UserRole } from '../types';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  profile: UserProfile | null;
  appointments: Appointment[];
  loadingAppointments: boolean;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshAppointments: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  bookAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'isDemo'>) => Promise<Appointment>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  prefilledDoctorForBooking: string | null;
  setPrefilledDoctorForBooking: (doctorId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('paramedic');
  const [userRole, setUserRole] = useState<UserRole>('paramedic');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [prefilledDoctorForBooking, setPrefilledDoctorForBooking] = useState<string | null>(null);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (e) {
      console.error('Failed loading profile demo data', e);
    }
  };

  const refreshAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (e) {
      console.error('Failed loading appointments demo data', e);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'isDemo'>
  ): Promise<Appointment> => {
    const created = await appointmentService.createAppointment(data);
    await refreshAppointments();
    showToast(`Demo Appointment requested with ${created.doctorName}!`, 'success');
    return created;
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await profileService.updateProfile(data);
    setProfile(updated);
    showToast('Demo health profile saved successfully.', 'success');
    return updated;
  };

  useEffect(() => {
    refreshProfile();
    refreshAppointments();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        userRole,
        setUserRole,
        profile,
        appointments,
        loadingAppointments,
        toasts,
        showToast,
        removeToast,
        refreshAppointments,
        refreshProfile,
        bookAppointment,
        updateUserProfile,
        prefilledDoctorForBooking,
        setPrefilledDoctorForBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

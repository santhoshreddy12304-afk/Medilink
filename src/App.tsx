import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';

import { ParamedicHandover } from './components/paramedic/ParamedicHandover';
import { EDStaffView } from './components/dashboard/EDStaffView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TermsOfUse } from './components/legal/TermsOfUse';
import { PrivacyNotice } from './components/legal/PrivacyNotice';
import { MedicalDisclaimer } from './components/legal/MedicalDisclaimer';

import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssistantView } from './components/assistant/AssistantView';
import { DoctorDiscoveryView } from './components/doctors/DoctorDiscoveryView';
import { ProfileView } from './components/profile/ProfileView';
import { EmergencyView } from './components/emergency/EmergencyView';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView, userRole, setUserRole } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Permanent Safety Banner: "Demo system. Not a replacement for 108/112." */}
      <DisclaimerBanner />

      {/* Role Switcher Bar for testing Paramedic, ED Staff, Admin, Unauthorized roles */}
      <RoleSwitcher 
        currentRole={userRole} 
        onRoleChange={(newRole) => {
          setUserRole(newRole);
          if (newRole === 'paramedic') setCurrentView('paramedic');
          else if (newRole === 'ed_staff') setCurrentView('ed_staff');
          else if (newRole === 'admin') setCurrentView('admin');
        }} 
      />

      {/* Global Header */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'paramedic' && <ParamedicHandover />}
        {currentView === 'ed_staff' && <EDStaffView userRole={userRole} />}
        {currentView === 'admin' && <AdminDashboard userRole={userRole} />}
        
        {currentView === 'terms' && <TermsOfUse />}
        {currentView === 'privacy' && <PrivacyNotice />}
        {currentView === 'disclaimer' && <MedicalDisclaimer />}

        {currentView === 'landing' && <LandingView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'assistant' && <AssistantView />}
        {currentView === 'doctors' && <DoctorDiscoveryView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'emergency' && <EmergencyView />}
      </main>

      {/* Global Legal & Safety Footer */}
      <Footer />

      {/* Toast Feedback Alerts */}
      <ToastContainer />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;

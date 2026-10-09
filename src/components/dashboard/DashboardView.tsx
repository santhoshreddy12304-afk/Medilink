import React from 'react';
import { 
  Activity, 
  Bot, 
  Calendar, 
  User, 
  ShieldAlert, 
  Clock, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Heart,
  Droplet,
  Thermometer,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockHealthMetrics as MOCK_HEALTH_METRICS, mockRecentActivities as MOCK_RECENT_ACTIVITIES } from '../../data/mockHealthStats';

export const DashboardView: React.FC = () => {
  const { setCurrentView, profile, appointments, setPrefilledDoctorForBooking } = useApp();

  const handleBookNewDoctor = () => {
    setPrefilledDoctorForBooking(null);
    setCurrentView('doctors');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. WELCOME HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              STAGE 1 DEMO PORTAL
            </span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Prototype Data Only
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {profile?.name || 'Alex Morgan'}
          </h1>
          <p className="text-slate-600 text-sm">
            Here is your health overview, demo activities, and quick access to AI guidance.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setCurrentView('assistant')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Launch AI Assistant</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. DEMO HEALTH OVERVIEW CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Demo Health Vitals Summary</h2>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            Demo Readings • Non-Medical
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_HEALTH_METRICS.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{metric.name}</span>
                <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  {metric.name.includes('Pressure') && <Heart className="w-4 h-4" />}
                  {metric.name.includes('Heart') && <Activity className="w-4 h-4" />}
                  {metric.name.includes('Sugar') && <Droplet className="w-4 h-4" />}
                  {metric.name.includes('SpO2') && <Thermometer className="w-4 h-4" />}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{metric.value}</span>
                  <span className="text-xs font-semibold text-slate-500">{metric.unit}</span>
                </div>
                <p className="text-xs font-medium text-emerald-600 mt-0.5">{metric.change}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{metric.lastUpdated}</span>
                <span className="font-semibold text-teal-600">Demo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. QUICK ACTIONS & HERO ASSISTANT ENTRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Action 1 */}
              <button
                onClick={() => setCurrentView('assistant')}
                className="flex items-start gap-4 p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-50 border border-teal-100 text-left transition-all group"
              >
                <div className="p-3 rounded-xl bg-teal-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ask Health AI</h3>
                  <p className="text-xs text-slate-600 mt-1">Get lifestyle guidance and symptom information.</p>
                </div>
              </button>

              {/* Action 2 */}
              <button
                onClick={handleBookNewDoctor}
                className="flex items-start gap-4 p-4 rounded-2xl bg-sky-50/60 hover:bg-sky-50 border border-sky-100 text-left transition-all group"
              >
                <div className="p-3 rounded-xl bg-sky-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Find Doctor</h3>
                  <p className="text-xs text-slate-600 mt-1">Browse specialties and request demo consultations.</p>
                </div>
              </button>

              {/* Action 3 */}
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 text-left transition-all group"
              >
                <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Health Profile</h3>
                  <p className="text-xs text-slate-600 mt-1">Manage allergies, notes, and emergency contact.</p>
                </div>
              </button>

              {/* Action 4 */}
              <button
                onClick={() => setCurrentView('emergency')}
                className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/60 hover:bg-rose-50 border border-rose-100 text-left transition-all group"
              >
                <div className="p-3 rounded-xl bg-rose-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Emergency Support</h3>
                  <p className="text-xs text-slate-600 mt-1">Direct 112 calling protocol & instructions.</p>
                </div>
              </button>

            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <span className="text-xs text-slate-500 font-medium">Session History</span>
            </div>

            <div className="divide-y divide-slate-100">
              {MOCK_RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      {activity.type === 'chat' && <Bot className="w-4 h-4 text-teal-600" />}
                      {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-sky-600" />}
                      {activity.type === 'profile_update' && <User className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{activity.title}</h4>
                      <p className="text-xs text-slate-500">{activity.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 block">
                      {activity.badgeText}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Upcoming Appointments & Assistant Banner (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upcoming Appointment Area */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-bold text-slate-900">Scheduled Consultations</h2>
              </div>
              <button
                onClick={handleBookNewDoctor}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Demo</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-600">No scheduled appointments yet</p>
                <button
                  onClick={handleBookNewDoctor}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Explore Doctor Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.doctorAvatar}
                          alt={app.doctorName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{app.doctorName}</h4>
                          <p className="text-xs text-teal-700 font-semibold">{app.doctorSpecialty}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {app.mode.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.date} • {app.time}</span>
                      </div>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Scheduled (Demo)
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-500 italic px-1">
                        "{app.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Assistant Banner Entry Point */}
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">MediLink Health Assistant</h3>
                <p className="text-xs text-teal-300">Rule-Based Demo Engine</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Have a lifestyle or cold symptom query? Start a session with our assistant for structured advice & preparation checklists.
            </p>

            <button
              onClick={() => setCurrentView('assistant')}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Chat Interface</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

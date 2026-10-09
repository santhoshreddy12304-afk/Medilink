import React from 'react';
import { 
  Bot, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Stethoscope, 
  PhoneCall, 
  Clock, 
  HeartPulse
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-white pt-12 pb-16 md:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>MediLink AI • Stage 1 Platform Foundation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your Health. <br />
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  One Intelligent Platform.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl leading-relaxed">
                Connect your wellness journey to preliminary AI guidance, verified provider discovery, health monitoring, and immediate emergency protocols in one cohesive healthcare ecosystem.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('assistant')}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25 hover:shadow-xl transition-all"
                >
                  <Bot className="w-5 h-5" />
                  <span>Explore Health Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentView('doctors')}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-xs hover:shadow transition-all"
                >
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span>Find a Doctor</span>
                </button>
              </div>

              {/* Safety Badges */}
              <div className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Responsible Safety Guardrails</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Stage 2 & 3 Backend Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>24/7 Emergency Dial Integration</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
                  
                  {/* Demo Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                        <HeartPulse className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Health Assistant Demo</h3>
                        <p className="text-xs text-slate-500">Interactive Rule Engine</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </div>

                  {/* Sample Query Bubble */}
                  <div className="space-y-3">
                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tr-none text-xs text-slate-700 max-w-[85%] ml-auto font-medium">
                      "What steps should I take to maintain cardiovascular wellness?"
                    </div>

                    <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl rounded-tl-none space-y-2 max-w-[95%]">
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                        <Bot className="w-4 h-4" />
                        <span>MediLink AI Response</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Cardiovascular wellness starts with 150 minutes of aerobic exercise weekly, balanced fiber-rich nutrition, and routine screening...
                      </p>
                      <div className="pt-2 border-t border-teal-200/60 flex justify-between items-center text-[10px] text-teal-700 font-semibold">
                        <span>• Educational Guidance Only</span>
                        <button 
                          onClick={() => setCurrentView('assistant')}
                          className="underline hover:text-teal-900"
                        >
                          Try Interactive Assistant →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Shortcut Bar */}
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">Patient Portal Demo</p>
                      <p className="text-[10px] text-slate-400">View Vitals, Appointments & Profile</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Open Demo Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-teal-600">Integrated Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Patient Clarity & Clinical Safety
          </h3>
          <p className="text-slate-600 text-sm">
            MediLink AI brings preliminary guidance, appointment discovery, and emergency preparedness together into one cohesive experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: AI Assistant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Health Guidance</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ask wellness questions, explore common cold symptoms, and receive structured checklist preparation for doctor visits.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('assistant')}
              className="pt-4 flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Health Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Health Overview</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor key health metrics, log personal allergy notes, and view structured activity history in your portal.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="pt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>View Portal Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Doctor Discovery */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Doctor Discovery</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Search specialists by qualifications, review consultation modes (in-person or online), and test demo bookings.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('doctors')}
              className="pt-4 flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700"
            >
              <span>Search Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Emergency Support */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Emergency Support</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Immediate instructions for life-threatening symptoms with direct one-touch 112 calling for India.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('emergency')}
              className="pt-4 flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700"
            >
              <span>Emergency Protocol</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Simple 3-Step Process</span>
            <h2 className="text-3xl font-extrabold tracking-tight">How MediLink AI Works</h2>
            <p className="text-slate-400 text-sm">
              Empowering users with structured health clarity from first query to doctor consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Ask or Search</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Type your lifestyle question, common symptom query, or doctor specialty search into the MediLink AI platform.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Receive Safety-First Insights</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Get educational self-care tips, red-flag warnings for severe symptoms, and preparation notes for your doctor visit.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-white">Connect & Take Action</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Filter verified doctors, request demo consultations, or trigger national 112 emergency calls if urgent support is required.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRIVACY & RESPONSIBLE AI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Ethical AI & Data Governance</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Built on Responsible AI & Patient Safety Standards
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              MediLink AI is engineered with medical safety rules at its core. Our platform never replaces professional medical evaluation or delays emergency care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No Binding Diagnoses
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI responses provide preliminary educational insights only and clearly state uncertainty.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Local Prototype Privacy
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stage 1 does not transmit sensitive medical records to cloud servers. Data stays in local browser demo storage.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Stage 2 Architecture Ready
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prepared for Firebase authentication, Firestore encryption, and server-side AI API keys in Stage 2.
              </p>
            </div>
          </div>

          {/* CTA Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="text-xs text-slate-400">
                Ready to explore the Stage 1 prototype?
              </span>
            </div>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-colors shadow-md"
            >
              Enter Patient Dashboard Demo →
            </button>
          </div>

        </div>
      </section>

      {/* 5. EMERGENCY QUICK ACTION CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-rose-950">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base">Facing an Urgent Medical Emergency?</h4>
              <p className="text-xs text-rose-800">
                For severe breathing trouble, chest pain, stroke symptoms, or severe injuries, call 112 immediately.
              </p>
            </div>
          </div>
          <a
            href="tel:112"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shrink-0 text-center transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 (India)</span>
          </a>
        </div>
      </section>

    </div>
  );
};

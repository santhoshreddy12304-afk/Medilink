import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Video, 
  Building, 
  Calendar, 
  CheckCircle2, 
  X, 
  Award, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

export const DoctorDiscoveryView: React.FC = () => {
  const { bookAppointment, prefilledDoctorForBooking, setPrefilledDoctorForBooking } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All Specialties');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Selected Doctor for Booking Modal
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  
  // Form State for Appointment Request Modal
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [patientEmail, setPatientEmail] = useState('alex.morgan.demo@medilink.app');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-15');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [consultationMode, setConsultationMode] = useState<'in-person' | 'online'>('online');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<boolean>(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getDoctors(searchQuery, selectedSpecialty);
      setDoctors(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doctorService.getSpecialties().then(setSpecialties);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery, selectedSpecialty]);

  useEffect(() => {
    if (prefilledDoctorForBooking) {
      doctorService.getDoctorById(prefilledDoctorForBooking).then((doc) => {
        if (doc) setSelectedDoctorForBooking(doc);
      });
    }
  }, [prefilledDoctorForBooking]);

  const openBookingModal = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    setFormErrors({});
  };

  const closeBookingModal = () => {
    setSelectedDoctorForBooking(null);
    setPrefilledDoctorForBooking(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!patientName.trim()) errors.patientName = 'Patient name is required.';
    if (!patientPhone.trim()) errors.patientPhone = 'Phone number is required.';
    if (!patientEmail.trim() || !patientEmail.includes('@')) errors.patientEmail = 'Valid email is required.';
    if (!appointmentDate) errors.appointmentDate = 'Please select a date.';
    if (!appointmentTime) errors.appointmentTime = 'Please select a time slot.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedDoctorForBooking) return;

    setIsSubmitting(true);
    try {
      await bookAppointment({
        doctorId: selectedDoctorForBooking.id,
        doctorName: selectedDoctorForBooking.name,
        doctorSpecialty: selectedDoctorForBooking.specialty,
        doctorAvatar: selectedDoctorForBooking.avatarUrl,
        patientName,
        patientPhone,
        patientEmail,
        date: appointmentDate,
        time: appointmentTime,
        mode: consultationMode,
        notes: notes.trim()
      });

      setSelectedDoctorForBooking(null);
      setBookingSuccessModal(true);
    } catch {
      // Prototype error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Discovery</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                Demo Provider Profiles
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              Search verified sample doctors by specialty, review consultation modes, and request demo appointments.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-2xl max-w-xs">
            <span className="font-bold text-slate-700">Notice:</span> Sample doctor profiles are for prototype interaction. Bookings are not sent to real medical practices.
          </div>
        </div>

        {/* 2. SEARCH BAR & FILTERS */}
        <div className="pt-2 space-y-4">
          
          {/* Input Search */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital, or city..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Specialty:</span>
            </div>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. DOCTOR CARDS GRID */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Clock className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Loading demo doctor profiles...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching demo doctors found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or selecting "All Specialties".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('All Specialties');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative"
            >
              {/* Card Header & Avatar */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-700">{doc.specialty}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    DEMO
                  </span>
                </div>

                {/* Qualifications & Hospital */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doc.qualifications} ({doc.experienceYears} yrs exp)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.location}</span>
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs text-slate-500 line-clamp-2 italic">
                  "{doc.bio}"
                </p>

                {/* Consultation Modes & Languages */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {doc.consultationModes.includes('online') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold text-[11px]">
                        <Video className="w-3 h-3" /> Online
                      </span>
                    )}
                    {doc.consultationModes.includes('in-person') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold text-[11px]">
                        <Building className="w-3 h-3" /> In-Person
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-slate-900">{doc.consultationFee}</span>
                </div>
              </div>

              {/* Booking CTA Button */}
              <button
                onClick={() => openBookingModal(doc)}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Demo Appointment</span>
              </button>

            </div>
          ))}
        </div>
      )}

      {/* 4. BOOKING MODAL */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Request Demo Appointment</h3>
                <p className="text-xs text-slate-500">With {selectedDoctorForBooking.name}</p>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor Info Card */}
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
              <img
                src={selectedDoctorForBooking.avatarUrl}
                alt={selectedDoctorForBooking.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900">{selectedDoctorForBooking.name}</p>
                <p className="text-teal-700 font-semibold">{selectedDoctorForBooking.specialty}</p>
                <p className="text-slate-500">{selectedDoctorForBooking.hospital}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl flex items-center gap-2 text-[11px]">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Demo Interaction:</strong> This booking is a prototype demonstration. No real appointment will be scheduled.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50"
                />
                {formErrors.patientName && <p className="text-rose-600 text-[10px] mt-1">{formErrors.patientName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50"
                  />
                  {formErrors.patientPhone && <p className="text-rose-600 text-[10px] mt-1">{formErrors.patientPhone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50"
                  />
                  {formErrors.patientEmail && <p className="text-rose-600 text-[10px] mt-1">{formErrors.patientEmail}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50"
                  />
                  {formErrors.appointmentDate && <p className="text-rose-600 text-[10px] mt-1">{formErrors.appointmentDate}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time *</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 bg-white"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                  {formErrors.appointmentTime && <p className="text-rose-600 text-[10px] mt-1">{formErrors.appointmentTime}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationMode('online')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      consultationMode === 'online'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Online Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationMode('in-person')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      consultationMode === 'in-person'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>In-Person Clinic</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Symptoms (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your concern briefly for the doctor..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Demo Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SUCCESS CONFIRMATION MODAL */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Demo Booking Confirmed!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your appointment request has been recorded in your local demo portal. You can view scheduled details on your Patient Dashboard.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200">
              ⚡ <strong>Stage 1 Note:</strong> This was a demo simulation. No emails or SMS messages were sent to providers.
            </div>
            <button
              onClick={() => setBookingSuccessModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close Confirmation
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

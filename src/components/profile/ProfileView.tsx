import React, { useState } from 'react';
import { 
  User, 
  ShieldAlert, 
  Save, 
  Edit3, 
  Lock, 
  Heart, 
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { profile, updateUserProfile } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || 'Alex Morgan (Demo User)');
  const [email, setEmail] = useState(profile?.email || 'alex.morgan.demo@medilink.app');
  const [ageRange, setAgeRange] = useState(profile?.ageRange || '25-34');
  const [gender, setGender] = useState(profile?.gender || 'Prefer not to say');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(profile?.allergies || 'Penicillin, Dust Mites');
  const [chronicConditions, setChronicConditions] = useState(profile?.chronicConditions || 'Mild Seasonal Asthma');
  const [emergencyContactName, setEmergencyContactName] = useState(profile?.emergencyContactName || 'Sam Morgan');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile?.emergencyContactPhone || '+91 98765 00000');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(profile?.emergencyContactRelation || 'Spouse');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!emergencyContactPhone.trim()) errs.emergencyContactPhone = 'Emergency contact phone is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await updateUserProfile({
        name,
        email,
        ageRange,
        gender,
        bloodGroup,
        allergies,
        chronicConditions,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation
      });
      setIsEditing(false);
    } catch {
      // Prototype fallback
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Health Profile</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Demo Storage
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Manage your personal demo profile, optional health notes, and emergency contact details.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all ${
            isEditing
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
          }`}
        >
          {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile Form'}</span>
        </button>
      </div>

      {/* 2. DEMO PROTOTYPE SECURITY & OPTIONAL DATA WARNING */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
        <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="space-y-0.5">
          <p className="font-bold">Prototype Local Storage Notice</p>
          <p className="text-amber-800">
            This Stage 1 application stores data strictly in your local browser storage for demonstration purposes. Browser storage is not encrypted medical-record storage. Please do not enter real sensitive health data.
          </p>
        </div>
      </div>

      {/* 3. PROFILE FORM */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
              {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
              {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Age Range</label>
              <select
                disabled={!isEditing}
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600 bg-white"
              >
                <option value="Under 18">Under 18</option>
                <option value="18-24">18 - 24</option>
                <option value="25-34">25 - 34</option>
                <option value="35-44">35 - 44</option>
                <option value="45-54">45 - 54</option>
                <option value="55-64">55 - 64</option>
                <option value="65+">65+</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Gender (Optional)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Optional Health Notes Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-slate-900">Optional Health Details</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">All fields optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Blood Group</label>
              <select
                disabled={!isEditing}
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Known Allergies (Demo Notes)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Dust, Penicillin"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">Relevant Health Notes / Conditions</label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Seasonal asthma, regular hypertension tracking notes..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Emergency Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Contact Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Contact Phone *</label>
              <input
                type="text"
                disabled={!isEditing}
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
              {errors.emergencyContactPhone && <p className="text-rose-600 text-[10px] mt-1">{errors.emergencyContactPhone}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Relationship</label>
              <input
                type="text"
                disabled={!isEditing}
                value={emergencyContactRelation}
                onChange={(e) => setEmergencyContactRelation(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Demo Profile'}</span>
            </button>
          </div>
        )}

      </form>

    </div>
  );
};

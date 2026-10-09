import type { Hospital } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'h0000000-0000-0000-0000-000000000001',
    name: 'City General Hospital & Trauma Center',
    code: 'CGH-01',
    address: '124 Healthcare Boulevard, City Center',
    phone: '+91 40 5551 0100',
    location: { lat: 17.3850, lng: 78.4867 },
    traumaLevel: 'Level 1 Trauma Center',
    icuAvailable: 14,
    ctAvailable: true,
    mriAvailable: true,
    cathLabAvailable: true,
    strokeCenter: true,
    burnUnit: false,
    isDiverted: false,
    edLoadScore: 0.45,
  },
  {
    id: 'h0000000-0000-0000-0000-000000000002',
    name: 'Apollo Emergency Care Institute',
    code: 'AEC-02',
    address: '45 Jubilee Hills Road, West Zone',
    phone: '+91 40 5552 0200',
    location: { lat: 17.4325, lng: 78.4072 },
    traumaLevel: 'Level 1 Trauma Center',
    icuAvailable: 10,
    ctAvailable: true,
    mriAvailable: true,
    cathLabAvailable: true,
    strokeCenter: true,
    burnUnit: true,
    isDiverted: false,
    edLoadScore: 0.60,
  },
  {
    id: 'h0000000-0000-0000-0000-000000000003',
    name: 'Sunrise Super Specialty Hospital',
    code: 'SSS-03',
    address: '88 High Tech City Rd, East District',
    phone: '+91 40 5553 0300',
    location: { lat: 17.4485, lng: 78.3758 },
    traumaLevel: 'Level 2 Trauma Center',
    icuAvailable: 6,
    ctAvailable: true,
    mriAvailable: false,
    cathLabAvailable: true,
    strokeCenter: false,
    burnUnit: false,
    isDiverted: false,
    edLoadScore: 0.30,
  },
  {
    id: 'h0000000-0000-0000-0000-000000000004',
    name: 'St. Jude Community Hospital',
    code: 'SJC-04',
    address: '12 Old Town Square, South Ward',
    phone: '+91 40 5554 0400',
    location: { lat: 17.3616, lng: 78.4747 },
    traumaLevel: 'Level 3 Emergency Care',
    icuAvailable: 3,
    ctAvailable: true,
    mriAvailable: false,
    cathLabAvailable: false,
    strokeCenter: false,
    burnUnit: false,
    isDiverted: false,
    edLoadScore: 0.20,
  },
  {
    id: 'h0000000-0000-0000-0000-000000000005',
    name: 'Metropolitan Neuro & Cardiac Hospital',
    code: 'MNC-05',
    address: '302 Expressway Plaza, North Station',
    phone: '+91 40 5555 0500',
    location: { lat: 17.4399, lng: 78.4983 },
    traumaLevel: 'Level 1 Trauma Center',
    icuAvailable: 18,
    ctAvailable: true,
    mriAvailable: true,
    cathLabAvailable: true,
    strokeCenter: true,
    burnUnit: false,
    isDiverted: false,
    edLoadScore: 0.50,
  },
];

let localHospitalsStore = [...INITIAL_HOSPITALS];

export async function fetchHospitals(): Promise<Hospital[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('hospitals').select('*');
      if (!error && data && data.length > 0) {
        return data.map((h) => ({
          id: h.id,
          name: h.name,
          code: h.code,
          address: h.address,
          phone: h.phone,
          traumaLevel: h.trauma_level,
          icuAvailable: h.icu_available,
          ctAvailable: h.ct_available,
          mriAvailable: h.mri_available,
          cathLabAvailable: h.cath_lab_available,
          strokeCenter: h.stroke_center,
          burnUnit: h.burn_unit,
          location: { lat: h.lat || 17.3850, lng: h.lng || 78.4867 },
          isDiverted: h.is_diverted || false,
          edLoadScore: h.ed_load_score || 0.4,
        }));
      }
    } catch {
      // Fall back to local store on error
    }
  }
  return localHospitalsStore;
}

export async function updateHospitalCapability(
  id: string,
  capabilities: Partial<Hospital>
): Promise<Hospital | null> {
  if (isSupabaseConfigured && supabase) {
    const payload: Record<string, unknown> = {};
    if (capabilities.icuAvailable !== undefined) payload.icu_available = capabilities.icuAvailable;
    if (capabilities.ctAvailable !== undefined) payload.ct_available = capabilities.ctAvailable;
    if (capabilities.mriAvailable !== undefined) payload.mri_available = capabilities.mriAvailable;
    if (capabilities.cathLabAvailable !== undefined) payload.cath_lab_available = capabilities.cathLabAvailable;
    if (capabilities.strokeCenter !== undefined) payload.stroke_center = capabilities.strokeCenter;
    if (capabilities.burnUnit !== undefined) payload.burn_unit = capabilities.burnUnit;
    if (capabilities.isDiverted !== undefined) payload.is_diverted = capabilities.isDiverted;
    if (capabilities.edLoadScore !== undefined) payload.ed_load_score = capabilities.edLoadScore;

    await supabase.from('hospitals').update(payload).eq('id', id);
  }

  const index = localHospitalsStore.findIndex((h) => h.id === id);
  if (index !== -1) {
    localHospitalsStore[index] = { ...localHospitalsStore[index], ...capabilities };
    return localHospitalsStore[index];
  }
  return null;
}

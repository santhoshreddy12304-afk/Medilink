import type { EmergencyCase, UserRole, ATMISTData, TriageLevel } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { evaluateTriage } from './triageEngine';
import { logAuditEvent } from './auditService';
import { checkRateLimit } from './rateLimiter';
import { INITIAL_HOSPITALS } from './hospitalService';

export const INITIAL_SYNTHETIC_CASES: EmergencyCase[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    accessToken: 'token-case-001',
    hospitalId: 'h0000000-0000-0000-0000-000000000001',
    hospitalName: 'City General Hospital & Trauma Center',
    atmist: {
      age: 45,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      etaMinutes: 10,
      mechanism: 'Chest Pain with Sweating / Diaphoresis',
      injuries: 'Acute retrosternal chest pain radiating to left arm, heavy sweating',
      vitalSigns: { hr: 110, bpSys: 145, bpDia: 95, spo2: 96, gcs: 15, respRate: 22 },
      treatmentGiven: 'High-flow Oxygen 4L/min, Aspirin 300mg chewable, ECG attached',
      consentObtained: true,
    },
    initialTriage: 'RED',
    finalTriage: 'RED',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    accessToken: 'token-case-002',
    hospitalId: 'h0000000-0000-0000-0000-000000000001',
    hospitalName: 'City General Hospital & Trauma Center',
    atmist: {
      age: 68,
      ageGroup: 'ELDERLY',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      etaMinutes: 12,
      mechanism: 'FAST Stroke Symptoms',
      injuries: 'Sudden right-sided arm weakness, face droop, slurred speech',
      vitalSigns: { hr: 88, bpSys: 178, bpDia: 102, spo2: 97, gcs: 14, respRate: 18 },
      treatmentGiven: 'Elevated head 30 deg, IV line 18G left arm, capillary blood glucose 110 mg/dL',
      consentObtained: true,
    },
    initialTriage: 'RED',
    finalTriage: 'RED',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    accessToken: 'token-case-003',
    hospitalId: 'h0000000-0000-0000-0000-000000000002',
    hospitalName: 'Apollo Emergency Care Institute',
    atmist: {
      age: 28,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      etaMinutes: 8,
      mechanism: 'Major Road Traffic Accident (High-Speed Collision)',
      injuries: 'Polytrauma: severe leg deformity, active femoral bleeding, blunt chest trauma',
      vitalSigns: { hr: 132, bpSys: 90, bpDia: 58, spo2: 93, gcs: 12, respRate: 28 },
      treatmentGiven: 'Tourniquet applied right thigh, 2x large bore IV, 1L Normal Saline wide open, Cervical collar',
      consentObtained: true,
    },
    initialTriage: 'RED',
    finalTriage: 'RED',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    accessToken: 'token-case-004',
    hospitalId: 'h0000000-0000-0000-0000-000000000002',
    hospitalName: 'Apollo Emergency Care Institute',
    atmist: {
      ageGroup: 'UNKNOWN',
      isMinor: false,
      isUnknownIdentity: true,
      incidentTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      etaMinutes: 5,
      mechanism: 'Found Unresponsive in Public Park',
      injuries: 'Unconscious adult male, no obvious trauma signs, pin-point pupils',
      vitalSigns: { hr: 52, bpSys: 96, bpDia: 60, spo2: 88, gcs: 6, respRate: 8 },
      treatmentGiven: 'Bag-valve-mask ventilation with O2, IV Naloxone 0.4mg IV push administered',
      consentObtained: true,
    },
    initialTriage: 'RED',
    finalTriage: 'RED',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    accessToken: 'token-case-005',
    hospitalId: 'h0000000-0000-0000-0000-000000000003',
    hospitalName: 'Sunrise Super Specialty Hospital',
    atmist: {
      age: 34,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      etaMinutes: 18,
      mechanism: 'Isolated Lower Limb Fracture (Low Velocity Fall)',
      injuries: 'Closed left tibia fracture, moderate localized pain, neurovascularly intact',
      vitalSigns: { hr: 78, bpSys: 122, bpDia: 78, spo2: 99, gcs: 15, respRate: 16 },
      treatmentGiven: 'Vacuum splint applied to left leg, Paracetamol 1g IV drip',
      consentObtained: true,
    },
    initialTriage: 'YELLOW',
    finalTriage: 'YELLOW',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    accessToken: 'token-case-006',
    hospitalId: 'h0000000-0000-0000-0000-000000000003',
    hospitalName: 'Sunrise Super Specialty Hospital',
    atmist: {
      age: 7,
      ageGroup: 'CHILD',
      isMinor: true,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      etaMinutes: 14,
      mechanism: 'Asthma Exacerbation / Moderate Respiratory Distress',
      injuries: 'Bilateral wheezing, intercostal retractions, speaking in short phrases',
      vitalSigns: { hr: 124, bpSys: 105, bpDia: 68, spo2: 92, gcs: 15, respRate: 32 },
      treatmentGiven: 'Salbutamol 2.5mg nebulization with oxygen, Hydrocortisone IV',
      consentObtained: true,
    },
    initialTriage: 'YELLOW',
    finalTriage: 'RED',
    overrideReason: 'Paramedic judgment: Paediatric patient with rapid tire sign',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    accessToken: 'token-case-007',
    hospitalId: 'h0000000-0000-0000-0000-000000000004',
    hospitalName: 'St. Jude Community Hospital',
    atmist: {
      age: 52,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      etaMinutes: 22,
      mechanism: 'Abdominal Pain & Vomiting',
      injuries: 'Right lower quadrant abdominal tenderness, low-grade fever',
      vitalSigns: { hr: 82, bpSys: 128, bpDia: 82, spo2: 98, gcs: 15, respRate: 16 },
      treatmentGiven: 'IV line 20G, Ondansetron 4mg IV, IV fluids 500mL',
      consentObtained: true,
    },
    initialTriage: 'YELLOW',
    finalTriage: 'YELLOW',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    accessToken: 'token-case-008',
    hospitalId: 'h0000000-0000-0000-0000-000000000004',
    hospitalName: 'St. Jude Community Hospital',
    atmist: {
      age: 61,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      etaMinutes: 0,
      mechanism: 'Acute Syncope Post-Exertion',
      injuries: 'Brief loss of consciousness (10s), currently fully alert, normal ECG',
      vitalSigns: { hr: 72, bpSys: 118, bpDia: 76, spo2: 98, gcs: 15, respRate: 14 },
      treatmentGiven: 'IV access, continuous cardiac monitoring, glucose checked (104 mg/dL)',
      consentObtained: true,
    },
    initialTriage: 'YELLOW',
    finalTriage: 'YELLOW',
    consentObtained: true,
    status: 'ARRIVED',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    accessToken: 'token-case-009',
    hospitalId: 'h0000000-0000-0000-0000-000000000005',
    hospitalName: 'Metropolitan Neuro & Cardiac Hospital',
    atmist: {
      age: 72,
      ageGroup: 'ELDERLY',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      etaMinutes: 9,
      mechanism: 'Acute Hypertensive Crisis & Severe Headache',
      injuries: 'Sudden occipital headache, severe hypertension, lightheadedness',
      vitalSigns: { hr: 96, bpSys: 210, bpDia: 125, spo2: 96, gcs: 15, respRate: 20 },
      treatmentGiven: 'Quiet environment, IV line, oxygen 2L/min, neuro vitals every 5 mins',
      consentObtained: true,
    },
    initialTriage: 'RED',
    finalTriage: 'RED',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000010',
    accessToken: 'token-case-010',
    hospitalId: 'h0000000-0000-0000-0000-000000000005',
    hospitalName: 'Metropolitan Neuro & Cardiac Hospital',
    atmist: {
      age: 19,
      ageGroup: 'ADULT',
      isMinor: false,
      isUnknownIdentity: false,
      incidentTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      etaMinutes: 15,
      mechanism: 'Superficial Partial Thickness Burn (Right Arm)',
      injuries: '1st and 2nd degree thermal burn right forearm, ~4% TBSA',
      vitalSigns: { hr: 84, bpSys: 120, bpDia: 80, spo2: 99, gcs: 15, respRate: 16 },
      treatmentGiven: 'Cooled with sterile saline, non-adherent sterile dressing applied',
      consentObtained: true,
    },
    initialTriage: 'YELLOW',
    finalTriage: 'YELLOW',
    consentObtained: true,
    status: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

let localCasesStore = [...INITIAL_SYNTHETIC_CASES];

/**
 * Fetch cases for ED staff or Admin. Enforces Role-Based Access Control (RBAC).
 */
export async function fetchCases(userRole: UserRole): Promise<EmergencyCase[]> {
  if (userRole !== 'ed_staff' && userRole !== 'admin') {
    // RBAC: Unauthorized users / paramedics without token cannot list all cases
    return [];
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('cases').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          accessToken: c.access_token,
          hospitalId: c.hospital_id,
          atmist: {
            age: c.patient_age,
            ageGroup: c.patient_age_group,
            isMinor: c.is_minor,
            isUnknownIdentity: c.is_unknown_identity,
            incidentTime: c.incident_time,
            etaMinutes: c.eta_minutes,
            mechanism: c.mechanism,
            injuries: c.injuries,
            vitalSigns: c.vital_signs,
            treatmentGiven: c.treatment_given,
            consentObtained: c.consent_obtained,
          },
          initialTriage: c.initial_triage,
          finalTriage: c.final_triage,
          overrideReason: c.override_reason,
          consentObtained: c.consent_obtained,
          status: c.status,
          createdAt: c.created_at,
          expiresAt: c.expires_at,
        }));
      }
    } catch {
      // Fallback
    }
  }

  return [...localCasesStore];
}

/**
 * Fetch single case by paramedic access token.
 */
export async function getCaseByToken(token: string): Promise<EmergencyCase | null> {
  const found = localCasesStore.find((c) => c.accessToken === token);
  if (found) return { ...found };
  return null;
}

/**
 * Create or Submit Emergency Case via Paramedic Handover Form.
 */
export async function submitParamedicCase(
  token: string,
  hospitalId: string,
  atmist: ATMISTData,
  finalTriageChoice?: TriageLevel,
  overrideReason?: string
): Promise<{ success: boolean; caseItem?: EmergencyCase; error?: string }> {
  // 1. Check Rate Limit
  const rateLimit = checkRateLimit(token);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${rateLimit.resetInSeconds} seconds before submitting again.`,
    };
  }

  // 2. Evaluate Triage Deterministically
  const triageResult = evaluateTriage({
    gcs: atmist.vitalSigns.gcs,
    isUnresponsive: atmist.vitalSigns.gcs ? atmist.vitalSigns.gcs < 13 : false,
    hasSevereBleeding: /severe bleeding|uncontrolled bleeding|arterial bleeding|massive hemorrhage/i.test(atmist.injuries),
    hasChestPainWithSweating: /chest pain.*sweat/i.test(atmist.mechanism),
    isMajorTrauma: /high[- ]speed|fall from height|height fall|penetrating|crush|major trauma/i.test(atmist.mechanism),
    spo2: atmist.vitalSigns.spo2,
    mechanism: atmist.mechanism,
    injuries: atmist.injuries,
  });

  const initialTriage = triageResult.category;
  const finalTriage = finalTriageChoice || initialTriage;

  // Validate override reason if triage overridden
  if (initialTriage !== finalTriage && (!overrideReason || overrideReason.trim().length < 5)) {
    return {
      success: false,
      error: 'A valid clinical override reason (at least 5 characters) is mandatory when altering the suggested triage category.',
    };
  }

  const hospitalObj = INITIAL_HOSPITALS.find((h) => h.id === hospitalId);
  const hospitalName = hospitalObj ? hospitalObj.name : 'Target Emergency Hospital';

  const caseId = `c${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const newCase: EmergencyCase = {
    id: caseId,
    accessToken: token,
    hospitalId,
    hospitalName,
    atmist,
    initialTriage,
    finalTriage,
    overrideReason: initialTriage !== finalTriage ? overrideReason : undefined,
    consentObtained: atmist.consentObtained,
    status: 'IN_TRANSIT',
    createdAt: now.toISOString(),
    expiresAt,
  };

  localCasesStore.unshift(newCase);

  // 3. Append to Audit Log (Immutable)
  await logAuditEvent(caseId, 'paramedic', token, 'CASE_CREATED', {
    hospitalId,
    hospitalName,
    initialTriage,
    finalTriage,
    triggeredRedFlags: triageResult.triggeredRedFlags,
    consentObtained: atmist.consentObtained,
  });

  await logAuditEvent(caseId, 'paramedic', token, 'TRIAGE_CALCULATED', {
    notice: triageResult.notice,
    suggestedTriage: initialTriage,
    redFlags: triageResult.triggeredRedFlags,
  });

  if (initialTriage !== finalTriage) {
    await logAuditEvent(caseId, 'paramedic', token, 'TRIAGE_OVERRIDDEN', {
      initialTriage,
      finalTriage,
      overrideReason,
    });
  }

  return { success: true, caseItem: newCase };
}

/**
 * Updates destination hospital when paramedic accepts a dynamic reroute suggestion.
 * Fully audited with REROUTE_ACCEPTED.
 */
export async function updateCaseDestination(
  caseId: string,
  newHospitalId: string,
  newHospitalName: string,
  token: string,
  reason: string
): Promise<{ success: boolean; caseItem?: EmergencyCase }> {
  const caseItem = localCasesStore.find((c) => c.id === caseId);
  if (!caseItem) {
    return { success: false };
  }

  const previousHospitalId = caseItem.hospitalId;
  const previousHospitalName = caseItem.hospitalName;

  caseItem.hospitalId = newHospitalId;
  caseItem.hospitalName = newHospitalName;

  await logAuditEvent(caseId, 'paramedic', token, 'REROUTE_ACCEPTED', {
    previousHospitalId,
    previousHospitalName,
    newHospitalId,
    newHospitalName,
    reason,
    timestamp: new Date().toISOString(),
  });

  return { success: true, caseItem };
}

export type ViewMode = 
  | 'landing' 
  | 'dashboard' 
  | 'assistant' 
  | 'doctors' 
  | 'profile' 
  | 'emergency'
  | 'paramedic'
  | 'ed_staff'
  | 'admin'
  | 'terms'
  | 'privacy'
  | 'disclaimer';

export type UserRole = 'paramedic' | 'ed_staff' | 'admin' | 'unauthorized';
export type TriageLevel = 'RED' | 'YELLOW';
export type CaseStatus = 'IN_TRANSIT' | 'ARRIVED' | 'HANDOVER_COMPLETE' | 'CANCELLED';
export type LanguageCode = 'en' | 'te' | 'hi';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  location: GeoCoordinates;
  traumaLevel: string;
  icuAvailable: number;
  ctAvailable: boolean;
  mriAvailable: boolean;
  cathLabAvailable: boolean;
  strokeCenter: boolean;
  burnUnit: boolean;
  isDiverted: boolean;
  edLoadScore?: number; // 0 (empty) to 1 (full capacity)
}

export interface RouteEstimate {
  hospitalId: string;
  distanceKm: number;
  durationMinutes: number;
  source: 'GOOGLE_ROUTES' | 'LAST_KNOWN' | 'STRAIGHT_LINE_FALLBACK';
  isLiveTraffic: boolean;
  cached: boolean;
}

export interface HospitalRankingResult {
  hospital: Hospital;
  route: RouteEstimate;
  hardFilterPassed: boolean;
  filterFailureReasons: string[];
  totalScore: number; // 0 to 100, higher is better
  reasonSummary: string; // One-line human clinical rationale
}

export interface VitalSigns {
  hr?: number;
  bpSys?: number;
  bpDia?: number;
  spo2?: number;
  gcs?: number;
  respRate?: number;
}

export interface ATMISTData {
  age?: number;
  ageGroup: 'INFANT' | 'CHILD' | 'ADULT' | 'ELDERLY' | 'UNKNOWN';
  isMinor: boolean;
  isUnknownIdentity: boolean;
  incidentTime: string;
  etaMinutes: number; // Stamped as ETA (Estimate) in UI
  mechanism: string;
  injuries: string;
  vitalSigns: VitalSigns;
  treatmentGiven: string;
  consentObtained: boolean;
}

export interface EmergencyCase {
  id: string;
  accessToken: string;
  hospitalId: string;
  hospitalName?: string;
  atmist: ATMISTData;
  initialTriage: TriageLevel;
  finalTriage: TriageLevel;
  overrideReason?: string;
  consentObtained: boolean;
  status: CaseStatus;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLogEntry {
  id: string;
  caseId: string;
  actorRole: UserRole;
  actorId: string;
  action: 
    | 'CASE_CREATED' 
    | 'TRIAGE_CALCULATED' 
    | 'TRIAGE_OVERRIDDEN' 
    | 'CASE_VIEWED_BY_ED' 
    | 'RETENTION_PURGED'
    | 'GPS_TRACKING_EVENT'
    | 'REROUTE_SUGGESTED'
    | 'REROUTE_ACCEPTED';
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  location: string;
  hospital: string;
  consultationModes: ('in-person' | 'online')[];
  availability: string;
  avatarUrl: string;
  bio: string;
  languages: string[];
  consultationFee: string;
  isDemo: true;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: string;
  time: string;
  mode: 'in-person' | 'online';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  isDemo: true;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  sources?: string[];
  isEmergencyWarning?: boolean;
  isDemoResponse: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  ageRange: string;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  isDemo: true;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'attention' | 'optimal';
  change: string;
  lastUpdated: string;
}

export interface ActivityItem {
  id: string;
  type: 'chat' | 'appointment' | 'profile_update' | 'emergency_check';
  title: string;
  subtitle: string;
  timestamp: string;
  badgeText?: string;
}

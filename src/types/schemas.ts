import { z } from 'zod';

export const vitalSignsSchema = z.object({
  hr: z.number().min(20).max(300).optional(),
  bpSys: z.number().min(30).max(300).optional(),
  bpDia: z.number().min(20).max(200).optional(),
  spo2: z.number().min(30).max(100).optional(),
  gcs: z.number().min(3).max(15).optional(),
  respRate: z.number().min(4).max(60).optional(),
});

export const atmistFormSchema = z.object({
  hospitalId: z.string().min(1, 'Target hospital selection is required'),
  age: z.number().min(0).max(120).optional(),
  ageGroup: z.enum(['INFANT', 'CHILD', 'ADULT', 'ELDERLY', 'UNKNOWN']),
  isMinor: z.boolean(),
  isUnknownIdentity: z.boolean(),
  incidentTime: z.string().min(1, 'Incident time is required'),
  etaMinutes: z.number().min(1, 'ETA must be at least 1 minute').max(300, 'ETA maximum 300 minutes'),
  mechanism: z.string().min(3, 'Mechanism description is required'),
  injuries: z.string().min(3, 'Injuries/Issues description is required'),
  vitalSigns: vitalSignsSchema,
  treatmentGiven: z.string().min(2, 'Treatment administered is required'),
  consentObtained: z.boolean().refine((val) => val === true, {
    message: 'Patient or proxy consent (or emergency minimum data rule acknowledgement) is required',
  }),
});

export const triageOverrideSchema = z.object({
  finalTriage: z.enum(['RED', 'YELLOW']),
  overrideReason: z.string().min(5, 'Override reason must be at least 5 characters long when overriding suggested triage'),
});

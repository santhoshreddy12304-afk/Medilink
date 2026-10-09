-- MediLink Synthetic Seed Data
-- Synthetic Seed Data Only: 5 Hospitals & 10 Fake Cases. No Real Patient Data Anywhere.

-- 1. SEED 5 SYNTHETIC HOSPITALS
INSERT INTO public.hospitals (id, name, code, address, phone, trauma_level, icu_available, ct_available, mri_available, cath_lab_available, stroke_center, burn_unit)
VALUES
  ('h0000000-0000-0000-0000-000000000001', 'City General Hospital & Trauma Center', 'CGH-01', '124 Healthcare Boulevard, City Center', '+91 40 5551 0100', 'Level 1 Trauma Center', 14, true, true, true, true, false),
  ('h0000000-0000-0000-0000-000000000002', 'Apollo Emergency Care Institute', 'AEC-02', '45 Jubilee Hills Road, West Zone', '+91 40 5552 0200', 'Level 1 Trauma Center', 10, true, true, true, true, true),
  ('h0000000-0000-0000-0000-000000000003', 'Sunrise Super Specialty Hospital', 'SSS-03', '88 High Tech City Rd, East District', '+91 40 5553 0300', 'Level 2 Trauma Center', 6, true, false, true, false, false),
  ('h0000000-0000-0000-0000-000000000004', 'St. Jude Community Hospital', 'SJC-04', '12 Old Town Square, South Ward', '+91 40 5554 0400', 'Level 3 Emergency Care', 3, true, false, false, false, false),
  ('h0000000-0000-0000-0000-000000000005', 'Metropolitan Neuro & Cardiac Hospital', 'MNC-05', '302 Expressway Plaza, North Station', '+91 40 5555 0500', 'Level 1 Trauma Center', 18, true, true, true, true, false)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED 10 SYNTHETIC FAKE EMERGENCY CASES
INSERT INTO public.cases (id, access_token, hospital_id, patient_age, patient_age_group, is_minor, is_unknown_identity, incident_time, eta_minutes, mechanism, injuries, vital_signs, treatment_given, initial_triage, final_triage, override_reason, consent_obtained, status)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'token-case-001',
    'h0000000-0000-0000-0000-000000000001',
    45, 'ADULT', false, false, NOW() - INTERVAL '15 minutes', 10,
    'Chest Pain with Sweating / Diaphoresis',
    'Acute retrosternal chest pain radiating to left arm, heavy sweating',
    '{"hr": 110, "bp_sys": 145, "bp_dia": 95, "spo2": 96, "gcs": 15, "resp_rate": 22}'::jsonb,
    'High-flow Oxygen 4L/min, Aspirin 300mg chewable, ECG attached',
    'RED', 'RED', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'token-case-002',
    'h0000000-0000-0000-0000-000000000001',
    68, 'ELDERLY', false, false, NOW() - INTERVAL '25 minutes', 12,
    'FAST Stroke Symptoms',
    'Sudden right-sided arm weakness, face droop, slurred speech',
    '{"hr": 88, "bp_sys": 178, "bp_dia": 102, "spo2": 97, "gcs": 14, "resp_rate": 18}'::jsonb,
    'Elevated head 30 deg, IV line 18G left arm, capillary blood glucose 110 mg/dL',
    'RED', 'RED', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'token-case-003',
    'h0000000-0000-0000-0000-000000000002',
    28, 'ADULT', false, false, NOW() - INTERVAL '10 minutes', 8,
    'Major Road Traffic Accident (High-Speed Collision)',
    'Polytrauma: severe leg deformity, active femoral bleeding, blunt chest trauma',
    '{"hr": 132, "bp_sys": 90, "bp_dia": 58, "spo2": 93, "gcs": 12, "resp_rate": 28}'::jsonb,
    'Tourniquet applied right thigh, 2x large bore IV, 1L Normal Saline wide open, Cervical collar',
    'RED', 'RED', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'token-case-004',
    'h0000000-0000-0000-0000-000000000002',
    NULL, 'UNKNOWN', false, true, NOW() - INTERVAL '30 minutes', 5,
    'Found Unresponsive in Public Park',
    'Unconscious adult male, no obvious trauma signs, pin-point pupils',
    '{"hr": 52, "bp_sys": 96, "bp_dia": 60, "spo2": 88, "gcs": 6, "resp_rate": 8}'::jsonb,
    'Bag-valve-mask ventilation with O2, IV Naloxone 0.4mg IV push administered',
    'RED', 'RED', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'token-case-005',
    'h0000000-0000-0000-0000-000000000003',
    34, 'ADULT', false, false, NOW() - INTERVAL '12 minutes', 18,
    'Isolated Lower Limb Fracture (Low Velocity Fall)',
    'Closed left tibia fracture, moderate localized pain, neurovascularly intact',
    '{"hr": 78, "bp_sys": 122, "bp_dia": 78, "spo2": 99, "gcs": 15, "resp_rate": 16}'::jsonb,
    'Vacuum splint applied to left leg, Paracetamol 1g IV drip',
    'YELLOW', 'YELLOW', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'token-case-006',
    'h0000000-0000-0000-0000-000000000003',
    7, 'CHILD', true, false, NOW() - INTERVAL '20 minutes', 14,
    'Asthma Exacerbation / Moderate Respiratory Distress',
    'Bilateral wheezing, intercostal retractions, speaking in short phrases',
    '{"hr": 124, "bp_sys": 105, "bp_dia": 68, "spo2": 92, "gcs": 15, "resp_rate": 32}'::jsonb,
    'Salbutamol 2.5mg nebulization with oxygen, Hydrocortisone IV',
    'YELLOW', 'RED', 'Paramedic judgment: Paediatric patient with rapid tire sign', true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'token-case-007',
    'h0000000-0000-0000-0000-000000000004',
    52, 'ADULT', false, false, NOW() - INTERVAL '40 minutes', 22,
    'Abdominal Pain & Vomiting',
    'Right lower quadrant abdominal tenderness, low-grade fever',
    '{"hr": 82, "bp_sys": 128, "bp_dia": 82, "spo2": 98, "gcs": 15, "resp_rate": 16}'::jsonb,
    'IV line 20G, Ondansetron 4mg IV, IV fluids 500mL',
    'YELLOW', 'YELLOW', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'token-case-008',
    'h0000000-0000-0000-0000-000000000004',
    61, 'ADULT', false, false, NOW() - INTERVAL '50 minutes', 0,
    'Acute Syncope Post-Exertion',
    'Brief loss of consciousness (10s), currently fully alert, normal ECG',
    '{"hr": 72, "bp_sys": 118, "bp_dia": 76, "spo2": 98, "gcs": 15, "resp_rate": 14}'::jsonb,
    'IV access, continuous cardiac monitoring, glucose checked (104 mg/dL)',
    'YELLOW', 'YELLOW', NULL, true, 'ARRIVED'
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'token-case-009',
    'h0000000-0000-0000-0000-000000000005',
    72, 'ELDERLY', false, false, NOW() - INTERVAL '18 minutes', 9,
    'Acute Hypertensive Crisis & Severe Headache',
    'Sudden occipital headache, severe hypertension, lightheadedness',
    '{"hr": 96, "bp_sys": 210, "bp_dia": 125, "spo2": 96, "gcs": 15, "resp_rate": 20}'::jsonb,
    'Quiet environment, IV line, oxygen 2L/min, neuro vitals every 5 mins',
    'RED', 'RED', NULL, true, 'IN_TRANSIT'
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'token-case-010',
    'h0000000-0000-0000-0000-000000000005',
    19, 'ADULT', false, false, NOW() - INTERVAL '5 minutes', 15,
    'Superficial Partial Thickness Burn (Right Arm)',
    '1st and 2nd degree thermal burn right forearm, ~4% TBSA',
    '{"hr": 84, "bp_sys": 120, "bp_dia": 80, "spo2": 99, "gcs": 15, "resp_rate": 16}'::jsonb,
    'Cooled with sterile saline, non-adherent sterile dressing applied',
    'YELLOW', 'YELLOW', NULL, true, 'IN_TRANSIT'
  )
ON CONFLICT (access_token) DO NOTHING;

-- 3. SEED AUDIT LOGS FOR SYNTHETIC CASES
INSERT INTO public.audit_logs (case_id, actor_role, actor_id, action, payload)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'paramedic', 'token-case-001', 'CASE_CREATED', '{"triage": "RED", "mechanism": "Chest Pain with Sweating"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'paramedic', 'token-case-001', 'TRIAGE_CALCULATED', '{"rule_triggered": "Chest Pain with Sweating", "result": "RED"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000006', 'paramedic', 'token-case-006', 'CASE_CREATED', '{"triage": "YELLOW"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000006', 'paramedic', 'token-case-006', 'TRIAGE_OVERRIDDEN', '{"initial": "YELLOW", "final": "RED", "reason": "Paediatric patient with rapid tire sign"}'::jsonb);

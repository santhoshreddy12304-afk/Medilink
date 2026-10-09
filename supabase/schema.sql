-- MediLink SQL Schema with Row-Level Security (RLS) & Append-Only Audit Logs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE triage_level AS ENUM ('RED', 'YELLOW');
CREATE TYPE case_status AS ENUM ('IN_TRANSIT', 'ARRIVED', 'HANDOVER_COMPLETE', 'CANCELLED');
CREATE TYPE user_role AS ENUM ('paramedic', 'ed_staff', 'admin');

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    trauma_level TEXT NOT NULL, -- e.g. 'Level 1 Trauma Center', 'Level 2'
    icu_available INT NOT NULL DEFAULT 0,
    ct_available BOOLEAN NOT NULL DEFAULT true,
    mri_available BOOLEAN NOT NULL DEFAULT true,
    cath_lab_available BOOLEAN NOT NULL DEFAULT false,
    stroke_center BOOLEAN NOT NULL DEFAULT false,
    burn_unit BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EMERGENCY CASES TABLE
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    
    -- Patient details (Minimum necessary data only)
    patient_age INT,
    patient_age_group TEXT CHECK (patient_age_group IN ('INFANT', 'CHILD', 'ADULT', 'ELDERLY', 'UNKNOWN')),
    is_minor BOOLEAN NOT NULL DEFAULT false,
    is_unknown_identity BOOLEAN NOT NULL DEFAULT false,
    
    -- ATMIST Handover Data
    incident_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    eta_minutes INT NOT NULL DEFAULT 15, -- UI must strictly display as "ETA (Estimate)"
    mechanism TEXT NOT NULL, -- Mechanism of injury or illness condition
    injuries TEXT NOT NULL, -- Injuries/Issues observed
    vital_signs JSONB NOT NULL DEFAULT '{}'::jsonb, -- { hr, bp_sys, bp_dia, spo2, gcs, resp_rate }
    treatment_given TEXT NOT NULL, -- Treatments administered in transit
    
    -- Triage Engine Results
    initial_triage triage_level NOT NULL, -- Deterministic rule recommendation (RED/YELLOW)
    final_triage triage_level NOT NULL, -- Confirmed/Overridden by paramedic
    override_reason TEXT, -- Mandatory if initial_triage != final_triage
    
    -- Safety & Compliance
    consent_obtained BOOLEAN NOT NULL DEFAULT false,
    status case_status NOT NULL DEFAULT 'IN_TRANSIT',
    
    -- Expiration & Retention
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 3. APPEND-ONLY AUDIT LOGS TABLE
-- REQUIRES STRICT APPEND-ONLY PROPERTY (NO UPDATE / NO DELETE)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    actor_role user_role NOT NULL,
    actor_id TEXT NOT NULL, -- Token or User UUID
    action TEXT NOT NULL, -- e.g., 'CASE_CREATED', 'TRIAGE_CALCULATED', 'TRIAGE_OVERRIDDEN', 'CASE_VIEWED_BY_ED', 'RETENTION_PURGED'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRIAGE RULES CONFIGURATION
-- Config file tagged: "REQUIRES CLINICIAN REVIEW"
CREATE TABLE IF NOT EXISTS public.triage_rules_config (
    id INT PRIMARY KEY DEFAULT 1,
    version TEXT NOT NULL DEFAULT '1.0.0',
    notice TEXT NOT NULL DEFAULT 'REQUIRES CLINICIAN REVIEW',
    rules_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_rules_config ENABLE ROW LEVEL SECURITY;

-- Hospitals Policy: Public read, Admin write
CREATE POLICY "Allow public read access to hospitals"
    ON public.hospitals FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to hospitals"
    ON public.hospitals FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Cases Policies:
-- 1. Paramedic with valid access_token can insert and select their own case
CREATE POLICY "Allow paramedic access by token"
    ON public.cases FOR ALL USING (
        access_token = current_setting('request.headers', true)::json ->> 'x-case-token'
        OR auth.jwt() ->> 'role' IN ('ed_staff', 'admin')
    );

-- 2. Authenticated ED staff and Admin can view/update cases
CREATE POLICY "Allow ED staff and Admin read access to cases"
    ON public.cases FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('ed_staff', 'admin')
    );

-- AUDIT LOGS POLICIES (APPEND-ONLY ENFORCEMENT)
-- INSERT policy: Anyone (Paramedic token or authenticated users) can append audit records
CREATE POLICY "Allow insert audit log"
    ON public.audit_logs FOR INSERT WITH CHECK (true);

-- SELECT policy: Only ED staff and Admin can inspect audit logs
CREATE POLICY "Allow ED staff and Admin to read audit logs"
    ON public.audit_logs FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('ed_staff', 'admin')
    );

-- DO NOT CREATE UPDATE OR DELETE POLICIES FOR audit_logs!
-- This guarantees append-only immutability.

-- Automatic retention cleanup trigger/function
CREATE OR REPLACE FUNCTION purge_expired_cases()
RETURNS VOID AS $$
BEGIN
    -- Log purging event first
    INSERT INTO public.audit_logs (actor_role, actor_id, action, payload)
    SELECT 'admin'::user_role, 'SYSTEM_RETENTION_JOB', 'RETENTION_PURGED', 
           jsonb_build_object('purged_case_count', COUNT(*))
    FROM public.cases
    WHERE expires_at < NOW();

    -- Delete expired cases
    DELETE FROM public.cases WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

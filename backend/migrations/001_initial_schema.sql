-- ═══════════════════════════════════════════════════════════════
-- PMAS — Dual-Vault PostgreSQL Schema
-- Vault A: Identity (PII) — patient credentials, demographics, consent
-- Vault B: Clinical & Telemetry — medications, adherence, symptoms
-- Bridge: Encrypted relational keys link vaults only during auth sessions
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension for unguessable primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── VAULT A: IDENTITY & ACCESS CONTROL ───────────────────────

-- 1. Users & Access Control
CREATE TYPE user_role AS ENUM ('patient', 'pharmacist', 'admin');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles & DPDP Consent Audit
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    hospital_mrn VARCHAR(50),
    full_name VARCHAR(100) NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(5),
    known_allergies TEXT,
    chronic_conditions TEXT,
    consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    consent_checks JSONB,
    consent_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── VAULT B: CLINICAL & TELEMEDICRY (HEOR) ───────────────────

-- 3. Transition-of-Care Medication Regimens
CREATE TABLE IF NOT EXISTS medication_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES users(id),
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency_morning BOOLEAN DEFAULT FALSE,
    frequency_afternoon BOOLEAN DEFAULT FALSE,
    frequency_night BOOLEAN DEFAULT FALSE,
    morning_time TIME,
    afternoon_time TIME,
    night_time TIME,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    instructions_localized TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Adherence Tracking (Taken/Delayed/Missed)
CREATE TYPE dose_status AS ENUM ('taken', 'delayed', 'missed');

CREATE TABLE IF NOT EXISTS adherence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medication_plans(id) ON DELETE CASCADE,
    dose_date DATE NOT NULL,
    dose_slot VARCHAR(10) NOT NULL CHECK (dose_slot IN ('morning', 'afternoon', 'night')),
    status dose_status NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, medication_id, dose_date, dose_slot)
);

-- 5. Real-Time Symptom & Telemetry
CREATE TABLE IF NOT EXISTS symptom_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
    systolic_bp INT,
    diastolic_bp INT,
    temperature NUMERIC(4,1),
    weight_kg NUMERIC(5,2),
    symptoms_observed TEXT,
    side_effects TEXT,
    additional_notes TEXT,
    red_flag_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── COMPLIANCE & AUDIT ───────────────────────────────────────

-- 7. Security Audit Trail (DPDP mandatory)
CREATE TABLE IF NOT EXISTS security_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performed_by UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Study Metadata (for HEOR research exports)
CREATE TABLE IF NOT EXISTS study_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    study_id VARCHAR(20) UNIQUE NOT NULL,
    baseline_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_medication_patient ON medication_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_adherence_patient_date ON adherence_records(patient_id, dose_date);
CREATE INDEX IF NOT EXISTS idx_symptom_patient_date ON symptom_telemetry(patient_id, log_date);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON security_audit_trail(performed_by);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, appointment_date);

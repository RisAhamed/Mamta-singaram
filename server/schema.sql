-- Drop existing tables in dependency order (children first) - Phase 1 additions first
DROP TABLE IF EXISTS patient_ledger_entries;
DROP TABLE IF EXISTS lab_entries;
DROP TABLE IF EXISTS surgery_notes;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS session_surgery_forms;
DROP TABLE IF EXISTS consultation_forms;
DROP TABLE IF EXISTS session_files;
DROP TABLE IF EXISTS dental_chart_entries;
DROP TABLE IF EXISTS session_doctors;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS surgery_forms;
DROP TABLE IF EXISTS facial_bones;
DROP TABLE IF EXISTS lab_vendors;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;

-- doctors
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  registration_date DATE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male','Female','Other')),
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  allergies TEXT,
  medical_history TEXT,
  medical_conditions TEXT,
  current_medications TEXT,
  previous_dental_history TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  age INTEGER,
  weight NUMERIC(5,2),
  blood_pressure TEXT,
  blood_sugar NUMERIC(6,2),
  pulse_rate INTEGER,
  spo2 NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- locations (master - reusable, user-addable)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- lab_vendors (master)
CREATE TABLE lab_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- facial_bones (master) - seeded with client defaults
CREATE TABLE facial_bones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- surgery_forms (framework for future forms)
CREATE TABLE surgery_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  file_url TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sessions (extended with session-specific location - historical snapshot)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type TEXT NOT NULL DEFAULT 'New' CHECK (visit_type IN ('New','Follow-up','Emergency','Routine Checkup')),
  followup_of UUID REFERENCES sessions(id) ON DELETE SET NULL,
  chief_complaint TEXT NOT NULL,
  diagnosis TEXT,
  treatment_given TEXT,
  injection_given BOOLEAN DEFAULT false,
  injection_details TEXT,
  treatment_cost NUMERIC(10,2) DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Partial','Paid')),
  notes TEXT,
  next_visit_date DATE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  location_name TEXT,
  age INTEGER,
  weight NUMERIC(5,2),
  blood_pressure TEXT,
  blood_sugar NUMERIC(6,2),
  pulse_rate INTEGER,
  spo2 NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- session_doctors
CREATE TABLE session_doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- dental_chart_entries
CREATE TABLE dental_chart_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  tooth_number TEXT,
  procedure_done TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- session_files
CREATE TABLE session_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- consultation_forms
CREATE TABLE consultation_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  form_label TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  signature_url TEXT,
  storage_path TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT now()
);

-- appointments (true appointment entity)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled','Completed','Cancelled','No-Show')),
  notes TEXT,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  location_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- surgery_notes (dedicated, not merged with sessions.notes)
CREATE TABLE surgery_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  facial_bone_id UUID REFERENCES facial_bones(id) ON DELETE SET NULL,
  facial_bone_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- lab_entries (extended: product, financial, dates, status)
CREATE TABLE lab_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lab_vendor_id UUID REFERENCES lab_vendors(id) ON DELETE SET NULL,
  lab_vendor_name TEXT,
  test_name TEXT NOT NULL,
  cost NUMERIC(10,2) DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  entry_date DATE DEFAULT CURRENT_DATE,
  required_date DATE,
  status TEXT DEFAULT 'Ordered' CHECK (status IN ('Ordered','Received','Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- patient_ledger_entries (financial history - immutable audit, extends sessions payment snapshot)
CREATE TABLE patient_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('charge','payment','adjustment','lab_fee')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  entry_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- session_surgery_forms (link sessions to surgery_forms for future submissions)
CREATE TABLE session_surgery_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  surgery_form_id UUID NOT NULL REFERENCES surgery_forms(id) ON DELETE CASCADE,
  form_data JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, surgery_form_id)
);

-- Seed facial_bones with client defaults
INSERT INTO facial_bones (name, is_custom, display_order) VALUES
  ('Frontal', false, 1),
  ('Nasal', false, 2),
  ('Zygoma Left', false, 3),
  ('Zygoma Right', false, 4),
  ('Zygoma L & R', false, 5),
  ('Maxilla L', false, 6),
  ('Maxilla R', false, 7),
  ('Maxilla L & R', false, 8),
  ('Mandible L', false, 9),
  ('Mandible R', false, 10),
  ('Mandible L & R', false, 11)
ON CONFLICT (name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_visit_date ON sessions(visit_date);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_date ON sessions(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_sessions_location ON sessions(location_id);
CREATE INDEX IF NOT EXISTS idx_dental_chart_session ON dental_chart_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_dental_chart_patient ON dental_chart_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_files_session ON session_files(session_id);
CREATE INDEX IF NOT EXISTS idx_files_patient ON session_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_doctors_session ON session_doctors(session_id);
CREATE INDEX IF NOT EXISTS idx_session_doctors_doctor ON session_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_forms_session ON consultation_forms(session_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_session ON appointments(session_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location ON appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_lab_entries_session ON lab_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_lab_entries_patient ON lab_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_entries_vendor ON lab_entries(lab_vendor_id);
CREATE INDEX IF NOT EXISTS idx_lab_entries_status ON lab_entries(status);
CREATE INDEX IF NOT EXISTS idx_lab_entries_entry_date ON lab_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_lab_entries_required_date ON lab_entries(required_date);
-- consent_forms (master - stable logical consent documents, file replaceable)
CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  storage_path TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- session_consent_forms (per-session acknowledgement, preserves historical snapshot)
CREATE TABLE session_consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_form_id UUID REFERENCES consent_forms(id) ON DELETE SET NULL,
  consent_key TEXT,
  consent_title TEXT,
  file_path TEXT,
  patient_name TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, consent_form_id)
);

-- Seed consent_forms (stable logical documents, file replaceable without UI change)
INSERT INTO consent_forms (key, title, file_path, display_order) VALUES
  ('clear_aligner_treatment', 'Clear Aligner Treatment', '/consent_forms/Clear-Aligner-Treatment-2.pdf', 1),
  ('consent_general_1', 'General Consent', '/consent_forms/Consent+1.pdf', 2),
  ('fixed_prosthodontic_crowns_bridges', 'Fixed Prosthodontic Treatment (Crowns and Bridges)', '/consent_forms/Fixed Prosthodontic Treatment (Crowns and Bridges).pdf', 3),
  ('ida_endo', 'Endodontic Treatment (IDA)', '/consent_forms/IDA - Endo.pdf', 4),
  ('ida_pediatric', 'Pediatric Treatment (IDA)', '/consent_forms/IDA - Pediatric.pdf', 5),
  ('ida_pedo', 'Pediatric Treatment (IDA) - Pedo', '/consent_forms/IDA - Pedo.pdf', 6),
  ('obstructive_sleep_apnea', 'Obstructive Sleep Apnea', '/consent_forms/Obstructive-Sleep-Apnea.pdf', 7),
  ('oral_maxillofacial_surgery', 'Oral and Maxillofacial Surgery Consent', '/consent_forms/ORAL AND MAXILLOFACIAL SURGERY CONSENT.pdf', 8),
  ('oral_maxillofacial_implant_surgery', 'Dental Implant Surgery Consent', '/consent_forms/ORAL_MAXILLOFACIAL SURGERY CONSENT FOR DENTAL IMPLANT SURGERY.pdf', 9),
  ('sinus_lift_consent', 'Sinus Lift Consent', '/consent_forms/Sinus-Lift-Consent.pdf', 10)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_surgery_notes_session ON surgery_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_surgery_notes_patient ON surgery_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_ledger_patient ON patient_ledger_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_ledger_session ON patient_ledger_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON patient_ledger_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_lab_vendors_name ON lab_vendors(name);
CREATE INDEX IF NOT EXISTS idx_facial_bones_name ON facial_bones(name);
CREATE INDEX IF NOT EXISTS idx_surgery_forms_active ON surgery_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_session_surgery_forms_session ON session_surgery_forms(session_id);
CREATE INDEX IF NOT EXISTS idx_consent_forms_active ON consent_forms(is_active);
CREATE INDEX IF NOT EXISTS idx_consent_forms_key ON consent_forms(key);
CREATE INDEX IF NOT EXISTS idx_session_consent_forms_session ON session_consent_forms(session_id);
CREATE INDEX IF NOT EXISTS idx_session_consent_forms_patient ON session_consent_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_consent_forms_consent ON session_consent_forms(consent_form_id);

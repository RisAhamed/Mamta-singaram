-- Drop existing tables in dependency order (children first)
DROP TABLE IF EXISTS consultation_forms;
DROP TABLE IF EXISTS session_files;
DROP TABLE IF EXISTS dental_chart_entries;
DROP TABLE IF EXISTS session_doctors;
DROP TABLE IF EXISTS sessions;
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

-- sessions
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_visit_date ON sessions(visit_date);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_date ON sessions(patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON sessions(payment_status);
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

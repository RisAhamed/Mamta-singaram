# AK Dental / Mamta Singaram — Database Schema Manifest

## Overview

This document describes the final reconciled schema for the AK Dental clinic management application.
It is the canonical reference for the CockroachDB production database and for `database/fresh-install.sql`.

## Database

- **Database**: `defaultdb` (CockroachDB)
- **Schema**: `public`
- **SSL**: CockroachDB root certificate (`root.crt`)
- **Connection**: Via `DATABASE_URL` from `.env`

---

## Table Summary

### Master / Configuration Tables

| Table | Purpose | Columns |
|---|---|---|
| `doctors` | Doctor directory | 9 cols |
| `locations` | Clinic location master | 7 cols |
| `lab_vendors` | Laboratory vendor master | 7 cols |
| `facial_bones` | 11 default facial bone options | 7 cols |
| `surgery_forms` | Framework for future surgery forms | 9 cols |
| `consent_forms` | 10 consent form templates | 11 cols |

### Core Data Tables

| Table | Purpose | Columns |
|---|---|---|
| `patients` | Patient records | 26 cols |
| `sessions` | Clinical sessions | 25 cols |
| `appointments` | Appointment scheduling | 12 cols |
| `session_doctors` | Many-to-many session → doctors | 4 cols |
| `dental_chart_entries` | Dental chart entries per session | 8 cols |
| `session_files` | File uploads (R2) metadata | 10 cols |
| `consultation_forms` | Consultation form acknowledgements | 9 cols |
| `lab_entries` | Lab orders per session | 14 cols |
| `patient_ledger_entries` | Financial history | 9 cols |
| `surgery_notes` | Surgery-specific notes | 8 cols |
| `session_surgery_forms` | Surgery form links | 8 cols |
| `session_consent_forms` | Per-session consent acknowledgements | 12 cols |

---

## Detailed Column Reference

### patients
| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` |
| `patient_id` | TEXT | NO | — |
| `full_name` | TEXT | NO | — |
| `registration_date` | DATE | YES | — |
| `date_of_birth` | DATE | YES | — |
| `gender` | TEXT | YES | CHECK IN ('Male','Female','Other') |
| `phone` | TEXT | NO | — |
| `email` | TEXT | YES | — |
| `address` | TEXT | YES | — |
| `blood_group` | TEXT | YES | — |
| `allergies` | TEXT | YES | — |
| `medical_history` | TEXT | YES | — |
| `medical_conditions` | TEXT | YES | — |
| `current_medications` | TEXT | YES | — |
| `previous_dental_history` | TEXT | YES | — |
| `emergency_contact_name` | TEXT | YES | — |
| `emergency_contact_phone` | TEXT | YES | — |
| `notes` | TEXT | YES | — |
| `age` | INTEGER | YES | — |
| `weight` | NUMERIC(5,2) | YES | — |
| `blood_pressure` | TEXT | YES | — |
| `blood_sugar` | NUMERIC(6,2) | YES | — |
| `pulse_rate` | INTEGER | YES | — |
| `spo2` | NUMERIC(5,2) | YES | — |
| `created_at` | TIMESTAMPTZ | YES | `now()` |
| `updated_at` | TIMESTAMPTZ | YES | `now()` |

### sessions
| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` |
| `patient_id` | UUID | NO | FK→patients(id) ON DELETE CASCADE |
| `visit_date` | DATE | NO | `CURRENT_DATE` |
| `visit_type` | TEXT | NO | CHECK IN ('New','Follow-up','Emergency','Routine Checkup') |
| `followup_of` | UUID | YES | FK→sessions(id) ON DELETE SET NULL |
| `chief_complaint` | TEXT | NO | — |
| `diagnosis` | TEXT | YES | — |
| `treatment_given` | TEXT | YES | — |
| `injection_given` | BOOLEAN | YES | false |
| `injection_details` | TEXT | YES | — |
| `treatment_cost` | NUMERIC(10,2) | YES | 0 |
| `amount_paid` | NUMERIC(10,2) | YES | 0 |
| `payment_status` | TEXT | YES | CHECK IN ('Pending','Partial','Paid') |
| `notes` | TEXT | YES | — |
| `next_visit_date` | DATE | YES | — |
| `location_id` | UUID | YES | FK→locations(id) ON DELETE SET NULL |
| `location_name` | TEXT | YES | — |
| `age` | INTEGER | YES | — |
| `weight` | NUMERIC(5,2) | YES | — |
| `blood_pressure` | TEXT | YES | — |
| `blood_sugar` | NUMERIC(6,2) | YES | — |
| `pulse_rate` | INTEGER | YES | — |
| `spo2` | NUMERIC(5,2) | YES | — |
| `created_at` | TIMESTAMPTZ | YES | `now()` |
| `updated_at` | TIMESTAMPTZ | YES | `now()` |

### appointments
| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` |
| `patient_id` | UUID | NO | FK→patients(id) ON DELETE CASCADE |
| `session_id` | UUID | YES | FK→sessions(id) ON DELETE SET NULL |
| `title` | TEXT | YES | — |
| `appointment_date` | DATE | NO | — |
| `appointment_time` | TIME | YES | — |
| `status` | TEXT | NO | CHECK IN ('Scheduled','Completed','Cancelled','No-Show') |
| `notes` | TEXT | YES | — |
| `location_id` | UUID | YES | FK→locations(id) ON DELETE SET NULL |
| `location_name` | TEXT | YES | — |
| `created_at` | TIMESTAMPTZ | YES | `now()` |
| `updated_at` | TIMESTAMPTZ | YES | `now()` |

### lab_entries
| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` |
| `session_id` | UUID | NO | FK→sessions(id) ON DELETE CASCADE |
| `patient_id` | UUID | NO | FK→patients(id) ON DELETE CASCADE |
| `lab_vendor_id` | UUID | YES | FK→lab_vendors(id) ON DELETE SET NULL |
| `lab_vendor_name` | TEXT | YES | — |
| `test_name` | TEXT | NO | — |
| `cost` | NUMERIC(10,2) | YES | 0 |
| `amount_paid` | NUMERIC(10,2) | YES | 0 |
| `entry_date` | DATE | YES | `CURRENT_DATE` |
| `required_date` | DATE | YES | — |
| `status` | TEXT | YES | CHECK IN ('Ordered','Received','Cancelled') |
| `notes` | TEXT | YES | — |
| `created_at` | TIMESTAMPTZ | YES | `now()` |
| `updated_at` | TIMESTAMPTZ | YES | `now()` |

### patient_ledger_entries
| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` |
| `patient_id` | UUID | NO | FK→patients(id) ON DELETE CASCADE |
| `session_id` | UUID | YES | FK→sessions(id) ON DELETE SET NULL |
| `entry_type` | TEXT | NO | CHECK IN ('charge','payment','adjustment','lab_fee') |
| `amount` | NUMERIC(10,2) | NO | — |
| `description` | TEXT | YES | — |
| `entry_date` | TIMESTAMPTZ | YES | `now()` |
| `created_at` | TIMESTAMPTZ | YES | `now()` |
| `updated_at` | TIMESTAMPTZ | YES | `now()` |

---

## Indexes Summary

### All indexes (37 total)

| Index | Table | Purpose |
|---|---|---|
| `idx_sessions_patient` | sessions | Find sessions by patient |
| `idx_sessions_visit_date` | sessions | Filter by visit date |
| `idx_sessions_patient_date` | sessions | Patient + date lookup |
| `idx_sessions_payment_status` | sessions | Filter by payment status |
| `idx_sessions_location` | sessions | Filter by location |
| `idx_patients_phone` | patients | Search by phone |
| `idx_patients_name` | patients | Search by name |
| `idx_patients_patient_id` | patients | Lookup by patient_id |
| `idx_appointments_patient` | appointments | Find appointments by patient |
| `idx_appointments_date` | appointments | Filter by date |
| `idx_appointments_patient_date` | appointments | Patient + date lookup |
| `idx_appointments_status` | appointments | Filter by status |
| `idx_appointments_session` | appointments | Find by session |
| `idx_appointments_location` | appointments | Filter by location |
| `idx_lab_entries_session` | lab_entries | Lab orders by session |
| `idx_lab_entries_patient` | lab_entries | Lab orders by patient |
| `idx_lab_entries_vendor` | lab_entries | Lab orders by vendor |
| `idx_lab_entries_status` | lab_entries | Filter by status |
| `idx_lab_entries_entry_date` | lab_entries | Filter by entry date |
| `idx_lab_entries_required_date` | lab_entries | Filter by required date |
| `idx_ledger_patient` | patient_ledger_entries | Ledger by patient |
| `idx_ledger_session` | patient_ledger_entries | Ledger by session |
| `idx_ledger_date` | patient_ledger_entries | Ledger by date |
| `idx_dental_chart_session` | dental_chart_entries | Chart entries by session |
| `idx_dental_chart_patient` | dental_chart_entries | Chart entries by patient |
| `idx_files_session` | session_files | Files by session |
| `idx_files_patient` | session_files | Files by patient |
| `idx_session_doctors_session` | session_doctors | Doctors by session |
| `idx_session_doctors_doctor` | session_doctors | Sessions by doctor |
| `idx_consultation_forms_session` | consultation_forms | Forms by session |
| `idx_surgery_notes_session` | surgery_notes | Notes by session |
| `idx_surgery_notes_patient` | surgery_notes | Notes by patient |
| `idx_session_surgery_forms_session` | session_surgery_forms | Surgery forms by session |
| `idx_surgery_forms_active` | surgery_forms | Active surgery forms |
| `idx_locations_name` | locations | Location name lookup |
| `idx_lab_vendors_name` | lab_vendors | Vendor name lookup |
| `idx_facial_bones_name` | facial_bones | Facial bone name lookup |
| `idx_consent_forms_active` | consent_forms | Active consent forms |
| `idx_consent_forms_key` | consent_forms | Consent form by key |
| `idx_session_consent_forms_session` | session_consent_forms | Acknowledgements by session |
| `idx_session_consent_forms_patient` | session_consent_forms | Acknowledgements by patient |
| `idx_session_consent_forms_consent` | session_consent_forms | Acknowledgements by consent form |

---

## Constraints Summary

### CHECK Constraints
- `patients.gender`: IN ('Male', 'Female', 'Other')
- `sessions.visit_type`: IN ('New', 'Follow-up', 'Emergency', 'Routine Checkup')
- `sessions.payment_status`: IN ('Pending', 'Partial', 'Paid')
- `appointments.status`: IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')
- `lab_entries.status`: IN ('Ordered', 'Received', 'Cancelled')
- `patient_ledger_entries.entry_type`: IN ('charge', 'payment', 'adjustment', 'lab_fee')
- `session_surgery_forms.status`: IN ('draft', 'submitted', 'reviewed')

### UNIQUE Constraints
- `patients.patient_id` — unique patient identifier
- `consent_forms.key` — unique consent form key
- `session_surgery_forms(session_id, surgery_form_id)` — no duplicate links
- `session_consent_forms(session_id, consent_form_id)` — no duplicate acknowledgements

### Foreign Key Relationships
- `sessions.patient_id` → `patients.id` ON DELETE CASCADE
- `sessions.followup_of` → `sessions.id` ON DELETE SET NULL
- `appointments.patient_id` → `patients.id` ON DELETE CASCADE
- `appointments.session_id` → `sessions.id` ON DELETE SET NULL
- `appointments.location_id` → `locations.id` ON DELETE SET NULL
- `lab_entries.patient_id` → `patients.id` ON DELETE CASCADE
- `lab_entries.session_id` → `sessions.id` ON DELETE CASCADE
- `lab_entries.lab_vendor_id` → `lab_vendors.id` ON DELETE SET NULL
- `patient_ledger_entries.patient_id` → `patients.id` ON DELETE CASCADE
- `patient_ledger_entries.session_id` → `sessions.id` ON DELETE SET NULL
- `session_doctors.session_id` → `sessions.id` ON DELETE CASCADE
- `session_doctors.doctor_id` → `doctors.id` ON DELETE CASCADE
- `dental_chart_entries.patient_id` → `patients.id` ON DELETE CASCADE
- `dental_chart_entries.session_id` → `sessions.id` ON DELETE CASCADE
- `session_files.patient_id` → `patients.id` ON DELETE CASCADE
- `session_files.session_id` → `sessions.id` ON DELETE CASCADE
- `consultation_forms.patient_id` → `patients.id` ON DELETE CASCADE
- `consultation_forms.session_id` → `sessions.id` ON DELETE CASCADE
- `surgery_notes.patient_id` → `patients.id` ON DELETE CASCADE
- `surgery_notes.session_id` → `sessions.id` ON DELETE CASCADE
- `surgery_notes.facial_bone_id` → `facial_bones.id` ON DELETE SET NULL
- `session_surgery_forms.session_id` → `sessions.id` ON DELETE CASCADE
- `session_surgery_forms.patient_id` → `patients.id` ON DELETE CASCADE
- `session_surgery_forms.surgery_form_id` → `surgery_forms.id` ON DELETE CASCADE
- `session_consent_forms.session_id` → `sessions.id` ON DELETE CASCADE
- `session_consent_forms.patient_id` → `patients.id` ON DELETE CASCADE
- `session_consent_forms.consent_form_id` → `consent_forms.id` ON DELETE SET NULL

---

## Seed Data

### facial_bones (11 records)
Frontal, Nasal, Zygoma Left, Zygoma Right, Zygoma L & R, Maxilla L, Maxilla R, Maxilla L & R, Mandible L, Mandible R, Mandible L & R

### consent_forms (10 records)
1. clear_aligner_treatment — Clear Aligner Treatment
2. consent_general_1 — General Consent
3. fixed_prosthodontic_crowns_bridges — Fixed Prosthodontic Treatment (Crowns and Bridges)
4. ida_endo — Endodontic Treatment (IDA)
5. ida_pediatric — Pediatric Treatment (IDA)
6. ida_pedo — Pediatric Treatment (IDA) - Pedo
7. obstructive_sleep_apnea — Obstructive Sleep Apnea
8. oral_maxillofacial_surgery — Oral and Maxillofacial Surgery Consent
9. oral_maxillofacial_implant_surgery — Dental Implant Surgery Consent
10. sinus_lift_consent — Sinus Lift Consent

### locations, lab_vendors, surgery_forms
These master tables start empty. The client can add their own values through the application UI.

---

## Consent Forms Architecture

### Database Tables
- **`consent_forms`** — Master table of consent form templates (10 seeded records)
- **`session_consent_forms`** — Per-session acknowledgement records

### Static Files
- Located in `public/consent_forms/`
- 10 PDF files matching the consent form entries
- Referenced by `consent_forms.file_path`

### How It Works
1. Each consent form is stored as a master record in `consent_forms` with a unique `key`
2. When a session acknowledges a consent, a record is inserted into `session_consent_forms` with `session_id`, `consent_form_id`, `patient_name`, `acknowledged`, and `acknowledged_at`
3. The unique constraint `UNIQUE(session_id, consent_form_id)` prevents duplicate acknowledgements

---

## Installation Instructions

### For a New Client Database
```bash
psql $DATABASE_URL -f database/fresh-install.sql
```

This script is idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) and contains no destructive commands.

### Connection Configuration
- `DATABASE_URL` must be set in `.env` (local) or Vercel dashboard (production)
- SSL certificate `root.crt` must be present in the project root
- See `.env.example` for required environment variables

---

## Reconciliation Notes

- This schema was reconciled against the current application source code (`server/schema.sql`, all `server/routes/*.js`, and frontend `src/lib/api.js`)
- All 18 tables, 37+ indexes, 7 CHECK constraints, and 4 UNIQUE constraints verified present
- All 11 facial_bones seeds and 10 consent_forms seeds verified present
- No application SQL query references a missing table or column
- `database/fresh-install.sql` is the canonical installation script for new client databases

---

## File Locations

- **Schema SQL**: `database/fresh-install.sql`
- **Manifest**: `database/schema-manifest.md` (this file)
- **Development Schema**: `server/schema.sql` (contains DROP TABLE for dev use)
- **Root Certificate**: `root.crt`
- **Environment Template**: `.env.example`

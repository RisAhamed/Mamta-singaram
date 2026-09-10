# Schema Manifest — AK Dental / Mamta Singaram

## What `fresh-install.sql` Does

Creates the **complete, current** application schema on a brand-new empty CockroachDB database.  
Idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) — safe to re-run.  
**No `DROP TABLE`** — never destroys existing data.

Run **once** after creating the empty database. Afterwards the DB is ready for the app.

## How to Run

```bash
# Option 1: psql
psql $DATABASE_URL -f database/fresh-install.sql

# Option 2: CockroachDB Cloud → SQL Console → paste file contents → Run

# Verify
psql $DATABASE_URL -c "\dt"                           # 16 tables
psql $DATABASE_URL -c "SELECT count(*) FROM facial_bones"  # 11
```

No other SQL file is required for a new client.

## Tables (16)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `doctors` | Master — clinicians |
| 2 | `patients` | Core — demographics, vitals, medical history |
| 3 | `locations` | Master — clinic branches |
| 4 | `lab_vendors` | Master — labs/vendors |
| 5 | `facial_bones` | Master — surgery facial bone options (seeded) |
| 6 | `surgery_forms` | Framework — future surgery form definitions |
| 7 | `sessions` | Visits — clinical + financial snapshot per visit |
| 8 | `session_doctors` | Junction — session ↔ doctors |
| 9 | `dental_chart_entries` | Per-session dental chart |
| 10 | `session_files` | Per-session uploaded files (R2 metadata) |
| 11 | `consultation_forms` | Per-session consent acknowledgements |
| 12 | `appointments` | True appointment entity (date/time/status/location) |
| 13 | `surgery_notes` | Dedicated per-session surgery notes + facial bone |
| 14 | `lab_entries` | Per-session lab orders (product, cost, paid, dates, status) |
| 15 | `patient_ledger_entries` | Immutable financial audit per patient |
| 16 | `session_surgery_forms` | Junction — session ↔ surgery_forms |

## Major Relationships

```
patients ─┬─→ sessions ─┬─→ session_doctors ─→ doctors
          │             ├─→ dental_chart_entries
          │             ├─→ session_files
          │             ├─→ consultation_forms
          │             ├─→ surgery_notes ─→ facial_bones
          │             ├─→ lab_entries ─→ lab_vendors
          │             └─→ session_surgery_forms ─→ surgery_forms
          ├─→ appointments (patient_id CASCADE, session_id SET NULL, location_id SET NULL)
          ├─→ lab_entries (patient_id CASCADE)
          ├─→ patient_ledger_entries
          └─→ session_files / surgery_notes / etc.

locations ─→ sessions.location_id (SET NULL) + appointments.location_id (SET NULL)
lab_vendors ─→ lab_entries.lab_vendor_id (SET NULL) — historical name snapshot preserved
facial_bones ─→ surgery_notes.facial_bone_id (SET NULL) — historical name snapshot preserved
surgery_forms ─→ session_surgery_forms (CASCADE)
```

**ON DELETE:**
- `CASCADE` — child deleted when parent deleted (sessions, chart, files, lab entries, surgery notes).
- `SET NULL` — historical snapshot preserved (`lab_entries.lab_vendor_id`, `surgery_notes.facial_bone_id`, `sessions.location_id`, `appointments.location_id/session_id`). Deactivating a master does not destroy history.

## Seed Data

Only `facial_bones` is seeded (11 rows):

`Frontal, Nasal, Zygoma Left, Zygoma Right, Zygoma L & R, Maxilla L, Maxilla R, Maxilla L & R, Mandible L, Mandible R, Mandible L & R`

No fake patients, appointments, or locations.

## Environment Variables (outside SQL)

Configure in Vercel Dashboard (or `.env` locally — never commit `.env`):

| Variable | Where |
|----------|-------|
| `DATABASE_URL` | Backend — CockroachDB connection string (`?sslmode=verify-full`) |
| `R2_ENDPOINT` | Backend — `https://<account>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Backend |
| `R2_SECRET_ACCESS_KEY` | Backend |
| `R2_BUCKET_NAME` | Backend |
| `R2_PUBLIC_URL` | Backend — `https://<public>.r2.dev` |
| `ALLOWED_ORIGINS` | Backend — optional CORS allowlist (comma-separated) |
| `VITE_API_URL` | Frontend — leave empty for same-origin Vercel (`/api`); set `http://localhost:3001` only for local cross-port dev |

No `DATABASE_URL` or R2 secrets are in `fresh-install.sql`.

## Indexes (37)

All `CREATE INDEX IF NOT EXISTS`:
- `idx_sessions_patient`, `idx_sessions_visit_date`, `idx_sessions_patient_date`, `idx_sessions_payment_status`, `idx_sessions_location`
- `idx_dental_chart_session/patient`, `idx_files_session/patient`
- `idx_patients_phone/name/patient_id`
- `idx_session_doctors_session/doctor`
- `idx_consultation_forms_session`
- `idx_appointments_patient/date/patient_date/status/session/location`
- `idx_lab_entries_session/patient/vendor/status/entry_date/required_date`
- `idx_surgery_notes_session/patient`
- `idx_ledger_patient/session/date`
- `idx_locations/lab_vendors/facial_bones_name`, `idx_surgery_forms_active`, `idx_session_surgery_forms_session`

## Additional SQL Required for Brand-New Client?

**No.** Run `database/fresh-install.sql` once. That's it. No migration sequence, no phase files.

## Development Reset (not for client)

`database/reset-development.sql` (if present) contains `DROP TABLE` — for local development reset only. **Do not run on client database.**

## Verification

After running on an empty DB, all application smoke tests should pass:
- create/list patients, doctors, sessions
- appointments CRUD (4 statuses)
- lab entries (cost/paid/required_date/status)
- ledger, surgery notes/forms, files metadata, chart entries

Build: `npm run build` — no schema-related errors.

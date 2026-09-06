import { useState } from 'react'
import { format } from 'date-fns'
import { X, FileText, Printer, CheckSquare, Square } from 'lucide-react'

const SECTION_DEFINITIONS = [
  {
    id: 'patient_info',
    label: 'Patient Information',
    description: 'Name, ID, DOB, gender, registration date',
    defaultOn: true,
  },
  {
    id: 'contact_info',
    label: 'Contact Information',
    description: 'Phone, email, address, emergency contact',
    defaultOn: true,
  },
  {
    id: 'medical_history',
    label: 'Medical History',
    description: 'Allergies, conditions, medications, dental history, notes',
    defaultOn: true,
  },
  {
    id: 'vital_signs',
    label: 'Vital Signs',
    description: 'Age, weight, BP, blood sugar, pulse, SPO2',
    defaultOn: true,
  },
  {
    id: 'sessions',
    label: 'Session History',
    description: 'Visit details, diagnosis, treatment, doctors per session',
    defaultOn: true,
  },
  {
    id: 'dental_chart',
    label: 'Dental Chart',
    description: 'Chart entries per session (region, tooth, procedure)',
    defaultOn: true,
  },
  {
    id: 'surgery_notes',
    label: 'Surgery Notes',
    description: 'Per-session surgery notes and facial bone',
    defaultOn: true,
  },
  {
    id: 'appointments',
    label: 'Appointment History',
    description: 'All appointments and their statuses',
    defaultOn: true,
  },
  {
    id: 'ledger',
    label: 'Financial Ledger',
    description: 'Charges, payments, adjustments, lab fees',
    defaultOn: true,
  },
  {
    id: 'lab_entries',
    label: 'Lab Entries',
    description: 'Lab tests, vendors, costs across sessions',
    defaultOn: true,
  },
  {
    id: 'files',
    label: 'Uploaded Documents & Photos',
    description: 'File metadata and links per session',
    defaultOn: false,
  },
]

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const d = toDate(dateValue)
  if (!d) return '-'
  return format(d, 'dd MMM yyyy')
}

function formatDateShort(dateValue) {
  if (!dateValue) return '-'
  const d = toDate(dateValue)
  if (!d) return '-'
  return format(d, 'dd/MM/yyyy')
}

function toDate(dateValue) {
  if (!dateValue) return null
  if (dateValue?.toDate) return dateValue.toDate()
  const d = new Date(dateValue)
  return isNaN(d.getTime()) ? null : d
}

function Section({ title, children }) {
  if (!children) return null
  return (
    <div className="report-section mb-6 break-inside-avoid">
      <h2 className="mb-3 border-b-2 border-slate-800 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">
        {title}
      </h2>
      <div className="text-sm leading-6 text-slate-800">{children}</div>
    </div>
  )
}

function Field({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="mb-1">
      <span className="font-medium text-slate-700">{label}: </span>
      <span>{value}</span>
    </div>
  )
}

export default function PatientReport({ patient, sessions, appointments, ledgerEntries, labEntries, onClose }) {
  const defaultSelections = Object.fromEntries(SECTION_DEFINITIONS.map(s => [s.id, s.defaultOn]))
  const [selected, setSelected] = useState(defaultSelections)
  const [showPreview, setShowPreview] = useState(false)

  const toggle = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  const selectAll = () => setSelected(Object.fromEntries(SECTION_DEFINITIONS.map(s => [s.id, true])))
  const deselectAll = () => setSelected(Object.fromEntries(SECTION_DEFINITIONS.map(s => [s.id, false])))

  const hasContent = (id) => {
    switch (id) {
      case 'patient_info': return true
      case 'contact_info': return patient?.phone || patient?.email || patient?.address || patient?.emergency_contact_name
      case 'medical_history': return patient?.allergies || patient?.medical_conditions || patient?.current_medications || patient?.previous_dental_history || patient?.medical_history || patient?.notes
      case 'vital_signs': return patient?.age || patient?.weight || patient?.blood_pressure || patient?.blood_sugar || patient?.pulse_rate || patient?.spo2
      case 'sessions': return sessions?.length > 0
      case 'dental_chart': return sessions?.some(s => s.chartEntries?.length > 0)
      case 'surgery_notes': return sessions?.some(s => s.surgeryNotes || s.facial_bone_name)
      case 'appointments': return appointments?.length > 0
      case 'ledger': return ledgerEntries?.length > 0
      case 'lab_entries': return labEntries?.length > 0
      case 'files': return sessions?.some(s => s.files?.length > 0)
      default: return false
    }
  }

  const activeSections = SECTION_DEFINITIONS.filter(s => selected[s.id])
  const reportGenerated = format(new Date(), 'dd MMM yyyy, HH:mm')

  const handlePrint = () => {
    const printContent = document.getElementById('report-preview-content')
    if (!printContent) return
    const w = window.open('', '_blank', 'width=800,height=600')
    w.document.write(`<!DOCTYPE html><html><head><title>Patient Report - ${patient.full_name}</title><style>
      body{font-family:system-ui,-apple-system,sans-serif;margin:40px;color:#1e293b;font-size:13px;line-height:1.5}
      h1{font-size:20px;border-bottom:2px solid #0f172a;padding-bottom:6px;margin:0 0 4px}
      h2{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #0f172a;padding-bottom:4px;margin:16px 0 8px}
      table{width:100%;border-collapse:collapse;margin:6px 0;font-size:12px}
      th{text-align:left;padding:4px 8px;background:#f1f5f9;border:1px solid #cbd5e1;font-weight:600}
      td{padding:4px 8px;border:1px solid #e2e8f0}
      .field{margin-bottom:2px}.field b{color:#475569}
      .badge{display:inline-block;padding:1px 6px;border-radius:9999px;font-size:11px;font-weight:600}
      .mt{margin-top:8px}.mb{margin-bottom:8px}
      @media print{body{margin:20px;font-size:11px} h2{page-break-after:avoid}}
    </style></head><body>${printContent.innerHTML}</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-teal-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Generate Patient Report</h2>
              <p className="text-sm text-slate-500">{patient?.full_name} ({patient?.patient_id})</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showPreview ? (
          /* Section Selection */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">Select sections to include in the report:</p>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Select All</button>
                <button type="button" onClick={deselectAll} className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Deselect All</button>
              </div>
            </div>

            <div className="space-y-2">
              {SECTION_DEFINITIONS.map(section => {
                const available = hasContent(section.id)
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => available && toggle(section.id)}
                    disabled={!available}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                      !available
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-50'
                        : selected[section.id]
                          ? 'border-teal-200 bg-teal-50 hover:bg-teal-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {selected[section.id]
                        ? <CheckSquare className="h-4 w-4 text-teal-600" />
                        : <Square className="h-4 w-4 text-slate-300" />
                      }
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{section.label}</p>
                      <p className="text-xs text-slate-500">{section.description}</p>
                      {!available && <p className="mt-0.5 text-xs text-slate-400 italic">No data available</p>}
                    </div>
                    {available && (
                      <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {section.id === 'files'
                          ? (sessions?.filter(s => s.files?.length > 0).length || 0) + ' session(s)'
                          : section.id === 'dental_chart'
                            ? (sessions?.filter(s => s.chartEntries?.length > 0).length || 0) + ' session(s)'
                            : section.id === 'surgery_notes'
                              ? (sessions?.filter(s => s.surgeryNotes || s.facial_bone_name).length || 0) + ' session(s)'
                              : section.id === 'sessions'
                                ? (sessions?.length || 0) + ' visits'
                                : section.id === 'appointments'
                                  ? (appointments?.length || 0) + ' appts'
                                  : section.id === 'ledger'
                                    ? (ledgerEntries?.length || 0) + ' entries'
                                    : section.id === 'lab_entries'
                                      ? (labEntries?.length || 0) + ' entries'
                                      : ''
                        }
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Report Preview */
          <div className="flex-1 overflow-y-auto p-6">
            <div id="report-preview-content">
              {/* Report Header */}
              <div className="mb-4 text-center">
                <h1 className="text-xl font-bold text-slate-900">Patient Report</h1>
                <p className="text-sm text-slate-600">{patient?.full_name} &mdash; {patient?.patient_id}</p>
                <p className="text-xs text-slate-500">Generated on {reportGenerated}</p>
              </div>

              {/* Patient Info */}
              {selected.patient_info && (
                <Section title="Patient Information">
                  <Field label="Full Name" value={patient?.full_name} />
                  <Field label="Patient ID" value={patient?.patient_id} />
                  <Field label="Date of Birth" value={formatDate(patient?.date_of_birth || patient?.dob)} />
                  <Field label="Gender" value={patient?.gender} />
                  <Field label="Age" value={patient?.age ? `${patient.age} years` : null} />
                  <Field label="Registration Date" value={formatDate(patient?.registration_date)} />
                  <Field label="Blood Group" value={patient?.blood_group} />
                </Section>
              )}

              {/* Contact Info */}
              {selected.contact_info && hasContent('contact_info') && (
                <Section title="Contact Information">
                  <Field label="Phone" value={patient?.phone} />
                  <Field label="Email" value={patient?.email} />
                  <Field label="Address" value={patient?.address} />
                  <Field label="Emergency Contact" value={patient?.emergency_contact_name} />
                  <Field label="Emergency Phone" value={patient?.emergency_contact_phone} />
                </Section>
              )}

              {/* Medical History */}
              {selected.medical_history && hasContent('medical_history') && (
                <Section title="Medical History">
                  <Field label="Allergies" value={patient?.allergies} />
                  <Field label="Medical Conditions" value={patient?.medical_conditions} />
                  <Field label="Current Medications" value={patient?.current_medications} />
                  <Field label="Previous Dental History" value={patient?.previous_dental_history} />
                  <Field label="Medical History" value={patient?.medical_history} />
                  <Field label="Notes" value={patient?.notes} />
                </Section>
              )}

              {/* Vital Signs */}
              {selected.vital_signs && hasContent('vital_signs') && (
                <Section title="Vital Signs">
                  <div className="grid grid-cols-3 gap-2">
                    {patient?.age && <div><span className="text-xs text-slate-500">Age</span><p className="font-medium">{patient.age} yrs</p></div>}
                    {patient?.weight && <div><span className="text-xs text-slate-500">Weight</span><p className="font-medium">{patient.weight} kg</p></div>}
                    {patient?.blood_pressure && <div><span className="text-xs text-slate-500">BP</span><p className="font-medium">{patient.blood_pressure}</p></div>}
                    {patient?.blood_sugar && <div><span className="text-xs text-slate-500">Blood Sugar</span><p className="font-medium">{patient.blood_sugar} mg/dL</p></div>}
                    {patient?.pulse_rate && <div><span className="text-xs text-slate-500">Pulse</span><p className="font-medium">{patient.pulse_rate} bpm</p></div>}
                    {patient?.spo2 && <div><span className="text-xs text-slate-500">SPO2</span><p className="font-medium">{patient.spo2}%</p></div>}
                  </div>
                </Section>
              )}

              {/* Sessions */}
              {selected.sessions && sessions?.length > 0 && (
                <Section title="Session History">
                  {sessions.map((session, i) => (
                    <div key={session.id} className="mb-4 rounded border border-slate-200 p-3 last:mb-0">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">Session {i + 1} &mdash; {formatDateShort(session.visit_date)}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{session.visit_type || 'Visit'}</span>
                      </div>
                      <Field label="Chief Complaint" value={session.chief_complaint} />
                      <Field label="Diagnosis" value={session.diagnosis} />
                      <Field label="Treatment Given" value={session.treatment_given} />
                      {session.doctors?.length > 0 && (
                        <Field label="Doctors" value={session.doctors.map(d => d.name || d.doctor_name).filter(Boolean).join(', ')} />
                      )}
                      {session.injection_given && <Field label="Injection" value={session.injection_details || 'Yes'} />}
                      <Field label="Location" value={session.location_name} />
                      <Field label="Next Visit" value={formatDateShort(session.next_visit_date)} />
                      {(session.treatment_cost || session.amount_paid) && (
                        <div className="mt-2 text-xs text-slate-600">
                          Cost: ₹{formatCurrency(session.treatment_cost)} | Paid: ₹{formatCurrency(session.amount_paid)} | Status: {session.payment_status || '-'}
                        </div>
                      )}
                      {session.notes && <Field label="Notes" value={session.notes} />}
                    </div>
                  ))}
                </Section>
              )}

              {/* Dental Chart */}
              {selected.dental_chart && sessions?.some(s => s.chartEntries?.length > 0) && (
                <Section title="Dental Chart">
                  {sessions.filter(s => s.chartEntries?.length > 0).map(session => (
                    <div key={session.id} className="mb-3">
                      <p className="mb-1 text-xs font-semibold text-slate-600">{formatDateShort(session.visit_date)} &mdash; {session.chief_complaint}</p>
                      <table>
                        <thead><tr><th>Region</th><th>Tooth</th><th>Procedure</th><th>Notes</th></tr></thead>
                        <tbody>
                          {session.chartEntries.map((entry, ci) => (
                            <tr key={entry.id || ci}>
                              <td>{entry.region}</td>
                              <td>{entry.tooth_number || '-'}</td>
                              <td>{entry.procedure_done}</td>
                              <td>{entry.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </Section>
              )}

              {/* Surgery Notes */}
              {selected.surgery_notes && sessions?.some(s => s.surgeryNotes || s.facial_bone_name) && (
                <Section title="Surgery Notes">
                  {sessions.filter(s => s.surgeryNotes || s.facial_bone_name).map(session => (
                    <div key={session.id} className="mb-3 rounded border border-slate-200 p-3">
                      <p className="mb-1 text-xs font-semibold text-slate-600">{formatDateShort(session.visit_date)} &mdash; {session.chief_complaint}</p>
                      {session.facial_bone_name && <Field label="Facial Bone" value={session.facial_bone_name} />}
                      <p className="mt-1 whitespace-pre-wrap text-sm">{session.surgeryNotes}</p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Appointments */}
              {selected.appointments && appointments?.length > 0 && (
                <Section title="Appointment History">
                  <table>
                    <thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Status</th><th>Notes</th></tr></thead>
                    <tbody>
                      {appointments.map(appt => (
                        <tr key={appt.id}>
                          <td>{formatDateShort(appt.appointment_date)}</td>
                          <td>{appt.appointment_time ? String(appt.appointment_time).slice(0,5) : '-'}</td>
                          <td>{appt.title || 'Appointment'}</td>
                          <td>{appt.status}</td>
                          <td>{appt.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Ledger */}
              {selected.ledger && ledgerEntries?.length > 0 && (
                <Section title="Financial Ledger">
                  <table>
                    <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th></tr></thead>
                    <tbody>
                      {ledgerEntries.map(entry => (
                        <tr key={entry.id}>
                          <td>{formatDateShort(entry.entry_date)}</td>
                          <td className="capitalize">{entry.entry_type}</td>
                          <td>{entry.description || '-'}</td>
                          <td className={entry.entry_type === 'payment' ? 'text-emerald-700' : ''}>
                            {entry.entry_type === 'payment' ? '+' : '-'}₹{formatCurrency(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Lab Entries */}
              {selected.lab_entries && labEntries?.length > 0 && (
                <Section title="Lab Entries">
                  <table>
                    <thead><tr><th>Date</th><th>Vendor</th><th>Test</th><th>Cost</th><th>Session</th></tr></thead>
                    <tbody>
                      {labEntries.map(entry => (
                        <tr key={entry.id}>
                          <td>{formatDateShort(entry.entry_date)}</td>
                          <td>{entry.lab_vendor_name || '-'}</td>
                          <td>{entry.test_name}</td>
                          <td>₹{formatCurrency(entry.cost)}</td>
                          <td>{entry.session_chief_complaint || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Files */}
              {selected.files && sessions?.some(s => s.files?.length > 0) && (
                <Section title="Uploaded Documents & Photos">
                  {sessions.filter(s => s.files?.length > 0).map(session => (
                    <div key={session.id} className="mb-3">
                      <p className="mb-1 text-xs font-semibold text-slate-600">{formatDateShort(session.visit_date)} &mdash; {session.chief_complaint}</p>
                      <table>
                        <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Link</th></tr></thead>
                        <tbody>
                          {session.files.map((file, fi) => (
                            <tr key={file.id || fi}>
                              <td>{file.file_name}</td>
                              <td>{file.file_type}</td>
                              <td>{file.file_size_bytes ? `${(file.file_size_bytes / 1024).toFixed(1)} KB` : '-'}</td>
                              <td>{formatDateShort(file.uploaded_at)}</td>
                              <td>{file.file_url ? <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Open</a> : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </Section>
              )}

              {/* Footer */}
              <div className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-400">
                Mamta Dental &mdash; Patient Report generated on {reportGenerated}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          {!showPreview ? (
            <>
              <p className="text-xs text-slate-500">{activeSections.length} of {SECTION_DEFINITIONS.length} sections selected</p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={activeSections.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  Preview Report
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setShowPreview(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Back to Selection
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

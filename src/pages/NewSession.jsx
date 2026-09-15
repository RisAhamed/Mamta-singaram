/* eslint-disable no-unused-vars, no-undef */
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  Save,
  Syringe,
  X,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import MasterSelect from '../components/MasterSelect'
import FileUpload from '../components/FileUpload'
import {
  getPatient,
  getDoctors,
  getSessions,
  createSession,
  getLocations,
  createLocation,
  getFacialBones,
  createFacialBone,
  getLabVendors,
  createLabVendor,
  upsertSurgeryNotes,
  createLabEntry,
  getConsentForms,
  acknowledgeConsentForm,
} from '../lib/api'

const today = format(new Date(), 'yyyy-MM-dd')

const initialForm = {
  visit_date: today,
  visit_type: 'New',
  followup_of: '',
  chief_complaint: '',
  diagnosis: '',
  treatment_given: '',
  injection_given: false,
  injection_details: '',
  treatment_cost: '',
  amount_paid: '',
  notes: '',
  next_visit_date: '',
}

const initialChartForm = {
  region: 'Upper Jaw',
  tooth_number: '',
  procedure_done: '',
  notes: '',
}

const visitTypes = [
  { label: 'New Problem', value: 'New' },
  { label: 'Follow-up', value: 'Follow-up' },
  { label: 'Emergency', value: 'Emergency' },
  { label: 'Routine Checkup', value: 'Routine Checkup' },
]

const regionOptions = [
  'Upper Jaw',
  'Lower Jaw',
  'Left Cheek',
  'Right Cheek',
  'Palate',
  'Gums',
  'Tongue',
  'Other',
]

function NewSession() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const { showToast } = useToast()
  const chartEntriesRef = useRef([])

  const [patient, setPatient] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [previousSessions, setPreviousSessions] = useState([])
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([])
  const [chartEntries, setChartEntries] = useState([])
  const [chartForm, setChartForm] = useState(initialChartForm)
  const [formData, setFormData] = useState(initialForm)
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createdSessionId, setCreatedSessionId] = useState(null)

  const fileUploadRef = useRef(null)

  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [bloodSugar, setBloodSugar] = useState('')
  const [pulseRate, setPulseRate] = useState('')
  const [spo2, setSpo2] = useState('')

  // ── Consent Forms state (pending for new session) ──
  const [consentForms, setConsentForms] = useState([])
  const [pendingConsents, setPendingConsents] = useState([])
  const [consentSelectedId, setConsentSelectedId] = useState('')
  const [consentPatientName, setConsentPatientName] = useState('')
  const [consentAcknowledged, setConsentAcknowledged] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [pendingLabOrders, setPendingLabOrders] = useState([])
  const [labForm, setLabForm] = useState({ lab_vendor_id:'', test_name:'', cost:'', amount_paid:'', entry_date:'', required_date:'', status:'Ordered', notes:'' })

  // ── Master-data dropdowns ──
  const [locationId, setLocationId] = useState('')
  const [surgeryNotes, setSurgeryNotes] = useState('')
  const [facialBoneId, setFacialBoneId] = useState('')

  useEffect(() => {
    const cost = Number.parseFloat(formData.treatment_cost) || 0
    const paid = Number.parseFloat(formData.amount_paid) || 0

    let nextStatus = 'Partial'
    if (cost === 0) {
      nextStatus = 'Paid'
    } else if (paid <= 0) {
      nextStatus = 'Pending'
    } else if (paid >= cost) {
      nextStatus = 'Paid'
    }

    const timer = window.setTimeout(() => setPaymentStatus(nextStatus), 0)
    return () => window.clearTimeout(timer)
  }, [formData.amount_paid, formData.treatment_cost])

  useEffect(() => {
    getConsentForms(true).then(d=> setConsentForms(Array.isArray(d)?d: d?.data ?? [])).catch(()=>{})
  }, [])

  useEffect(() => {
    if (patient?.full_name && !consentPatientName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsentPatientName(patient.full_name)
    }
  }, [patient, consentPatientName])

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        showToast('Missing patientId in the URL.', 'error')
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const data = await getPatient(patientId)
        const raw = data?.patient ?? data?.data ?? data
        if (raw && (raw.id || raw.patient_id || raw.full_name)) {
          setPatient({ id: raw.id || patientId, ...raw })
        } else if (raw) {
          setPatient({ id: patientId, ...raw })
        } else {
          setPatient(null)
          console.error('No patient found for ID:', patientId)
        }
      } catch (error) {
        console.error('Patient load error:', error)
        showToast(error.message || 'Unable to load patient.', 'error')
      } finally {
        setLoading(false)
      }
    }

    Promise.resolve().then(loadPatient)
  }, [patientId, showToast])

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getDoctors(true)
        const list = Array.isArray(data) ? data : (data?.data ?? data?.doctors ?? [])
        setDoctors(list.map((d) => ({ id: d.id, ...d })))
      } catch (error) {
        console.error('Doctors load error:', error)
        showToast(error.message || 'Unable to load doctors.', 'error')
      }
    }

    Promise.resolve().then(loadDoctors)
  }, [showToast])

  useEffect(() => {
    const loadPreviousSessions = async () => {
      if (!patientId) return

      try {
        const data = await getSessions({ patient_id: patientId })
        const rows = Array.isArray(data) ? data : (data?.data ?? data?.sessions ?? [])
        const mapped = rows.map((s) => ({ id: s.id, ...s }))
        setPreviousSessions(
          mapped.sort((a, b) => toMillis(b.visit_date) - toMillis(a.visit_date)),
        )
      } catch (error) {
        console.error('Previous sessions load error:', error)
        showToast(error.message || 'Unable to load previous sessions.', 'error')
      }
    }

    Promise.resolve().then(loadPreviousSessions)
  }, [patientId, showToast])

  useEffect(() => {
    chartEntriesRef.current = chartEntries
  }, [chartEntries])

  const handleFormChange = (event) => {
    const { name, type, checked, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'visit_type' && value !== 'Follow-up' ? { followup_of: '' } : {}),
    }))
  }

  const handleChartDraftChange = (event) => {
    const { name, value } = event.target
    setChartForm((current) => ({ ...current, [name]: value }))
  }

  const addChartEntry = () => {
    if (!chartForm.procedure_done.trim()) {
      showToast('Procedure Done is required to add an entry.', 'warning')
      return
    }

    const entry = {
      tempId: Date.now(),
      region: chartForm.region,
      tooth_number: chartForm.tooth_number.trim() || null,
      procedure_done: chartForm.procedure_done.trim(),
      notes: chartForm.notes.trim() || null,
    }

    setChartEntries((current) => {
      const updated = [...current, entry]
      chartEntriesRef.current = updated
      return updated
    })
    setChartForm(initialChartForm)
  }

  const removeChartEntry = (tempId) => {
    setChartEntries((current) => {
      const updated = current.filter((entry) => entry.tempId !== tempId)
      chartEntriesRef.current = updated
      return updated
    })
  }

  const toggleDoctor = (doctorId) => {
    setSelectedDoctorIds((current) =>
      current.includes(doctorId)
        ? current.filter((id) => id !== doctorId)
        : [...current, doctorId],
    )
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (saving) return
    const entriesToSave = [...chartEntries]
    const doctorsToSave = [...selectedDoctorIds]

    if (!formData.chief_complaint.trim()) {
      showToast('Chief Complaint is required.', 'warning')
      return
    }
    if (!formData.next_visit_date || !String(formData.next_visit_date).trim()) {
      showToast('Next Appointment Date is required.', 'warning')
      return
    }
    if (fileUploadRef.current && !fileUploadRef.current.hasPending()) {
      showToast('Upload Photos is required — please add at least one photo/document.', 'warning')
      return
    }

    setSaving(true)

    try {
      const currentPatientId = patientId
      let targetSessionId = createdSessionId

      // Create the session only once. If uploads fail, user can retry without duplicating the session.
      if (!targetSessionId) {
        const sessionData = {
          patient_id: currentPatientId,
          visit_date: formData.visit_date,
          visit_type: formData.visit_type,
          followup_of:
            formData.visit_type === 'Follow-up' && formData.followup_of
              ? formData.followup_of
              : null,
          chief_complaint: formData.chief_complaint.trim(),
          diagnosis: formData.diagnosis.trim(),
          treatment_given: formData.treatment_given.trim(),
          injection_given: formData.injection_given,
          injection_details: formData.injection_given
            ? formData.injection_details.trim()
            : '',
          treatment_cost:
            Math.round((Number.parseFloat(formData.treatment_cost) || 0) * 100) / 100 || 0,
          amount_paid:
            Math.round((Number.parseFloat(formData.amount_paid) || 0) * 100) / 100 || 0,
          payment_status: paymentStatus,
          notes: formData.notes.trim(),
          next_visit_date: formData.next_visit_date || null,
          age: age ? parseInt(age) : null,
          weight: weight ? parseFloat(weight) : null,
          blood_pressure: bloodPressure.trim() || null,
          blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
          pulse_rate: pulseRate ? parseInt(pulseRate) : null,
          spo2: spo2 ? parseInt(spo2) : null,
          doctors: doctorsToSave,
          chart_entries: entriesToSave.map((e) => ({
            region: e.region,
            tooth_number: e.tooth_number || null,
            procedure_done: e.procedure_done,
            notes: e.notes || null,
          })),
          location_id: locationId || null,
        }

        const created = await createSession(sessionData)
        const newId = created?.id ?? created?.session_id ?? created?.data?.id ?? created?.data?.session_id
        if (!newId) {
          // Fallback: if backend returns the session directly with id field nested differently
          const fallbackId = created?.session?.id ?? created?.result?.id
          if (!fallbackId) throw new Error('Failed to create session: no id returned')
          targetSessionId = fallbackId
        } else {
          targetSessionId = newId
        }
        setCreatedSessionId(targetSessionId)
      }

      // Persist surgery notes (dedicated table) if provided
      if (surgeryNotes.trim() || facialBoneId) {
        try {
          await upsertSurgeryNotes(targetSessionId, { notes: surgeryNotes.trim(), facial_bone_id: facialBoneId || null })
        } catch (e) { console.error('surgery notes save failed', e); showToast(e.message, 'warning') }
      }

      // Upload attached files if any are selected
      if (fileUploadRef.current && fileUploadRef.current.hasPending()) {
        try {
          const { success } = await fileUploadRef.current.uploadAll(targetSessionId)

          if (!success) {
            showToast(
              'Session saved, but some document uploads failed. Click Save Session again to retry failed uploads.',
              'warning',
            )
            return
          }
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr)
          showToast(
            'Session saved, but document upload encountered an error. Click Save Session again to retry.',
            'warning',
          )
          return
        }
      }

      // Save pending consent acknowledgements
      if (pendingConsents.length > 0) {
        try {
          for (const pc of pendingConsents) {
            await acknowledgeConsentForm(targetSessionId, { consent_form_id: pc.consent_form_id, patient_name: pc.patient_name, acknowledged: true })
          }
          setPendingConsents([])
        } catch (e) { console.error('consent save failed', e); showToast(e.message, 'warning') }
      }
      if (pendingLabOrders.length > 0) {
        try {
          for (const lo of pendingLabOrders) {
            await createLabEntry(targetSessionId, { test_name: lo.test_name, lab_vendor_id: lo.lab_vendor_id||null, cost: lo.cost, amount_paid: lo.amount_paid, entry_date: lo.entry_date||null, required_date: lo.required_date||null, status: lo.status, notes: lo.notes||null })
          }
          setPendingLabOrders([])
        } catch (e) { console.error('lab save failed', e); showToast(e.message,'warning') }
      }

      showToast('Session saved successfully.', 'success')
      window.setTimeout(() => navigate(`/patients/${currentPatientId}`), 700)
    } catch (saveError) {
      console.error('Save error:', saveError)
      showToast(`Failed to save: ${saveError.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-6 h-10 rounded bg-slate-100" />
            <div className="mt-4 h-10 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    // ─── FIX: single-scroll wrapper ──────────────────────────────────────────
    // `relative` here gives the sticky bar a containing block it can anchor to.
    // `pb-20` reserves space so the last section is never hidden behind the
    // sticky bar when the user scrolls all the way to the bottom.
    // Do NOT add overflow-y here; the ONE scroll bar belongs to the nearest
    // ancestor that has overflow-y:auto/scroll (typically the page shell).
    <div className="relative max-w-5xl mx-auto pb-20">

      {/* ── Scrollable form content ── */}
      <form id="new-session-form" onSubmit={handleSave} className="space-y-6">

        {/* Page heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">New Session</h2>
          <p className="text-sm text-slate-600">
            Record clinical details, charting, billing, doctors, and attachments.
          </p>
        </div>

        <Section title="Visit Info">
          <div className="grid gap-4 md:grid-cols-2">
            <ReadOnlyField
              label="Patient"
              value={
                patient
                  ? `${patient.full_name} (${patient.patient_id})`
                  : 'Patient not found'
              }
            />
            <Field label="Visit Date" name="visit_date">
              <input
                id="visit_date"
                name="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={handleFormChange}
                className={inputClassName}
              />
            </Field>
            <Field label="Visit Type" name="visit_type">
              <div className="relative">
                <select
                  id="visit_type"
                  name="visit_type"
                  value={formData.visit_type}
                  onChange={handleFormChange}
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  {visitTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
            {formData.visit_type === 'Follow-up' && (
              <Field label="Follow-up of which visit?" name="followup_of">
                <select
                  id="followup_of"
                  name="followup_of"
                  value={formData.followup_of}
                  onChange={handleFormChange}
                  className={inputClassName}
                >
                  <option value="">Select previous visit</option>
                  {previousSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatDate(session.visit_date)} — {session.chief_complaint}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <div className="lg:col-span-2">
              <MasterSelect label="Location" value={locationId} onChange={setLocationId} fetchFn={getLocations} createFn={createLocation} placeholder="Select location" />
            </div>
          </div>
        </Section>

        {/* Vital Signs */}
        <Section title="Vital Signs">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Field label="Age (years)" name="age">
              <input
                type="number" min="0" max="120"
                placeholder="e.g. 35"
                value={age}
                onChange={e => setAge(e.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Weight (kg)" name="weight">
              <input
                type="number" min="0" step="any"
                placeholder="e.g. 70"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Blood Pressure" name="blood_pressure">
              <input
                type="text"
                placeholder="e.g. 120/80 mmHg"
                value={bloodPressure}
                onChange={e => setBloodPressure(e.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Blood Sugar (mg/dL)" name="blood_sugar">
              <input
                type="number" min="0" step="any"
                placeholder="e.g. 110"
                value={bloodSugar}
                onChange={e => setBloodSugar(e.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Pulse Rate (bpm)" name="pulse_rate">
              <input
                type="number" min="0" step="1"
                placeholder="e.g. 72"
                value={pulseRate}
                onChange={e => setPulseRate(e.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="SPO2 (%)" name="spo2">
              <input
                type="number" min="0" max="100" step="any"
                placeholder="e.g. 98"
                value={spo2}
                onChange={e => setSpo2(e.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>
        </Section>

        <Section title="Clinical Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Chief Complaint" name="chief_complaint" required className="lg:col-span-2">
              <textarea
                id="chief_complaint"
                name="chief_complaint"
                rows="3"
                value={formData.chief_complaint}
                onChange={handleFormChange}
                className={textareaClassName}
                placeholder="Patient's main problem today"
              />
            </Field>
            <Field label="Diagnosis" name="diagnosis">
              <textarea
                id="diagnosis"
                name="diagnosis"
                rows="3"
                value={formData.diagnosis}
                onChange={handleFormChange}
                className={textareaClassName}
                placeholder="Doctor's diagnosis"
              />
            </Field>
            <Field label="Treatment Given" name="treatment_given">
              <textarea
                id="treatment_given"
                name="treatment_given"
                rows="3"
                value={formData.treatment_given}
                onChange={handleFormChange}
                className={textareaClassName}
                placeholder="Procedures and treatments performed today"
              />
            </Field>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-800">
                  Injection Given?
                </span>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  {formData.injection_given ? 'YES' : 'NO'}
                </span>
                <input
                  type="checkbox"
                  name="injection_given"
                  checked={formData.injection_given}
                  onChange={handleFormChange}
                  className="sr-only"
                />
                <span
                  className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                    formData.injection_given ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition ${
                      formData.injection_given ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </label>
            </div>
            {formData.injection_given && (
              <Field
                label="Injection Details"
                name="injection_details"
                className="mt-4"
              >
                <input
                  id="injection_details"
                  name="injection_details"
                  type="text"
                  value={formData.injection_details}
                  onChange={handleFormChange}
                  className={inputClassName}
                  placeholder="Injection type, location, dosage"
                />
              </Field>
            )}
          </div>
        </Section>

        <Section title="Dental Chart Entries">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Region" name="region">
              <select
                id="region"
                name="region"
                value={chartForm.region}
                onChange={handleChartDraftChange}
                className={inputClassName}
              >
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tooth Number" name="tooth_number">
              <input
                id="tooth_number"
                name="tooth_number"
                type="text"
                value={chartForm.tooth_number}
                onChange={handleChartDraftChange}
                className={inputClassName}
                placeholder="e.g. 11, 36, 11 gamma (optional)"
              />
            </Field>
            <Field label="Procedure Done" name="procedure_done" required>
              <input
                id="procedure_done"
                name="procedure_done"
                type="text"
                value={chartForm.procedure_done}
                onChange={handleChartDraftChange}
                className={inputClassName}
                placeholder="e.g. Root Canal, Extraction, Filling"
              />
            </Field>
            <Field label="Notes" name="chart_notes">
              <input
                id="chart_notes"
                name="notes"
                type="text"
                value={chartForm.notes}
                onChange={handleChartDraftChange}
                className={inputClassName}
                placeholder="Optional notes"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={addChartEntry}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>

          {chartEntries.length > 0 && (
            <div className="mt-5 space-y-3">
              {chartEntries.map((entry) => (
                <div
                  key={entry.tempId}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                      {entry.region}
                    </span>
                    {entry.tooth_number && (
                      <span className="font-medium">Tooth {entry.tooth_number}</span>
                    )}
                    <span>{entry.procedure_done}</span>
                    {entry.notes && <span className="text-slate-500">- {entry.notes}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChartEntry(entry.tempId)}
                    className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Surgery Notes">
          <p className="mb-4 text-sm text-slate-600">Dedicated surgery notes preserved per session.</p>
          <div className="space-y-4">
            <MasterSelect label="Facial Bone" value={facialBoneId} onChange={setFacialBoneId} fetchFn={getFacialBones} createFn={createFacialBone} placeholder="Select facial bone" />
            <div>
              <label htmlFor="surgery_notes" className="block text-sm font-medium text-slate-700">Surgery Notes</label>
              <textarea
                id="surgery_notes"
                rows={3}
                value={surgeryNotes}
                onChange={(e) => setSurgeryNotes(e.target.value)}
                className={textareaClassName}
                placeholder="Dedicated surgery notes..."
              />
            </div>
          </div>
        </Section>

        <Section title="Lab Orders">
          <p className="mb-3 text-sm text-slate-600">Add lab orders for this session. Each order is independent.</p>
          {pendingLabOrders.length>0 && (
            <div className="mb-3 space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Pending lab orders ({pendingLabOrders.length})</p>
              {pendingLabOrders.map((o,i)=>(
                <div key={i} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2 text-sm">
                  <span>{o.lab_vendor_name||'No lab'} - {o.test_name} - ₹{o.cost} (Paid ₹{o.amount_paid}, Owed ₹{Math.max(o.cost - o.amount_paid,0)}) - {o.status}</span>
                  <button type="button" onClick={()=> setPendingLabOrders(prev=> prev.filter((_,idx)=> idx!==i))} className="text-xs text-rose-600">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs font-medium text-slate-600">Lab / Vendor</label><MasterSelect label="" value={labForm.lab_vendor_id} onChange={v=> setLabForm({...labForm, lab_vendor_id:v})} fetchFn={getLabVendors} createFn={createLabVendor} placeholder="Select lab/vendor" /></div>
            <div><label className="text-xs font-medium text-slate-600">Product / Lab Work *</label><input value={labForm.test_name} onChange={e=> setLabForm({...labForm, test_name:e.target.value})} placeholder="e.g. Crown, Bridge" className="w-full rounded border px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium text-slate-600">Order Date</label><input type="date" value={labForm.entry_date} onChange={e=> setLabForm({...labForm, entry_date:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium text-slate-600">Required Date</label><input type="date" value={labForm.required_date} onChange={e=> setLabForm({...labForm, required_date:e.target.value})} className="w-full rounded border px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium text-slate-600">Total Cost (₹) *</label><input type="number" min="0" step="0.01" value={labForm.cost} onChange={e=> setLabForm({...labForm, cost:e.target.value})} placeholder="0.00" className="w-full rounded border px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium text-slate-600">Amount Paid (₹)</label><input type="number" min="0" step="0.01" value={labForm.amount_paid} onChange={e=> setLabForm({...labForm, amount_paid:e.target.value})} placeholder="0.00" className="w-full rounded border px-3 py-2 text-sm" /><p className="mt-1 text-xs text-slate-500">Outstanding: ₹{labForm.cost!=='' ? Math.max((Number(labForm.cost)||0)-(Number(labForm.amount_paid||0)),0).toFixed(2) : '0.00'}</p></div>
            <div><label className="text-xs font-medium text-slate-600">Status</label><select value={labForm.status} onChange={e=> setLabForm({...labForm, status:e.target.value})} className="w-full rounded border px-3 py-2 text-sm"><option>Ordered</option><option>Received</option><option>Cancelled</option></select></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium text-slate-600">Notes</label><textarea value={labForm.notes} onChange={e=> setLabForm({...labForm, notes:e.target.value})} rows={2} placeholder="Optional notes" className="w-full rounded border px-3 py-2 text-sm" /></div>
          </div>
          <button type="button" onClick={()=>{
            if(!labForm.test_name.trim()) return showToast('Product is required','warning');
            if(labForm.cost===''|| isNaN(Number(labForm.cost))|| Number(labForm.cost)<0) return showToast('Cost invalid','warning');
            if(labForm.amount_paid!=='' && (isNaN(Number(labForm.amount_paid))|| Number(labForm.amount_paid)<0)) return showToast('Amount paid invalid','warning');
            if(Number(labForm.amount_paid||0) > Number(labForm.cost||0)) return showToast('Paid cannot exceed cost','warning');
            if(labForm.required_date && labForm.entry_date && new Date(labForm.required_date) < new Date(labForm.entry_date)) return showToast('Required cannot be before order','warning');
            let vendorName=null;
            // will resolve on save via lookup, store entered vendor id
            setPendingLabOrders(prev=> [...prev, { ...labForm, test_name: labForm.test_name.trim(), cost: Number(labForm.cost||0), amount_paid: Number(labForm.amount_paid||0), notes: labForm.notes.trim() }]);
            setLabForm({ lab_vendor_id:'', test_name:'', cost:'', amount_paid:'', entry_date:'', required_date:'', status:'Ordered', notes:'' });
          }} className="mt-3 rounded bg-teal-600 px-4 py-2 text-sm text-white">+ Add Lab Order</button>
        </Section>

        <Section title="Consent Forms">
          <p className="mb-3 text-sm text-slate-600">Select consent form, open PDF in new tab, confirm patient name and acknowledge. Opening alone is not acknowledgement.</p>
          {consentForms.length===0 ? <p className="text-sm text-slate-500">No active consent forms available.</p> : (
            <div className="space-y-3">
              <select value={consentSelectedId} onChange={e=>setConsentSelectedId(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-2 text-sm">
                <option value="">Select consent form</option>
                {consentForms.map(f=> <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
              {consentSelectedId && (()=>{ const f=consentForms.find(x=>x.id===consentSelectedId); return f ? <div className="rounded border bg-white p-3"><p className="font-medium text-sm">{f.title}</p><a href={f.file_path} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-xs font-medium text-white">Open Consent Form</a></div> : null })()}
              <input value={consentPatientName} onChange={e=>setConsentPatientName(e.target.value)} placeholder="Patient Name" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={consentAcknowledged} onChange={e=>setConsentAcknowledged(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600" /> I acknowledge and consent to the above treatment/procedure.</label>
              {consentError && <p className="text-xs text-rose-600">{consentError}</p>}
              <button type="button" onClick={()=>{
                if(!consentSelectedId) return setConsentError('Select a consent form');
                if(!consentPatientName.trim()) return setConsentError('Patient name required');
                if(!consentAcknowledged) return setConsentError('Please tick acknowledgement');
                const f=consentForms.find(x=>x.id===consentSelectedId);
                setPendingConsents(prev=> [...prev, {consent_form_id:consentSelectedId, patient_name:consentPatientName.trim(), title:f?.title||''}]);
                setConsentSelectedId(''); setConsentAcknowledged(false); setConsentError('');
              }} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Add Consent Acknowledgement</button>
              {pendingConsents.length>0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase text-slate-500">Pending ({pendingConsents.length})</p>{pendingConsents.map((pc,i)=> <div key={i} className="flex justify-between rounded border bg-slate-50 px-3 py-2 text-sm"><span>{pc.title} — {pc.patient_name}</span><button type="button" onClick={()=>setPendingConsents(prev=>prev.filter((_,idx)=>idx!==i))} className="text-xs text-rose-600">Remove</button></div>)}</div>}
            </div>
          )}
        </Section>

        <Section title="Doctors Involved">
          <p className="mb-4 text-sm text-slate-600">
            Select all doctors involved in this visit
          </p>
          {doctors.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No active doctors found. Please mark a doctor as Active in the Doctors page.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {doctors.map((doctor) => {
                const selected = selectedDoctorIds.includes(doctor.id)
                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => toggleDoctor(doctor.id)}
                    className={`rounded-full px-3 py-2.5 text-sm font-medium ring-1 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      selected
                        ? 'bg-teal-600 text-white ring-teal-600'
                        : 'bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {doctor.name}
                    {doctor.specialty && (
                      <span className={selected ? 'text-teal-50' : 'text-slate-500'}>
                        {' '}
                        · {doctor.specialty}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Section>

        <Section title="Billing">
          <div className="grid gap-4 lg:grid-cols-3">
            <CurrencyField
              label="Treatment Cost"
              name="treatment_cost"
              value={formData.treatment_cost}
              onChange={handleFormChange}
            />
            <CurrencyField
              label="Amount Paid"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleFormChange}
            />
            <div>
              <label className="mb-1 block text-sm text-gray-500">Payment Status</label>
              <span
                className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium ${paymentStatusClassName(
                  paymentStatus,
                )}`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </Section>

        <Section title="Additional Notes & Next Visit">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Additional Notes" name="notes">
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleFormChange}
                className={textareaClassName}
                placeholder="Optional additional notes"
              />
            </Field>
            <Field label="Next Appointment Date" name="next_visit_date" required>
              <input
                id="next_visit_date"
                name="next_visit_date"
                type="date"
                value={formData.next_visit_date}
                onChange={handleFormChange}
                className={inputClassName}
                required
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 8 — Upload Photos (mandatory) ─────────────────────────────────── */}
        <Section title="Upload Photos">
          <FileUpload ref={fileUploadRef} required />
        </Section>

      </form>

      {/* ── Sticky bottom action bar ────────────────────────────────────────────
           KEY CHANGES vs. original:
           • Moved OUTSIDE the <form> so it is never part of the form's scroll flow.
           • `sticky bottom-0` keeps it pinned to the visible viewport bottom as
             the user scrolls — no matter how long the page gets.
           • `z-10` ensures it layers above section cards.
           • `bg-white` (fully opaque) prevents content bleeding through.
           • The `pb-20` on the outer wrapper above creates the matching gap so
             the last form section is never hidden behind this bar.
           • The submit button uses `form="new-session-form"` to trigger the
             <form>'s onSubmit even though the button is now outside it.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-md mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          form="new-session-form"
          disabled={saving || !patientId}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Session
        </button>
      </div>

    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-5 text-lg font-semibold tracking-normal text-slate-950">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, name, required = false, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
    </div>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="block text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  )
}

function CurrencyField({ label, name, value, onChange }) {
  return (
    <Field label={label} name={name}>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
          ₹
        </span>
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={onChange}
          className={`${inputClassName} pl-8`}
          placeholder="0.00"
        />
      </div>
    </Field>
  )
}

const inputClassName =
  'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'

const textareaClassName =
  'mt-1 block w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const d = toDate(dateValue)
  if (!d) return '-'
  return format(d, 'dd MMM yyyy')
}

function toDate(dateValue) {
  if (!dateValue) return null
  if (dateValue?.toDate) return dateValue.toDate()
  const d = new Date(dateValue)
  return isNaN(d.getTime()) ? null : d
}

function toMillis(dateValue) {
  const d = toDate(dateValue)
  return d ? d.getTime() : -Infinity
}

function paymentStatusClassName(status) {
  if (status === 'Paid') return 'bg-green-100 text-green-700'
  if (status === 'Partial') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-600'
}

export default NewSession

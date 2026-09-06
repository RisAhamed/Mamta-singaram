import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Plus,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import SessionCard from '../components/SessionCard'
import { useToast } from '../hooks/useToast'
import {
  getPatient,
  getSessions,
  getSession,
  getSessionFiles,
  getConsultationForms,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getPatientLedger,
  deleteLedgerEntry,
  getPatientLabEntries,
} from '../lib/api'
import AppointmentDetailModal from '../components/AppointmentDetailModal'
import LedgerCalendar from '../components/LedgerCalendar'
import LedgerDetailModal from '../components/LedgerDetailModal'
import PatientReport from '../components/PatientReport'

const filterOptions = [
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'All', value: 'All' },
]

function PatientDetail() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [patient, setPatient] = useState(null)
  const [sessions, setSessions] = useState([])
  const [followupSessions, setFollowupSessions] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [showMedicalHistory, setShowMedicalHistory] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [apptFilter, setApptFilter] = useState('All')
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [ledgerMonth, setLedgerMonth] = useState(new Date())
  const [ledgerView, setLedgerView] = useState('calendar')
  const [ledgerFilter, setLedgerFilter] = useState('All')
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState(null)
  const [labEntries, setLabEntries] = useState([])
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        let patientData
        try {
          const patientRaw = await getPatient(patientId)
          if (!patientRaw) {
            setPatient(null)
            setSessions([])
            setFollowupSessions({})
            setLoading(false)
            return
          }
          patientData = normalizeFirestoreData(patientRaw)
        } catch (patientErr) {
          const msg = patientErr?.message || ''
          if (msg.toLowerCase().includes('not found') || msg.includes('404')) {
            console.error('Patient not found:', patientId)
            setPatient(null)
            setSessions([])
            setFollowupSessions({})
            setLoading(false)
            return
          }
          throw patientErr
        }
        setPatient(patientData)

        const sessionsRawResponse = await getSessions({ patient_id: patientId })
        const sessionsRawArray = Array.isArray(sessionsRawResponse)
          ? sessionsRawResponse
          : Array.isArray(sessionsRawResponse?.rows)
            ? sessionsRawResponse.rows
            : Array.isArray(sessionsRawResponse?.data)
              ? sessionsRawResponse.data
              : []
        const sessionsRaw = sessionsRawArray.map((session) =>
          normalizeFirestoreData(session),
        )

        // Enrich each session with doctors + chart entries via getSession, plus files and consultation forms
        const sessionsWithDetails = await Promise.all(
          sessionsRaw.map(async (session) => {
            const [enriched, filesRaw, consultationFormRecordsRaw] = await Promise.all([
              getSession(session.id).catch(() => null),
              getSessionFiles(session.id).catch(() => []),
              getConsultationForms(session.id).catch(() => []),
            ])

            // enriched contains doctors and dental_chart_entries
            const doctors = enriched?.doctors
              ? enriched.doctors.map((d) => normalizeFirestoreData(d))
              : []

            const dentalEntriesRaw = enriched?.dental_chart_entries || enriched?.chart_entries || []
            const chartEntries = Array.isArray(dentalEntriesRaw)
              ? dentalEntriesRaw.map((chartDoc) => normalizeFirestoreData(chartDoc))
              : []

            const filesArray = Array.isArray(filesRaw)
              ? filesRaw
              : Array.isArray(filesRaw?.rows)
                ? filesRaw.rows
                : Array.isArray(filesRaw?.data)
                  ? filesRaw.data
                  : []
            const files = filesArray.map((fileDoc) => normalizeFirestoreData(fileDoc))

            const formsArray = Array.isArray(consultationFormRecordsRaw)
              ? consultationFormRecordsRaw
              : Array.isArray(consultationFormRecordsRaw?.rows)
                ? consultationFormRecordsRaw.rows
                : Array.isArray(consultationFormRecordsRaw?.data)
                  ? consultationFormRecordsRaw.data
                  : []
            const consultationForms = formsArray.map((record) => normalizeFirestoreData(record))

            // Merge enriched base fields (visit_date etc) without overwriting our computed arrays
            const enrichedBase = enriched ? normalizeFirestoreData(enriched) : {}
            // Remove nested keys from enrichedBase to avoid confusion
            // eslint-disable-next-line no-unused-vars
            const { doctors: _d, dental_chart_entries: _dce, chart_entries: _ce, ...enrichedRest } = enrichedBase

            return {
              ...session,
              ...enrichedRest,
              id: session.id,
              chartEntries,
              doctors,
              files,
              consultationForms,
            }
          }),
        )

        setSessions(sessionsWithDetails)
        setFollowupSessions(await buildFollowupSessions(sessionsWithDetails))

        // Fetch appointments for this patient (patient history) - separate from session history
        try {
          const apptData = await getAppointments({ patient_id: patientId })
          const apptArr = Array.isArray(apptData) ? apptData : apptData?.data ?? apptData?.rows ?? []
          setAppointments(apptArr)
        } catch {
          setAppointments([])
        }

        // Fetch ledger entries for this patient (financial history - immutable audit)
        try {
          const ledgerData = await getPatientLedger(patientId)
          const ledgerArr = Array.isArray(ledgerData) ? ledgerData : ledgerData?.data ?? ledgerData?.rows ?? []
          setLedgerEntries(ledgerArr)
        } catch {
          setLedgerEntries([])
        }

        // Fetch all lab entries across sessions for this patient
        try {
          const labData = await getPatientLabEntries(patientId)
          const labArr = Array.isArray(labData) ? labData : labData?.data ?? labData?.rows ?? []
          setLabEntries(labArr)
        } catch {
          setLabEntries([])
        }
      } catch (err) {
        console.error('PatientDetail load error:', err)
        showToast(err.message || 'Unable to load patient details.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (patientId) Promise.resolve().then(load)
  }, [patientId, showToast])

  const getFilteredSessions = () => {
    if (activeFilter === 'All') return sessions

    const months = { '3M': 3, '6M': 6, '1Y': 12, '5Y': 60 }[activeFilter]
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months)

    return sessions.filter((session) => toDate(session.visit_date) >= cutoff)
  }

  const filteredSessions = getFilteredSessions()

  const handleAddSession = () => {
    navigate(`/sessions/new/${patientId}`)
  }

  const handleEditSession = (sessionId) => {
    navigate(`/sessions/edit/${sessionId}`)
  }

  const displayMedicalHistory =
    !patient?.medical_history || showMedicalHistory
      ? patient?.medical_history
      : `${patient.medical_history.slice(0, 140)}${
          patient.medical_history.length > 140 ? '...' : ''
        }`
  const hasMedicalHistoryDetails =
    patient?.allergies ||
    patient?.medical_conditions ||
    patient?.current_medications ||
    patient?.previous_dental_history ||
    patient?.notes

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading patient...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-400">Patient not found.</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                    {patient.full_name}
                  </h1>
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                    {patient.patient_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Generate Report
                  </button>
                </div>

                <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
                  <InfoItem
                    label="Date Added"
                    value={formatDate(patient.registration_date || patient.created_at)}
                  />
                  <InfoItem label="Gender" value={patient.gender || '-'} />
                  <InfoItem
                    label="DOB"
                    value={formatDate(patient.date_of_birth || patient.dob)}
                  />
                  <InfoItem label="Phone" value={patient.phone || '-'} />
                  <InfoItem label="Email" value={patient.email || '-'} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSession}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add New Session
              </button>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Blood Group
                </p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  {patient.blood_group || '-'}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Allergies
                </p>
                {patient.allergies ? (
                  <span className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                    {patient.allergies}
                  </span>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">None recorded</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Medical History
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {displayMedicalHistory || 'None recorded'}
                </p>
                {patient.medical_history && patient.medical_history.length > 140 && (
                  <button
                    type="button"
                    onClick={() => setShowMedicalHistory((current) => !current)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                  >
                    {showMedicalHistory ? 'Show less' : 'Show more'}
                    {showMedicalHistory ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Emergency contact:</span>{' '}
              {patient.emergency_contact_name || '-'}
              {patient.emergency_contact_phone
                ? ` · ${patient.emergency_contact_phone}`
                : ''}
            </div>

            {/* Vital Signs Display */}
            {(patient.age || patient.weight || patient.blood_pressure || patient.blood_sugar || patient.pulse_rate || patient.spo2) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vital Signs</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {patient.age && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Age</p>
                      <p className="text-sm font-semibold text-blue-700">{patient.age} yrs</p>
                    </div>
                  )}
                  {patient.weight && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Weight</p>
                      <p className="text-sm font-semibold text-green-700">{patient.weight} kg</p>
                    </div>
                  )}
                  {patient.blood_pressure && (
                    <div className="bg-red-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">BP</p>
                      <p className="text-sm font-semibold text-red-700">{patient.blood_pressure}</p>
                    </div>
                  )}
                  {patient.blood_sugar && (
                    <div className="bg-yellow-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Blood Sugar</p>
                      <p className="text-sm font-semibold text-yellow-700">{patient.blood_sugar} mg/dL</p>
                    </div>
                  )}
                  {patient.pulse_rate && (
                    <div className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">Pulse</p>
                      <p className="text-sm font-semibold text-purple-700">{patient.pulse_rate} bpm</p>
                    </div>
                  )}
                  {patient.spo2 && (
                    <div className="bg-teal-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-gray-400">SPO2</p>
                      <p className="text-sm font-semibold text-teal-700">{patient.spo2}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasMedicalHistoryDetails && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-semibold tracking-normal text-slate-600">
                  Medical History
                </h3>
                <div className="space-y-2">
                  {patient.allergies && (
                    <MedicalHistoryRow
                      label="Allergies"
                      value={patient.allergies}
                      className="bg-red-100 text-red-700"
                    />
                  )}
                  {patient.medical_conditions && (
                    <MedicalHistoryRow
                      label="Conditions"
                      value={patient.medical_conditions}
                      className="bg-yellow-100 text-yellow-700"
                    />
                  )}
                  {patient.current_medications && (
                    <MedicalHistoryRow
                      label="Medications"
                      value={patient.current_medications}
                      className="bg-blue-100 text-blue-700"
                    />
                  )}
                  {patient.previous_dental_history && (
                    <MedicalHistoryRow
                      label="Dental History"
                      value={patient.previous_dental_history}
                      className="bg-gray-100 text-gray-600"
                    />
                  )}
                  {patient.notes && (
                    <MedicalHistoryRow
                      label="Notes"
                      value={patient.notes}
                      className="bg-purple-100 text-purple-700"
                    />
                  )}
                </div>
              </div>
            )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                Visit History
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {filteredSessions.length} visits
              </span>
            </div>

            <div className="inline-flex w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    activeFilter === option.value
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-medium text-slate-900">
                No visits recorded yet.
              </p>
              <button
                type="button"
                onClick={handleAddSession}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Add First Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  followupSession={followupSessions[session.followup_of]}
                  onEdit={handleEditSession}
                />
              ))}
            </div>
          )}
        </section>

        {/* Appointment History — separate from session history, connected via patient */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Appointment History</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{appointments.length} appts</span>
            </div>
            <div className="inline-flex w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
              {['All','Upcoming','Past'].map(opt=>(
                <button key={opt} type="button" onClick={()=>setApptFilter(opt)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${apptFilter===opt?'bg-teal-600 text-white shadow-sm':'text-slate-600 hover:bg-slate-50'}`}>{opt}</button>
              ))}
            </div>
          </div>

          {(() => {
            const now = new Date(); now.setHours(0,0,0,0)
            const filtered = appointments.filter(a=>{
              const d = toDate(a.appointment_date)
              if(!d) return apptFilter==='All'
              d.setHours(0,0,0,0)
              if(apptFilter==='Upcoming') return d >= now && a.status !== 'Cancelled'
              if(apptFilter==='Past') return d < now || a.status==='Completed' || a.status==='Cancelled' || a.status==='No-Show'
              return true
            }).sort((a,b)=> toDate(b.appointment_date)-toDate(a.appointment_date))
            if(filtered.length===0) return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No appointments in this view</div>
            return (
              <div className="space-y-3">
                {filtered.map(appt=>(
                  <button key={appt.id} type="button" onClick={()=>setSelectedAppt(appt)} className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{appt.title || 'Appointment'} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ring-1 ${appt.status==='Completed'?'bg-emerald-50 text-emerald-700 ring-emerald-200': appt.status==='Cancelled'?'bg-slate-100 text-slate-600 ring-slate-200': appt.status==='No-Show'?'bg-rose-50 text-rose-700 ring-rose-200':'bg-blue-50 text-blue-700 ring-blue-200'}`}>{appt.status}</span></p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(appt.appointment_date)} {appt.appointment_time ? `· ${String(appt.appointment_time).slice(0,5)}` : ''} {appt.location_name ? `· ${appt.location_name}` : ''}</p>
                      {appt.notes && <p className="mt-1 truncate text-xs text-slate-600">{appt.notes}</p>}
                      {appt.session_id && <p className="mt-1 text-xs text-teal-600">Related session →</p>}
                    </div>
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400"/>
                  </button>
                ))}
              </div>
            )
          })()}
        </section>

        {selectedAppt && (
          <AppointmentDetailModal
            appointment={selectedAppt}
            onClose={()=>setSelectedAppt(null)}
            onStatusChange={async (appt,status)=>{
              try{ await updateAppointment(appt.id,{status}); showToast('Status updated','success'); const data=await getAppointments({patient_id: patientId}); const arr=Array.isArray(data)?data: data?.data ?? []; setAppointments(arr); setSelectedAppt(null)}catch(e){showToast(e.message,'error')}
            }}
            onDelete={async (appt)=>{
              if(!confirm('Delete appointment?')) return
              try{ await deleteAppointment(appt.id); showToast('Deleted','success'); const data=await getAppointments({patient_id: patientId}); const arr=Array.isArray(data)?data: data?.data ?? []; setAppointments(arr); setSelectedAppt(null)}catch(e){showToast(e.message,'error')}
            }}
            onNavigatePatient={(pid)=>{ setSelectedAppt(null); navigate(`/patients/${pid}`)}}
            onNavigateSession={(sid)=>{ setSelectedAppt(null); if(sid) navigate(`/sessions/edit/${sid}`)}}
          />
        )}

        {/* Ledger History — financial audit trail, connected via patient */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Financial Ledger</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{ledgerEntries.length} entries</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="inline-flex w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
                {['All','Charges','Payments'].map(opt=>(
                  <button key={opt} type="button" onClick={()=>setLedgerFilter(opt)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${ledgerFilter===opt?'bg-teal-600 text-white shadow-sm':'text-slate-600 hover:bg-slate-50'}`}>{opt}</button>
                ))}
              </div>
              <div className="inline-flex w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
                {['calendar','list'].map(v=>(
                  <button key={v} type="button" onClick={()=>setLedgerView(v)} className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${ledgerView===v?'bg-teal-600 text-white shadow-sm':'text-slate-600 hover:bg-slate-50'}`}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {ledgerView === 'calendar' ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <LedgerCalendar
                  entries={ledgerEntries}
                  currentMonth={ledgerMonth}
                  onMonthChange={setLedgerMonth}
                  onSelectDate={()=>{}}
                  selectedDate={null}
                  onEntryClick={setSelectedLedgerEntry}
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 font-semibold text-slate-900">Recent Entries</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {ledgerEntries.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">No ledger entries yet</p>
                  ) : (
                    ledgerEntries.slice(0, 20).map(entry => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedLedgerEntry(entry)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                              entry.entry_type === 'charge' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                              entry.entry_type === 'payment' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                              entry.entry_type === 'lab_fee' ? 'bg-sky-50 text-sky-700 ring-sky-200' :
                              'bg-violet-50 text-violet-700 ring-violet-200'
                            }`}>{entry.entry_type}</span>
                          </p>
                          {entry.description && <p className="mt-1 truncate text-xs text-slate-600">{entry.description}</p>}
                          <p className="mt-0.5 text-xs text-slate-500">{formatDate(entry.entry_date)} {entry.session_id ? '· Session linked' : ''}</p>
                        </div>
                        <span className={`text-sm font-semibold ${(entry.entry_type === 'payment') ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {entry.entry_type === 'payment' ? '+' : '-'}₹{Number(entry.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            (() => {
              const filtered = ledgerEntries.filter(e => {
                if (ledgerFilter === 'Charges') return e.entry_type === 'charge' || e.entry_type === 'lab_fee'
                if (ledgerFilter === 'Payments') return e.entry_type === 'payment'
                return true
              })
              if (filtered.length === 0) return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No ledger entries in this view</div>
              return (
                <div className="space-y-3">
                  {filtered.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedLedgerEntry(entry)}
                      className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                            entry.entry_type === 'charge' ? 'bg-amber-50 text-amber-700 ring-amber-200' :
                            entry.entry_type === 'payment' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                            entry.entry_type === 'lab_fee' ? 'bg-sky-50 text-sky-700 ring-sky-200' :
                            'bg-violet-50 text-violet-700 ring-violet-200'
                          }`}>{entry.entry_type}</span>
                          {entry.description && <span className="ml-2 text-slate-600">{entry.description}</span>}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(entry.entry_date)} {entry.session_id ? '· Session linked' : ''}</p>
                      </div>
                      <span className={`text-sm font-semibold ${(entry.entry_type === 'payment') ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {entry.entry_type === 'payment' ? '+' : '-'}₹{Number(entry.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </button>
                  ))}
                </div>
              )
            })()
          )}
        </section>

        {selectedLedgerEntry && (
          <LedgerDetailModal
            entry={selectedLedgerEntry}
            onClose={() => setSelectedLedgerEntry(null)}
            onDelete={async (entry) => {
              try {
                await deleteLedgerEntry(patientId, entry.id)
                showToast('Ledger entry deleted', 'success')
                const data = await getPatientLedger(patientId)
                const arr = Array.isArray(data) ? data : data?.data ?? []
                setLedgerEntries(arr)
                setSelectedLedgerEntry(null)
              } catch (e) {
                showToast(e.message, 'error')
              }
            }}
            onNavigateSession={(sid) => {
              setSelectedLedgerEntry(null)
              if (sid) navigate(`/sessions/edit/${sid}`)
            }}
          />
        )}

        {/* Lab Entries — per-session lab/vendor records */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Lab Entries</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{labEntries.length} entries</span>
          </div>

          {labEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No lab entries recorded for this patient
            </div>
          ) : (
            <div className="space-y-3">
              {labEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/sessions/edit/${entry.session_id}`)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {entry.lab_vendor_name && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">{entry.lab_vendor_name}</span>}
                      <span className="ml-2 text-slate-600">{entry.test_name}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(entry.entry_date)} {entry.session_chief_complaint ? `· Session: ${entry.session_chief_complaint}` : ''}
                    </p>
                    {entry.notes && <p className="mt-1 truncate text-xs text-slate-600">{entry.notes}</p>}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(entry.cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {showReport && (
        <PatientReport
          patient={patient}
          sessions={sessions}
          appointments={appointments}
          ledgerEntries={ledgerEntries}
          labEntries={labEntries}
          onClose={() => setShowReport(false)}
        />
      )}
    </main>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

function MedicalHistoryRow({ label, value, className }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${className}`}
      >
        {label}
      </span>
      <span className="text-sm leading-6 text-slate-700">{value}</span>
    </div>
  )
}

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

function normalizeFirestoreData(data) {
  if (!data || typeof data !== 'object') return data
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value?.toDate ? value.toDate().toISOString() : value,
    ]),
  )
}

async function buildFollowupSessions(sessionRows) {
  const visibleIds = new Set(sessionRows.map((session) => session.id))
  const followupIds = [
    ...new Set(
      sessionRows
        .map((session) => session.followup_of)
        .filter((followupId) => followupId && !visibleIds.has(followupId)),
    ),
  ]

  const visibleFollowups = sessionRows.reduce((accumulator, session) => {
    accumulator[session.id] = session
    return accumulator
  }, {})

  if (followupIds.length === 0) return visibleFollowups

  const fetched = await Promise.all(
    followupIds.map((id) => getSession(id).catch(() => null)),
  )

  const fetchedFollowups = fetched.filter(Boolean).map((s) => normalizeFirestoreData(s))

  return {
    ...visibleFollowups,
    ...fetchedFollowups.reduce((acc, session) => {
      acc[session.id] = session
      return acc
    }, {}),
  }
}

export default PatientDetail

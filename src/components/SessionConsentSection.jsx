import { useEffect, useState } from 'react'
import { ExternalLink, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { getConsentForms, getSessionConsentForms, acknowledgeConsentForm, deleteSessionConsentForm } from '../lib/api'
import { useToast } from '../hooks/useToast'

export default function SessionConsentSection({ sessionId, patientName: initialPatientName }) {
  const { showToast } = useToast()
  const [consentForms, setConsentForms] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [patientName, setPatientName] = useState(initialPatientName || '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [forms, recs] = await Promise.all([
        getConsentForms(true),
        getSessionConsentForms(sessionId),
      ])
      setConsentForms(Array.isArray(forms) ? forms : forms?.data ?? [])
      setRecords(Array.isArray(recs) ? recs : recs?.data ?? [])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { if (sessionId) load() }, [sessionId])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (initialPatientName) setPatientName(initialPatientName) }, [initialPatientName])

  const selectedForm = consentForms.find(f => f.id === selectedId)

  const handleSave = async () => {
    if (!selectedId) return setError('Select a consent form')
    if (!patientName.trim()) return setError('Patient name is required')
    if (!acknowledged) return setError('Please tick acknowledgement')
    setSaving(true)
    setError('')
    try {
      await acknowledgeConsentForm(sessionId, { consent_form_id: selectedId, patient_name: patientName.trim(), acknowledged: true })
      showToast('Consent acknowledged', 'success')
      setAcknowledged(false)
      // keep selectedId and patientName for possible next
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this consent record?')) return
    try {
      await deleteSessionConsentForm(sessionId, id)
      showToast('Removed', 'success')
      await load()
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="py-4 text-center text-sm text-slate-400">Loading consent forms...</div>

  return (
    <div className="space-y-4">
      {records.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-500">Acknowledged ({records.length})</h4>
          {records.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border bg-white p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-slate-900">{r.consent_title || r.master_title || r.consent_key}</p>
                <p className="text-xs text-slate-500">Patient: {r.patient_name} {r.acknowledged && <span className="inline-flex items-center gap-1 ml-2 text-emerald-600"><CheckCircle className="h-3 w-3" /> Acknowledged</span>}</p>
                {r.acknowledged_at && <p className="text-xs text-slate-400">{new Date(r.acknowledged_at).toLocaleString()}</p>}
                <a href={r.file_path || r.master_file_path} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:underline">Open PDF <ExternalLink className="h-3 w-3" /></a>
              </div>
              <button type="button" onClick={() => handleDelete(r.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Add Consent Form</h4>
        {consentForms.length === 0 ? (
          <p className="text-sm text-slate-500 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> No active consent forms available.</p>
        ) : (
          <>
            <label className="block text-sm">
              <span className="font-medium text-slate-600">Consent Form</span>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm">
                <option value="">Select consent form</option>
                {consentForms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </label>
            {selectedForm && (
              <div className="rounded border bg-white p-3">
                <p className="font-medium text-sm">{selectedForm.title}</p>
                {selectedForm.description && <p className="text-xs text-slate-500 mt-1">{selectedForm.description}</p>}
                <a href={selectedForm.file_path} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700">Open Consent Form <ExternalLink className="h-3 w-3" /></a>
              </div>
            )}
            <label className="block text-sm">
              <span className="font-medium text-slate-600">Patient Name</span>
              <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Confirm patient name" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600" />
              <span>I acknowledge and consent to the above treatment/procedure.</span>
            </label>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex justify-end">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Acknowledgement'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

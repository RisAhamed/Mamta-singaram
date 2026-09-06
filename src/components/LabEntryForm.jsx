import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, Loader2, FlaskConical } from 'lucide-react'
import MasterSelect from './MasterSelect'
import {
  getLabEntries,
  createLabEntry,
  updateLabEntry,
  deleteLabEntry,
  getLabVendors,
  createLabVendor,
} from '../lib/api'

function formatMoney(v) {
  return Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatDateShort(d) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '-'
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const emptyForm = { test_name: '', lab_vendor_id: '', cost: '', entry_date: '', notes: '' }

export default function LabEntryForm({ sessionId, readOnly = false }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchEntries = async () => {
    if (!sessionId) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getLabEntries(sessionId)
      const arr = Array.isArray(data) ? data : data?.data ?? data?.rows ?? []
      setEntries(arr)
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEntries() }, [sessionId])

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setError('')
  }

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setForm({
      test_name: entry.test_name || '',
      lab_vendor_id: entry.lab_vendor_id || '',
      cost: entry.cost != null ? String(entry.cost) : '',
      entry_date: entry.entry_date ? String(entry.entry_date).split('T')[0] : '',
      notes: entry.notes || '',
    })
    setError('')
  }

  const validate = () => {
    if (!form.test_name.trim()) { setError('Test name is required'); return false }
    if (form.cost === '' || isNaN(Number(form.cost))) { setError('Cost must be a numeric value'); return false }
    if (Number(form.cost) < 0) { setError('Cost must be non-negative'); return false }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        test_name: form.test_name.trim(),
        lab_vendor_id: form.lab_vendor_id || null,
        cost: Math.round(Number(form.cost) * 100) / 100,
        entry_date: form.entry_date || null,
        notes: form.notes.trim() || null,
      }
      if (editingId) {
        await updateLabEntry(sessionId, editingId, payload)
      } else {
        await createLabEntry(sessionId, payload)
      }
      resetForm()
      await fetchEntries()
    } catch (e) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (!confirm('Delete this lab entry?')) return
    try {
      await deleteLabEntry(sessionId, entryId)
      await fetchEntries()
    } catch (e) {
      setError(e.message || 'Failed to delete')
    }
  }

  const totalCost = entries.reduce((sum, e) => sum + (Number(e.cost) || 0), 0)

  if (loading) {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
        <Loader2 className="mx-auto h-4 w-4 animate-spin" /> Loading lab entries...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">{entries.length} entries</span>
          <span className="text-xs font-semibold text-slate-700">Total: ₹{formatMoney(totalCost)}</span>
        </div>
      )}

      {entries.length === 0 && !editingId ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <FlaskConical className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No lab entries for this session</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Lab / Vendor</th>
                <th className="px-3 py-2">Test</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Notes</th>
                {!readOnly && <th className="px-3 py-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="bg-white">
                  <td className="px-3 py-2 text-sm font-medium text-slate-700">
                    {entry.lab_vendor_name || <span className="text-slate-400">-</span>}
                    {entry.lab_vendor_id && entry.lab_vendor_name && (
                      <span className="ml-1 text-xs text-slate-400">(saved)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-700">{entry.test_name}</td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-slate-900">₹{formatMoney(entry.cost)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{formatDateShort(entry.entry_date)}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-xs text-slate-500">{entry.notes || '-'}</td>
                  {!readOnly && (
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => startEdit(entry)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => handleDelete(entry.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!readOnly && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">{editingId ? 'Edit Lab Entry' : 'Add Lab Entry'}</h4>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700">Cancel edit</button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Test Name *</label>
              <input
                type="text"
                value={form.test_name}
                onChange={(e) => setForm({ ...form, test_name: e.target.value })}
                placeholder="e.g. Blood Panel, X-Ray"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Lab / Vendor</label>
              <MasterSelect
                label=""
                value={form.lab_vendor_id}
                onChange={(v) => setForm({ ...form, lab_vendor_id: v })}
                fetchFn={getLabVendors}
                createFn={createLabVendor}
                placeholder="Select lab/vendor"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Cost (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Update' : 'Add Entry'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Check, X, Loader2, ChevronDown } from 'lucide-react'

export default function MasterSelect({
  label,
  value,
  onChange,
  fetchFn,
  createFn,
  placeholder = 'Select...',
  currentValueLabel = null,
  required = false,
  disabled = false,
}) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchFn(true)
      const list = Array.isArray(data) ? data : data?.data ?? []
      setOptions(list.filter(o => o.is_active !== false))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line
  useEffect(() => { load() }, [])

  const handleSelect = (e) => {
    const v = e.target.value
    if (v === '__add_new__') {
      setShowAdd(true)
      setNewValue('')
      setError('')
      return
    }
    onChange(v || '')
  }

  const handleCreate = async () => {
    const trimmed = newValue.trim()
    if (!trimmed) { setError('Value cannot be blank'); return }
    // case-insensitive duplicate check
    const exists = options.find(o => o.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      setError(`"${trimmed}" already exists`)
      onChange(exists.id)
      setShowAdd(false)
      setNewValue('')
      return
    }
    setSaving(true)
    setError('')
    try {
      const created = await createFn({ name: trimmed })
      const newId = created.id || created?.data?.id
      await load()
      onChange(newId || created.id)
      setShowAdd(false)
      setNewValue('')
    } catch (e) {
      // Handle concurrent duplicate gracefully (server 400)
      if (e.message && e.message.toLowerCase().includes('already exists')) {
        setError(e.message)
        // try to select existing after reload
        await load()
        const dup = options.find(o => o.name.toLowerCase() === trimmed.toLowerCase())
        if (dup) onChange(dup.id)
      } else {
        setError(e.message)
      }
    } finally {
      setSaving(false)
    }
  }

  // Historical value not in active list - show as disabled option using snapshot label
  const hasHistorical = value && !options.some(o => o.id === value) && currentValueLabel
  const displayOptions = hasHistorical ? [{ id: value, name: `${currentValueLabel} (inactive)`, _historical: true }, ...options] : options

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={handleSelect}
          disabled={disabled || loading}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 appearance-none"
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {displayOptions.map(opt => (
            <option key={opt.id} value={opt.id} disabled={opt._historical}>
              {opt.name}
            </option>
          ))}
          <option value="__add_new__">+ Add new</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {showAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={e => { setNewValue(e.target.value); setError('') }}
            placeholder={`New ${label.toLowerCase()}`}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            autoFocus
          />
          <button type="button" onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
          </button>
          <button type="button" onClick={()=>{setShowAdd(false); setError('')}} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hasHistorical && <p className="text-xs text-amber-600">Historical value preserved: {currentValueLabel}</p>}
    </div>
  )
}

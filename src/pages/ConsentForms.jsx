import { useEffect, useState } from 'react'
import { FileText, ExternalLink } from 'lucide-react'
import { getConsentForms } from '../lib/api'

export default function ConsentForms() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getConsentForms(true)
        const arr = Array.isArray(data) ? data : data?.data ?? []
        setForms(arr)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">Loading consent forms...</div>
  if (error) return <div className="flex h-64 items-center justify-center text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><FileText className="h-6 w-6 text-teal-600" />Consent Forms</h1>
        <p className="mt-1 text-sm text-slate-500">Active consent documents — click to open in a new tab</p>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 font-medium text-slate-600">No Consent Forms Available</p>
          <p className="mt-1 text-sm text-slate-400">Consent forms will appear here when configured.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {forms.map(f => (
            <a
              key={f.id}
              href={f.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4 hover:border-teal-300 hover:shadow-sm transition"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{f.title}</p>
                {f.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{f.description}</p>}
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-600">Open PDF <ExternalLink className="h-3 w-3" /></p>
              </div>
              <FileText className="h-5 w-5 shrink-0 text-slate-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

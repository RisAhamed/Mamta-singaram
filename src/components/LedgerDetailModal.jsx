import { format } from 'date-fns'
import { X, DollarSign, FileText, Calendar, ExternalLink, Trash2 } from 'lucide-react'

const entryTypeConfig = {
  charge: { color: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'Charge', icon: DollarSign },
  payment: { color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Payment', icon: DollarSign },
  adjustment: { color: 'bg-violet-50 text-violet-700 ring-violet-200', label: 'Adjustment', icon: DollarSign },
  lab_fee: { color: 'bg-sky-50 text-sky-700 ring-sky-200', label: 'Lab Fee', icon: FileText },
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const d = new Date(dateValue)
  if (isNaN(d.getTime())) return '-'
  return format(d, 'dd MMM yyyy')
}

function formatDateTime(dateValue) {
  if (!dateValue) return '-'
  const d = new Date(dateValue)
  if (isNaN(d.getTime())) return '-'
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export default function LedgerDetailModal({ entry, onClose, onDelete, onNavigateSession }) {
  if (!entry) return null

  const config = entryTypeConfig[entry.entry_type] || entryTypeConfig.charge
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ledger Entry</h3>
              <p className="text-sm text-slate-500">{config.label}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <span className="text-sm text-slate-600">Amount</span>
            <span className={`text-xl font-bold ${(entry.entry_type === 'payment') ? 'text-emerald-700' : 'text-slate-900'}`}>
              {entry.entry_type === 'payment' ? '+' : '-'}₹{formatMoney(entry.amount)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Entry Type</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Entry Date</p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(entry.entry_date)}
              </div>
            </div>
          </div>

          {entry.description && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-700">{entry.description}</p>
            </div>
          )}

          {entry.session_id && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
              <p className="text-xs font-medium uppercase text-teal-600">Linked Session</p>
              <button
                type="button"
                onClick={() => onNavigateSession && onNavigateSession(entry.session_id)}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline"
              >
                View Session <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Created</p>
              <p className="mt-1 text-xs text-slate-600">{formatDateTime(entry.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Last Updated</p>
              <p className="mt-1 text-xs text-slate-600">{formatDateTime(entry.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this ledger entry? This action cannot be undone.')) {
                onDelete && onDelete(entry)
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

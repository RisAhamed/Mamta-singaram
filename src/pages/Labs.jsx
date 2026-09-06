import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Search, Users, Package, AlertCircle } from 'lucide-react'
import { getLabSummary } from '../lib/api'

function formatMoney(v) {
  return Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export default function Labs() {
  const navigate = useNavigate()
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getLabSummary()
        const arr = Array.isArray(data) ? data : data?.data ?? []
        setLabs(arr)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = search
    ? labs.filter(l => l.lab_vendor_name.toLowerCase().includes(search.toLowerCase()))
    : labs

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">Loading labs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertCircle className="h-6 w-6 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-teal-600" />
            Lab Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">Aggregate view across all patients and sessions</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search labs..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Total Labs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{labs.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{labs.reduce((s, l) => s + l.order_count, 0)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">₹{formatMoney(labs.reduce((s, l) => s + l.total_cost, 0))}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">₹{formatMoney(labs.reduce((s, l) => s + l.total_outstanding, 0))}</p>
        </div>
      </div>

      {/* Lab list - table on desktop, cards on mobile */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-12 text-center">
          <FlaskConical className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-600">No labs found</p>
          <p className="mt-1 text-xs text-slate-400">Labs appear here after you create lab orders in patient sessions.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lab Name</th>
                    <th className="px-4 py-3 font-semibold text-center"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Patients</span></th>
                    <th className="px-4 py-3 font-semibold text-center"><span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> Orders</span></th>
                    <th className="px-4 py-3 font-semibold text-right">This Month</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Spent</th>
                    <th className="px-4 py-3 font-semibold text-right">Paid</th>
                    <th className="px-4 py-3 font-semibold text-right">Outstanding</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(lab => (
                    <tr
                      key={lab.lab_key}
                      onClick={() => navigate(`/labs/${lab.lab_vendor_id || 'unassigned'}`)}
                      className="cursor-pointer hover:bg-teal-50/50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{lab.lab_vendor_name}</td>
                      <td className="px-4 py-3 text-center">{lab.patient_count}</td>
                      <td className="px-4 py-3 text-center">{lab.order_count}</td>
                      <td className="px-4 py-3 text-right">₹{formatMoney(lab.month_cost)}</td>
                      <td className="px-4 py-3 text-right">₹{formatMoney(lab.total_cost)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">₹{formatMoney(lab.total_paid)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${lab.total_outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{formatMoney(lab.total_outstanding)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${lab.is_active === false ? 'bg-slate-100 text-slate-500 ring-slate-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                          {lab.is_active === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {filtered.map(lab => (
              <button
                key={lab.lab_key}
                type="button"
                onClick={() => navigate(`/labs/${lab.lab_vendor_id || 'unassigned'}`)}
                className="rounded-xl border bg-white p-4 text-left shadow-sm hover:border-teal-200"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{lab.lab_vendor_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${lab.is_active === false ? 'bg-slate-100 text-slate-500 ring-slate-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                    {lab.is_active === false ? 'Inactive' : 'Active'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Patients</p>
                    <p className="font-bold text-slate-900">{lab.patient_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Orders</p>
                    <p className="font-bold text-slate-900">{lab.order_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className={`font-bold ${lab.total_outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{formatMoney(lab.total_outstanding)}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Total: ₹{formatMoney(lab.total_cost)}</span>
                  <span>Month: ₹{formatMoney(lab.month_cost)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

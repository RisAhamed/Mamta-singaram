import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const entryTypeColor = {
  charge: 'bg-amber-500',
  payment: 'bg-emerald-500',
  adjustment: 'bg-violet-500',
  lab_fee: 'bg-sky-500',
}

const entryTypeLabel = {
  charge: 'Charge',
  payment: 'Payment',
  adjustment: 'Adjustment',
  lab_fee: 'Lab Fee',
}

export default function LedgerCalendar({ entries = [], currentMonth, onMonthChange, onSelectDate, selectedDate, onEntryClick }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = useMemo(() => {
    const arr = []
    let d = gridStart
    while (d <= gridEnd) {
      arr.push(new Date(d))
      d = addDays(d, 1)
    }
    return arr
  }, [gridStart, gridEnd])

  const byDate = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const d = e.entry_date ? new Date(e.entry_date) : null
      if (!d || isNaN(d.getTime())) return
      const key = format(d, 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [entries])

  const monthSummary = useMemo(() => {
    let totalCharges = 0
    let totalPayments = 0
    entries.forEach(e => {
      const amt = Number(e.amount) || 0
      if (e.entry_type === 'charge' || e.entry_type === 'lab_fee') totalCharges += amt
      if (e.entry_type === 'payment') totalPayments += amt
      if (e.entry_type === 'adjustment') totalCharges -= amt
    })
    return { totalCharges, totalPayments, balance: totalCharges - totalPayments }
  }, [entries])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button type="button" onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="rounded-md p-2 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => onMonthChange(new Date())} className="rounded-md px-3 py-1 text-xs font-medium hover:bg-slate-100">Today</button>
          <button type="button" onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="rounded-md p-2 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-center">
        <div>
          <p className="text-[10px] font-medium uppercase text-slate-500">Charges</p>
          <p className="text-xs font-semibold text-amber-700">₹{monthSummary.totalCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase text-slate-500">Payments</p>
          <p className="text-xs font-semibold text-emerald-700">₹{monthSummary.totalPayments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase text-slate-500">Balance</p>
          <p className={`text-xs font-semibold ${monthSummary.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>₹{monthSummary.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {weekDays.map(w => <div key={w} className="py-2">{w}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEntries = byDate[key] || []
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          const dayTotal = dayEntries.reduce((sum, e) => {
            const amt = Number(e.amount) || 0
            if (e.entry_type === 'payment') return sum + amt
            return sum - amt
          }, 0)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(new Date(day))}
              className={`relative flex min-h-[72px] flex-col rounded-lg border p-1.5 text-left transition ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:bg-slate-50'} ${!isCurrentMonth ? 'opacity-40' : ''} ${isToday ? 'ring-1 ring-teal-300' : ''}`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-teal-700' : 'text-slate-700'}`}>{format(day, 'd')}</span>
              <div className="mt-1 space-y-0.5">
                {dayEntries.slice(0, 3).map(e => (
                  <span
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); onEntryClick && onEntryClick(e) }}
                    className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${entryTypeColor[e.entry_type] || 'bg-slate-500'}`}
                    title={`${entryTypeLabel[e.entry_type] || e.entry_type} ₹${Number(e.amount).toLocaleString('en-IN')} ${e.description || ''}`}
                  >
                    {entryTypeLabel[e.entry_type] || e.entry_type} ₹{Number(e.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                ))}
                {dayEntries.length > 3 && <span className="text-[10px] text-slate-500">+{dayEntries.length - 3} more</span>}
              </div>
              {dayEntries.length > 0 && (
                <span className={`mt-auto text-right text-[10px] font-medium ${dayTotal > 0 ? 'text-rose-600' : dayTotal < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {dayTotal > 0 ? '+' : ''}₹{Math.abs(dayTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Charge</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" /> Adjustment</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> Lab Fee</span>
      </div>
    </div>
  )
}

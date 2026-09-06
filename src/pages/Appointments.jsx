import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Calendar, Plus, Search, X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients } from '../lib/api'
import { getLocations } from '../lib/api'
import AppointmentCalendar from '../components/AppointmentCalendar'
import AppointmentDetailModal from '../components/AppointmentDetailModal'

export default function Appointments(){
  const navigate=useNavigate()
  const {showToast}=useToast()
  const [currentMonth,setCurrentMonth]=useState(new Date())
  const [appointments,setAppointments]=useState([])
  const [loading,setLoading]=useState(true)
  const [selectedDate,setSelectedDate]=useState(new Date())
  const [selectedAppt,setSelectedAppt]=useState(null)
  const [showCreate,setShowCreate]=useState(false)
  const [form,setForm]=useState({ patient_id:'', appointment_date:'', appointment_time:'', title:'', notes:'', location_id:'', status:'Scheduled' })
  const [saving,setSaving]=useState(false)
  const [patients,setPatients]=useState([])
  const [locations,setLocations]=useState([])
  const [search,setSearch]=useState('')

  const load = async (month=currentMonth)=>{
    setLoading(true)
    try{
      const start=format(startOfMonth(month),'yyyy-MM-dd')
      const end=format(endOfMonth(month),'yyyy-MM-dd')
      const data=await getAppointments({ date_from:start, date_to:end })
      const arr=Array.isArray(data)?data: data?.data ?? data?.rows ?? []
      setAppointments(arr)
    }catch(e){ showToast(e.message,'error')}
    finally{ setLoading(false)}
  }

  // eslint-disable-next-line
  useEffect(()=>{ load(currentMonth) },[currentMonth])
  useEffect(()=>{
    getPatients().then(d=> setPatients(Array.isArray(d)?d: d?.data ?? [])).catch(()=>{})
    getLocations(true).then(d=> setLocations(Array.isArray(d)?d: d?.data ?? [])).catch(()=>{})
  },[])

  const handleMonthChange=(d)=> setCurrentMonth(d)
  const handleSelectDate=(d)=> setSelectedDate(d)

  const filteredDay = appointments.filter(a=> String(a.appointment_date).split('T')[0]===format(selectedDate,'yyyy-MM-dd'))
  const filteredSearch = search ? filteredDay.filter(a=> (a.title||'').toLowerCase().includes(search.toLowerCase()) || (a.notes||'').toLowerCase().includes(search.toLowerCase())) : filteredDay

  const handleCreate=async(e)=>{
    e.preventDefault()
    if(!form.patient_id) return showToast('Patient is required','warning')
    if(!form.appointment_date) return showToast('Date is required','warning')
    setSaving(true)
    try{
      await createAppointment(form)
      showToast('Appointment created','success')
      setShowCreate(false)
      setForm({ patient_id:'', appointment_date:'', appointment_time:'', title:'', notes:'', location_id:'', status:'Scheduled' })
      await load(currentMonth)
    }catch(err){ showToast(err.message,'error')}
    finally{ setSaving(false)}
  }

  const handleStatusChange=async(appt,status)=>{
    try{ await updateAppointment(appt.id,{status}); showToast('Status updated','success'); setSelectedAppt(null); await load(currentMonth)}catch(e){ showToast(e.message,'error')}
  }
  const handleDelete=async(appt)=>{
    if(!confirm('Delete appointment?')) return
    try{ await deleteAppointment(appt.id); showToast('Deleted','success'); setSelectedAppt(null); await load(currentMonth)}catch(e){ showToast(e.message,'error')}
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">Calendar view — upcoming and historical, date-range queried</p>
        </div>
        <button type="button" onClick={()=>setShowCreate(true)} className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"><Plus className="h-4 w-4"/> New Appointment</button>
      </div>

      {loading ? <div className="h-64 animate-pulse rounded-xl bg-slate-100"/> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AppointmentCalendar appointments={appointments} currentMonth={currentMonth} onMonthChange={handleMonthChange} onSelectDate={handleSelectDate} selectedDate={selectedDate} onAppointmentClick={setSelectedAppt} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{format(selectedDate,'dd MMM yyyy')}</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{filteredDay.length} appts</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title/notes" className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"/>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredSearch.length===0 ? (
                <div className="py-8 text-center text-sm text-slate-500"><Calendar className="mx-auto mb-2 h-6 w-6 text-slate-300"/>No appointments on this date</div>
              ) : filteredSearch.map(a=>(
                <button key={a.id} type="button" onClick={()=>setSelectedAppt(a)} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{a.title || 'Appointment'} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ring-1 ${a.status==='Completed'?'bg-emerald-50 text-emerald-700 ring-emerald-200': a.status==='Cancelled'?'bg-slate-100 text-slate-600 ring-slate-200': a.status==='No-Show'?'bg-rose-50 text-rose-700 ring-rose-200':'bg-blue-50 text-blue-700 ring-blue-200'}`}>{a.status}</span></p>
                  <p className="text-xs text-slate-500">{a.appointment_time ? String(a.appointment_time).slice(0,5)+' · ' : ''}{a.location_name || ''}</p>
                  {a.notes && <p className="mt-1 truncate text-xs text-slate-600">{a.notes}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedAppt && (
        <AppointmentDetailModal
          appointment={selectedAppt}
          onClose={()=>setSelectedAppt(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onNavigatePatient={(pid)=>{ setSelectedAppt(null); navigate(`/patients/${pid}`)}}
          onNavigateSession={(sid,pid)=>{ setSelectedAppt(null); if(sid) navigate(`/sessions/edit/${sid}`); else if(pid) navigate(`/patients/${pid}`)}}
        />
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowCreate(false)}>
          <form onSubmit={handleCreate} onClick={e=>e.stopPropagation()} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">New Appointment</h3><button type="button" onClick={()=>setShowCreate(false)} className="rounded p-1 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>
            <label className="block text-sm">Patient *<select value={form.patient_id} onChange={e=>setForm({...form, patient_id:e.target.value})} className="mt-1 w-full rounded border px-3 py-2 text-sm" required><option value="">Select patient</option>{patients.map(p=> <option key={p.id} value={p.id}>{p.full_name} — {p.patient_id}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">Date *<input type="date" value={form.appointment_date} onChange={e=>setForm({...form, appointment_date:e.target.value})} className="mt-1 w-full rounded border px-3 py-2 text-sm" required/></label>
              <label className="block text-sm">Time<input type="time" value={form.appointment_time} onChange={e=>setForm({...form, appointment_time:e.target.value})} className="mt-1 w-full rounded border px-3 py-2 text-sm"/></label>
            </div>
            <label className="block text-sm">Title<input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Follow-up, Cleaning..." className="mt-1 w-full rounded border px-3 py-2 text-sm"/></label>
            <label className="block text-sm">Location<select value={form.location_id} onChange={e=>setForm({...form, location_id:e.target.value})} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option value="">Select location</option>{locations.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
            <label className="block text-sm">Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="mt-1 w-full rounded border px-3 py-2 text-sm"><option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-Show</option></select></label>
            <label className="block text-sm">Notes<textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} rows={2} className="mt-1 w-full rounded border px-3 py-2 text-sm"/></label>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setShowCreate(false)} className="rounded border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Create'}</button></div>
          </form>
        </div>
      )}
    </main>
  )
}

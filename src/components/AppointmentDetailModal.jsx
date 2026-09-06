import { format, parseISO } from 'date-fns'
import { X, Calendar, Clock, MapPin, User, FileText, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getPatient, getSession } from '../lib/api'

function toDate(d){ if(!d) return null; const dd=typeof d==='string'?parseISO(d):new Date(d); return isNaN(dd.getTime())?null:dd }
function formatDate(d){ const dd=toDate(d); return dd?format(dd,'dd MMM yyyy'): '-' }

const statusBadge={
  Scheduled:'bg-blue-50 text-blue-700 ring-blue-200',
  Completed:'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled:'bg-slate-100 text-slate-600 ring-slate-200',
  'No-Show':'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function AppointmentDetailModal({ appointment, onClose, onStatusChange, onDelete, onNavigatePatient, onNavigateSession }) {
  const [patientName, setPatientName] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(()=>{
    if(!appointment) return
    let cancelled=false
    // Do not fetch entire DB: fetch single patient/session by id only if needed for display (if name not already in appointment)
    // For now we try to fetch patient name if not present
    if(appointment.patient_id){
      getPatient(appointment.patient_id).then(p=>{
        if(!cancelled) setPatientName(p.full_name || p.patient_id || '')
      }).catch(()=>{})
    }
    if(appointment.session_id){
      getSession(appointment.session_id).then(s=>{
        if(!cancelled) setSessionInfo(s)
      }).catch(()=>{})
    }
    return ()=>{cancelled=true}
  },[appointment])

  if(!appointment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{appointment.title || 'Appointment'}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge[appointment.status]||'bg-slate-100 text-slate-700 ring-slate-200'}`}>{appointment.status}</span>
            {appointment.location_name && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"><MapPin className="h-3 w-3"/>{appointment.location_name}</span>}
          </div>

          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-slate-700"><User className="h-4 w-4 text-slate-400"/>{patientName || appointment.patient_id} <button type="button" onClick={()=>onNavigatePatient && onNavigatePatient(appointment.patient_id)} className="text-xs font-medium text-teal-600 hover:underline">View patient</button></p>
            <p className="flex items-center gap-2 text-slate-700"><Calendar className="h-4 w-4 text-slate-400"/>{formatDate(appointment.appointment_date)} {appointment.appointment_time && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5"/>{String(appointment.appointment_time).slice(0,5)}</span>}</p>
            {appointment.notes && <p className="flex gap-2 text-slate-700"><FileText className="h-4 w-4 mt-0.5 text-slate-400"/><span>{appointment.notes}</span></p>}
            {appointment.session_id && (
              <p className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Related session:</span>
                <button type="button" onClick={()=>onNavigateSession && onNavigateSession(appointment.session_id, appointment.patient_id)} className="inline-flex items-center gap-1 text-teal-600 hover:underline">
                  {sessionInfo ? `${formatDate(sessionInfo.visit_date)} - ${sessionInfo.chief_complaint?.slice(0,30)}` : appointment.session_id} <ExternalLink className="h-3 w-3"/>
                </button>
              </p>
            )}
          </div>

          {onStatusChange && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-600">Change status:</span>
              {['Scheduled','Completed','Cancelled','No-Show'].map(s=>(
                <button key={s} type="button" onClick={()=>onStatusChange(appointment, s)} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${appointment.status===s?'bg-teal-600 text-white ring-teal-600':'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={()=>onDelete && onDelete(appointment)} className="rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">Delete</button>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  )
}

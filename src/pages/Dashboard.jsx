import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  IndianRupee,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { getPatients, getPatient, getSessions } from '../lib/api'

const initialStats = {
  totalPatients: 0,
  sessionsThisMonth: 0,
  todayAppointments: 0,
  pendingPayments: 0,
  pendingAmount: 0,
}

function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stats, setStats] = useState(initialStats)
  const [recentPatients, setRecentPatients] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)

      try {
        const today = new Date().toISOString().split('T')[0]
        const monthStart = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        )
          .toISOString()
          .split('T')[0]
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        // 1. Total patients & recent patients — from single getPatients call
        const allPatients = await getPatients()
        const totalPatients = allPatients.length

        // 2. Sessions this month — backend filter on visit_date
        const monthSessions = await getSessions({ visit_date_from: monthStart })
        const sessionsThisMonth = monthSessions.length

        // 3. All sessions — used to derive today's appointments and upcoming
        //    Backend getSessions filters on visit_date, not next_visit_date, so filter client side
        const allSessions = await getSessions()
        const todayAppointments = allSessions.filter(
          (s) => normalizeDateValue(s.next_visit_date) === today,
        ).length

        // 4. Pending dues — two queries merged
        const [pending, partial] = await Promise.all([
          getSessions({ payment_status: 'Pending' }),
          getSessions({ payment_status: 'Partial' }),
        ])
        const pendingSessions = [...pending, ...partial]
        const pendingAmount = pendingSessions.reduce(
          (sum, s) => sum + Number(s.treatment_cost || 0) - Number(s.amount_paid || 0),
          0,
        )

        // 5. Upcoming appointments — filter next_visit_date between today and nextWeek, sort, limit 10
        const upcoming = allSessions
          .filter((s) => {
            const nvd = normalizeDateValue(s.next_visit_date)
            return nvd && nvd >= today && nvd <= nextWeek
          })
          .sort((a, b) => normalizeDateValue(a.next_visit_date).localeCompare(normalizeDateValue(b.next_visit_date)))
          .slice(0, 10)

        // 6. Batch patient lookup via getPatient per id
        const patientIds = [...new Set(upcoming.map((s) => s.patient_id).filter(Boolean))]
        const patientResults = await Promise.all(
          patientIds.map((id) => getPatient(id).catch(() => null)),
        )
        const patientMap = {}
        patientResults.forEach((p) => {
          if (p && p.id) patientMap[p.id] = p
          else if (p && p.patient_id) patientMap[p.id || p.patient_id] = p
        })
        // Fallback: some APIs return patient with id field, ensure map keyed correctly
        // Re-map using requested ids order if response id differs
        patientIds.forEach((id, idx) => {
          const res = patientResults[idx]
          if (res && !patientMap[id] && res.id) {
            patientMap[id] = res
          }
        })
        const upcomingWithPatients = upcoming.map((session) => {
          const patient = patientMap[session.patient_id] || null
          return { ...session, patient, patients: patient }
        })

        // 7. Recent patients — sort by created_at desc, limit 5
        const recentPatients = [...allPatients]
          .sort((a, b) => toMillis(b.created_at) - toMillis(a.created_at))
          .slice(0, 5)

        setStats({
          totalPatients,
          sessionsThisMonth,
          todayAppointments,
          pendingPayments: pendingSessions.length,
          pendingAmount,
        })
        setRecentPatients(recentPatients)
        setUpcomingAppointments(upcomingWithPatients)
      } catch (error) {
        showToast(error.message || 'Unable to load dashboard.', 'error')
      } finally {
        setLoading(false)
      }
    }

    Promise.resolve().then(loadDashboard)
  }, [showToast])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-2 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-2 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-normal text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.totalPatients}
          className="border-teal-100 bg-teal-50 text-teal-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Sessions This Month"
          value={stats.sessionsThisMonth}
          className="border-blue-100 bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={stats.todayAppointments}
          className="border-purple-100 bg-purple-50 text-purple-700"
        />
        <StatCard
          icon={IndianRupee}
          label="Pending Dues"
          value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`}
          detail={`${stats.pendingPayments} sessions`}
          className="border-red-100 bg-red-50 text-red-700"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold tracking-normal text-slate-700">
              <Clock className="h-4 w-4 text-purple-500" />
              Upcoming Appointments
            </h2>
            <span className="text-xs text-slate-400">Next 7 days</span>
          </div>

          {upcomingAppointments.length === 0 ? (
            <EmptyState icon={Calendar} message="No upcoming appointments" />
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => navigate(`/patients/${appointment.patient_id}`)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-100 p-3 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {appointment.patients?.full_name || 'Patient'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {appointment.chief_complaint || '-'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-purple-600">
                      {formatDate(appointment.next_visit_date)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {appointment.patients?.phone || '-'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold tracking-normal text-slate-700">
              <Users className="h-4 w-4 text-teal-500" />
              Recent Patients
            </h2>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="text-xs font-medium text-teal-600 hover:underline"
            >
              View all
            </button>
          </div>

          {recentPatients.length === 0 ? (
            <EmptyState icon={Users} message="No patients yet" />
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-100 p-3 text-left transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                      {patient.full_name?.charAt(0).toUpperCase() || 'P'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {patient.full_name}
                      </p>
                      <p className="text-xs text-slate-400">{patient.phone || '-'}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">
                    {formatDate(patient.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({ icon: Icon, label, value, detail, className }) {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold tracking-normal">{value}</p>
      {detail && <p className="mt-1 text-xs opacity-70">{detail}</p>}
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="py-8 text-center">
      <Icon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}

function formatDate(dateValue) {
  const d = toDate(dateValue)
  if (!d) return '—'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function normalizeDateValue(dateValue) {
  if (!dateValue) return ''
  return String(dateValue).split('T')[0]
}

function toDate(dateValue) {
  if (!dateValue) return null
  const d = new Date(dateValue)
  return isNaN(d.getTime()) ? null : d
}

function toMillis(dateValue) {
  const d = toDate(dateValue)
  return d ? d.getTime() : -Infinity
}

export default Dashboard

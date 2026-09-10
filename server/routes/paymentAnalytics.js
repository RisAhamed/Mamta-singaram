import { Router } from 'express'
import pool from '../db.js'

const router = Router()

function buildSessionWhere(query, startIdx = 1) {
  const conds = []
  const vals = []
  let idx = startIdx
  if (query.from) { conds.push(`s.visit_date >= $${idx}`); vals.push(query.from); idx++ }
  if (query.to) { conds.push(`s.visit_date <= $${idx}`); vals.push(query.to); idx++ }
  if (query.location_id) { conds.push(`s.location_id = $${idx}`); vals.push(query.location_id); idx++ }
  if (query.status && query.status !== 'All' && ['Pending','Partial','Paid'].includes(query.status)) {
    conds.push(`s.payment_status = $${idx}`); vals.push(query.status); idx++
  }
  if (query.search) {
    conds.push(`(p.full_name ILIKE $${idx} OR p.patient_id ILIKE $${idx} OR p.phone ILIKE $${idx})`)
    vals.push(`%${query.search}%`); idx++
  }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
  return { where, vals, nextIdx: idx }
}

// GET /api/payments/analytics?from=&to=&location_id=
router.get('/analytics', async (req, res) => {
  try {
    const { from, to, location_id } = req.query

    const now = new Date()
    const pad = (n)=> String(n).padStart(2,'0')
    const monthStart = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
    const monthEnd = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(lastDay)}`

    // Use provided range for cards, or default to current month? Spec says default This Month
    const effectiveFrom = from || monthStart
    const effectiveTo = to || monthEnd

    // Build where for filtered stats (respects user filters)
    const f = buildSessionWhere({ from: effectiveFrom, to: effectiveTo, location_id })
    const f2 = buildSessionWhere({ from: effectiveFrom, to: effectiveTo, location_id, status: 'Pending' })
    const f3 = buildSessionWhere({ from: effectiveFrom, to: effectiveTo, location_id, status: 'Partial' })
    const f4 = buildSessionWhere({ from: effectiveFrom, to: effectiveTo, location_id, status: 'Paid' })

    // Overall filtered aggregation
    const agg = await pool.query(`
      SELECT
        COALESCE(SUM(s.treatment_cost),0) as total_cost,
        COALESCE(SUM(s.amount_paid),0) as total_paid,
        COALESCE(SUM(GREATEST(s.treatment_cost - s.amount_paid, 0)),0) as outstanding,
        COUNT(*) as session_count,
        COUNT(DISTINCT s.patient_id) as patient_count
      FROM sessions s
      LEFT JOIN patients p ON p.id = s.patient_id
      ${f.where}
    `, f.vals)

    const pendingAgg = await pool.query(`
      SELECT COALESCE(SUM(GREATEST(s.treatment_cost - s.amount_paid,0)),0) as pending_amount,
             COUNT(*) as cnt
      FROM sessions s LEFT JOIN patients p ON p.id=s.patient_id ${f2.where}
    `, f2.vals)

    const partialAgg = await pool.query(`
      SELECT COALESCE(SUM(GREATEST(s.treatment_cost - s.amount_paid,0)),0) as partial_amount,
             COUNT(*) as cnt
      FROM sessions s LEFT JOIN patients p ON p.id=s.patient_id ${f3.where}
    `, f3.vals)

    const paidAgg = await pool.query(`
      SELECT COALESCE(SUM(s.amount_paid),0) as paid_sum, COUNT(*) as cnt
      FROM sessions s LEFT JOIN patients p ON p.id=s.patient_id ${f4.where}
    `, f4.vals)

    const row = agg.rows[0]
    res.json({
      period: { from: effectiveFrom, to: effectiveTo },
      totalCost: Number(row.total_cost),
      totalPaid: Number(row.total_paid),
      outstanding: Number(row.outstanding),
      pendingAmount: Number(pendingAgg.rows[0].pending_amount),
      partialAmount: Number(partialAgg.rows[0].partial_amount),
      paidAmount: Number(paidAgg.rows[0].paid_sum),
      incomingThisMonth: Number(row.total_paid),
      counts: {
        sessions: Number(row.session_count),
        patients: Number(row.patient_count),
        pending: Number(pendingAgg.rows[0].cnt),
        partial: Number(partialAgg.rows[0].cnt),
        paid: Number(paidAgg.rows[0].cnt),
      }
    })
  } catch (err) {
    console.error('GET /api/payments/analytics error', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/payments/sessions?from=&to=&location_id=&status=&search=&limit=&offset=
router.get('/sessions', async (req, res) => {
  try {
    const { from, to, location_id, status, search, limit = 50, offset = 0 } = req.query
    const { where, vals, nextIdx } = buildSessionWhere({ from, to, location_id, status, search })
    const lim = Math.min(Number(limit) || 50, 200)
    const off = Number(offset) || 0
    const q = `
      SELECT s.*, p.full_name as patient_name, p.patient_id as patient_code, p.phone as patient_phone
      FROM sessions s
      LEFT JOIN patients p ON p.id = s.patient_id
      ${where}
      ORDER BY s.visit_date DESC, s.created_at DESC
      LIMIT $${nextIdx} OFFSET $${nextIdx + 1}
    `
    const r = await pool.query(q, [...vals, lim, off])

    // count
    const cntQ = `SELECT COUNT(*) as cnt FROM sessions s LEFT JOIN patients p ON p.id=s.patient_id ${where}`
    const cntR = await pool.query(cntQ, vals)

    const rows = r.rows.map(s => ({
      ...s,
      outstanding: Math.max(Number(s.treatment_cost || 0) - Number(s.amount_paid || 0), 0),
    }))
    res.json({ rows, total: Number(cntR.rows[0].cnt) })
  } catch (err) {
    console.error('GET /api/payments/sessions error', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

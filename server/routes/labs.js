import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/labs/summary - aggregated view for Lab Management portal
router.get('/summary', async (req, res) => {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    // All vendors including those with no orders (for overview completeness)
    // But primary data comes from lab_entries grouped by vendor
    const agg = await pool.query(`
      SELECT
        COALESCE(le.lab_vendor_id::text, 'unassigned') as lab_key,
        le.lab_vendor_id,
        COALESCE(le.lab_vendor_name, 'Unassigned') as lab_vendor_name,
        COUNT(DISTINCT le.patient_id) as patient_count,
        COUNT(*) as order_count,
        COALESCE(SUM(le.cost),0) as total_cost,
        COALESCE(SUM(le.amount_paid),0) as total_paid,
        COALESCE(SUM(le.cost - le.amount_paid),0) as total_outstanding,
        COALESCE(SUM(CASE WHEN le.entry_date >= $1 AND le.entry_date <= $2 THEN le.cost ELSE 0 END),0) as month_cost,
        COALESCE(SUM(CASE WHEN le.entry_date >= $1 AND le.entry_date <= $2 THEN le.amount_paid ELSE 0 END),0) as month_paid,
        COALESCE(SUM(CASE WHEN le.entry_date >= $1 AND le.entry_date <= $2 THEN (le.cost - le.amount_paid) ELSE 0 END),0) as month_outstanding,
        MAX(CASE WHEN lv.is_active IS NOT NULL THEN lv.is_active ELSE true END) as is_active
      FROM lab_entries le
      LEFT JOIN lab_vendors lv ON lv.id = le.lab_vendor_id
      GROUP BY le.lab_vendor_id, le.lab_vendor_name
      ORDER BY order_count DESC, lab_vendor_name
    `, [monthStart, monthEnd])

    // Also include vendors with zero orders
    const allVendors = await pool.query(`SELECT id, name, is_active FROM lab_vendors ORDER BY display_order, name`)
    const existingKeys = new Set(agg.rows.map(r => r.lab_vendor_id ? String(r.lab_vendor_id) : 'unassigned'))
    for (const v of allVendors.rows) {
      if (!existingKeys.has(String(v.id))) {
        agg.rows.push({
          lab_key: String(v.id),
          lab_vendor_id: v.id,
          lab_vendor_name: v.name,
          patient_count: '0',
          order_count: '0',
          total_cost: '0',
          total_paid: '0',
          total_outstanding: '0',
          month_cost: '0',
          month_paid: '0',
          month_outstanding: '0',
          is_active: v.is_active,
        })
      }
    }

    // Normalize numeric strings to numbers
    const result = agg.rows.map(r => ({
      lab_vendor_id: r.lab_vendor_id,
      lab_key: r.lab_key,
      lab_vendor_name: r.lab_vendor_name,
      is_active: r.is_active,
      patient_count: Number(r.patient_count),
      order_count: Number(r.order_count),
      total_cost: Number(r.total_cost),
      total_paid: Number(r.total_paid),
      total_outstanding: Number(r.total_outstanding),
      month_cost: Number(r.month_cost),
      month_paid: Number(r.month_paid),
      month_outstanding: Number(r.month_outstanding),
    }))

    // Sort again after adding zero-order vendors
    result.sort((a, b) => b.order_count - a.order_count || a.lab_vendor_name.localeCompare(b.lab_vendor_name))
    res.json(result)
  } catch (err) {
    console.error('GET /api/labs/summary error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/labs/:labVendorId - detail for single lab with orders + financials
router.get('/:labVendorId', async (req, res) => {
  try {
    const { labVendorId } = req.params
    const { from, to, status, patient_search, limit = 100, offset = 0 } = req.query

    let lab = null
    let vendorName = null

    if (labVendorId === 'unassigned') {
      vendorName = 'Unassigned'
    } else {
      const lr = await pool.query('SELECT * FROM lab_vendors WHERE id=$1', [labVendorId])
      if (!lr.rows.length) return res.status(404).json({ error: 'Lab not found' })
      lab = lr.rows[0]
      vendorName = lab.name
    }

    // Build dynamic WHERE
    const conditions = []
    const values = []
    let idx = 1
    if (labVendorId === 'unassigned') {
      conditions.push('le.lab_vendor_id IS NULL')
    } else {
      conditions.push(`le.lab_vendor_id = $${idx}`)
      values.push(labVendorId); idx++
    }
    if (from) { conditions.push(`le.entry_date >= $${idx}`); values.push(from); idx++ }
    if (to) { conditions.push(`le.entry_date <= $${idx}`); values.push(to); idx++ }
    if (status && ['Ordered','Received','Cancelled'].includes(status)) { conditions.push(`le.status = $${idx}`); values.push(status); idx++ }
    if (patient_search) {
      conditions.push(`(p.full_name ILIKE $${idx} OR p.phone ILIKE $${idx} OR p.patient_id ILIKE $${idx})`)
      values.push(`%${patient_search}%`); idx++
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    // Summary for filtered period
    const summaryQ = `
      SELECT
        COUNT(DISTINCT le.patient_id) as patient_count,
        COUNT(*) as order_count,
        COALESCE(SUM(le.cost),0) as total_cost,
        COALESCE(SUM(le.amount_paid),0) as total_paid,
        COALESCE(SUM(le.cost - le.amount_paid),0) as total_outstanding
      FROM lab_entries le
      LEFT JOIN patients p ON p.id = le.patient_id
      ${whereClause}
    `
    const summaryR = await pool.query(summaryQ, values)

    // Current month summary (always current month regardless of filter)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const monthConds = [...conditions, `le.entry_date >= $${idx}`, `le.entry_date <= $${idx + 1}`]
    const monthVals = [...values, monthStart, monthEnd]
    const monthWhere = 'WHERE ' + monthConds.join(' AND ')
    const monthQ = `
      SELECT COALESCE(SUM(le.cost),0) as month_cost, COALESCE(SUM(le.amount_paid),0) as month_paid, COALESCE(SUM(le.cost - le.amount_paid),0) as month_outstanding
      FROM lab_entries le LEFT JOIN patients p ON p.id = le.patient_id ${monthWhere}
    `
    let monthSummary = { month_cost: 0, month_paid: 0, month_outstanding: 0 }
    try {
      const mr = await pool.query(monthQ, monthVals)
      monthSummary = { month_cost: Number(mr.rows[0].month_cost), month_paid: Number(mr.rows[0].month_paid), month_outstanding: Number(mr.rows[0].month_outstanding) }
    } catch { /* ignore */ }

    // Orders with patient/session context
    const ordersQ = `
      SELECT le.*, p.full_name as patient_name, p.phone as patient_phone, p.patient_id as patient_code,
             s.chief_complaint, s.visit_date
      FROM lab_entries le
      LEFT JOIN patients p ON p.id = le.patient_id
      LEFT JOIN sessions s ON s.id = le.session_id
      ${whereClause}
      ORDER BY le.entry_date DESC, le.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `
    const ordersVals = [...values, Number(limit), Number(offset)]
    const ordersR = await pool.query(ordersQ, ordersVals)

    const summary = {
      patient_count: Number(summaryR.rows[0].patient_count),
      order_count: Number(summaryR.rows[0].order_count),
      total_cost: Number(summaryR.rows[0].total_cost),
      total_paid: Number(summaryR.rows[0].total_paid),
      total_outstanding: Number(summaryR.rows[0].total_outstanding),
      ...monthSummary,
    }

    res.json({
      lab: lab ? { id: lab.id, name: lab.name, is_active: lab.is_active, display_order: lab.display_order } : { id: null, name: vendorName, is_active: true },
      summary,
      orders: ordersR.rows.map(o => ({
        ...o,
        outstanding: Number(o.cost || 0) - Number(o.amount_paid || 0),
      })),
    })
  } catch (err) {
    console.error('GET /api/labs/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

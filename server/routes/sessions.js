import { Router } from 'express'
import pool from '../db.js'

const router = Router()

function extractVitals(body) {
  // Support both nested vitals object and flat columns
  const v = body.vitals || {}
  return {
    age: body.age !== undefined ? body.age : v.age,
    weight: body.weight !== undefined ? body.weight : v.weight,
    blood_pressure: body.blood_pressure !== undefined ? body.blood_pressure : v.blood_pressure,
    blood_sugar: body.blood_sugar !== undefined ? body.blood_sugar : v.blood_sugar,
    pulse_rate: body.pulse_rate !== undefined ? body.pulse_rate : v.pulse_rate,
    spo2: body.spo2 !== undefined ? body.spo2 : v.spo2,
  }
}

// GET / - list sessions with optional filters
router.get('/', async (req, res) => {
  try {
    const { patient_id, payment_status, visit_date_from, visit_date_to } = req.query
    const conditions = []
    const values = []
    let idx = 1

    if (patient_id) {
      conditions.push(`patient_id = $${idx}`)
      values.push(patient_id)
      idx++
    }
    if (payment_status) {
      conditions.push(`payment_status = $${idx}`)
      values.push(payment_status)
      idx++
    }
    if (visit_date_from) {
      conditions.push(`visit_date >= $${idx}`)
      values.push(visit_date_from)
      idx++
    }
    if (visit_date_to) {
      conditions.push(`visit_date <= $${idx}`)
      values.push(visit_date_to)
      idx++
    }

    let sql = 'SELECT * FROM sessions'
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
    sql += ' ORDER BY visit_date DESC'

    const result = await pool.query(sql, values)
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/sessions error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /:id - single session with nested doctors and chart entries
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sessionRes = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    const session = sessionRes.rows[0]

    const [doctorsRes, chartRes] = await Promise.all([
      pool.query(
        `SELECT d.* FROM doctors d
         JOIN session_doctors sd ON sd.doctor_id = d.id
         WHERE sd.session_id = $1`,
        [id]
      ),
      pool.query('SELECT * FROM dental_chart_entries WHERE session_id = $1 ORDER BY created_at', [id]),
    ])

    res.json({ ...session, doctors: doctorsRes.rows, dental_chart_entries: chartRes.rows })
  } catch (err) {
    console.error('GET /api/sessions/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - create session with transaction
router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      patient_id,
      visit_date,
      visit_type,
      followup_of,
      chief_complaint,
      diagnosis,
      treatment_given,
      injection_given,
      injection_details,
      treatment_cost,
      amount_paid,
      payment_status,
      notes,
      next_visit_date,
      doctors,
      chart_entries,
      // also allow alternative name
      dental_chart_entries,
    } = req.body

    const vitals = extractVitals(req.body)

    if (!patient_id) return res.status(400).json({ error: 'patient_id is required' })
    if (!chief_complaint || !chief_complaint.trim()) return res.status(400).json({ error: 'chief_complaint is required' })

    const chartList = chart_entries || dental_chart_entries || []
    const doctorList = doctors || []

    await client.query('BEGIN')

    const sessionRes = await client.query(
      `INSERT INTO sessions
        (patient_id, visit_date, visit_type, followup_of, chief_complaint, diagnosis, treatment_given, injection_given, injection_details, treatment_cost, amount_paid, payment_status, notes, next_visit_date, age, weight, blood_pressure, blood_sugar, pulse_rate, spo2)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        patient_id,
        visit_date || new Date().toISOString().split('T')[0],
        visit_type || 'New',
        followup_of || null,
        chief_complaint.trim(),
        diagnosis ? diagnosis.trim() : null,
        treatment_given ? treatment_given.trim() : null,
        injection_given ? true : false,
        injection_details ? injection_details.trim() : null,
        treatment_cost !== undefined && treatment_cost !== '' && treatment_cost !== null ? treatment_cost : 0,
        amount_paid !== undefined && amount_paid !== '' && amount_paid !== null ? amount_paid : 0,
        payment_status || 'Pending',
        notes ? notes.trim() : null,
        next_visit_date || null,
        vitals.age !== undefined && vitals.age !== '' && vitals.age !== null ? parseInt(vitals.age, 10) : null,
        vitals.weight !== undefined && vitals.weight !== '' && vitals.weight !== null ? vitals.weight : null,
        vitals.blood_pressure ? String(vitals.blood_pressure).trim() : null,
        vitals.blood_sugar !== undefined && vitals.blood_sugar !== '' && vitals.blood_sugar !== null ? vitals.blood_sugar : null,
        vitals.pulse_rate !== undefined && vitals.pulse_rate !== '' && vitals.pulse_rate !== null ? parseInt(vitals.pulse_rate, 10) : null,
        vitals.spo2 !== undefined && vitals.spo2 !== '' && vitals.spo2 !== null ? vitals.spo2 : null,
      ]
    )
    const session = sessionRes.rows[0]

    // Insert session_doctors
    for (const doctorId of doctorList) {
      if (!doctorId) continue
      await client.query('INSERT INTO session_doctors (session_id, doctor_id) VALUES ($1,$2)', [session.id, doctorId])
    }

    // Insert dental_chart_entries
    for (const entry of chartList) {
      if (!entry.region || !entry.procedure_done) continue
      await client.query(
        `INSERT INTO dental_chart_entries (session_id, patient_id, region, tooth_number, procedure_done, notes)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [session.id, patient_id, entry.region, entry.tooth_number || null, entry.procedure_done, entry.notes || null]
      )
    }

    await client.query('COMMIT')

    // Fetch nested arrays for response
    const [doctorsRes, chartRes] = await Promise.all([
      pool.query(
        `SELECT d.* FROM doctors d JOIN session_doctors sd ON sd.doctor_id = d.id WHERE sd.session_id = $1`,
        [session.id]
      ),
      pool.query('SELECT * FROM dental_chart_entries WHERE session_id = $1 ORDER BY created_at', [session.id]),
    ])

    res.status(201).json({ ...session, doctors: doctorsRes.rows, dental_chart_entries: chartRes.rows })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('POST /api/sessions error:', err.message)
    if (err.code === '23503') return res.status(400).json({ error: 'Invalid patient_id, doctor_id or followup_of' })
    if (err.code === '23514') return res.status(400).json({ error: err.message })
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT /:id - update session atomically
router.put('/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    const { id } = req.params
    const {
      patient_id,
      visit_date,
      visit_type,
      followup_of,
      chief_complaint,
      diagnosis,
      treatment_given,
      injection_given,
      injection_details,
      treatment_cost,
      amount_paid,
      payment_status,
      notes,
      next_visit_date,
      doctors,
      chart_entries,
      dental_chart_entries,
    } = req.body

    const vitals = extractVitals(req.body)
    const chartList = chart_entries || dental_chart_entries
    const doctorList = doctors

    // Check session exists first
    const existing = await client.query('SELECT * FROM sessions WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      client.release()
      return res.status(404).json({ error: 'Session not found' })
    }
    const currentPatientId = patient_id || existing.rows[0].patient_id

    await client.query('BEGIN')

    // Build dynamic update
    const fields = {}
    if (patient_id !== undefined) fields.patient_id = patient_id
    if (visit_date !== undefined) fields.visit_date = visit_date
    if (visit_type !== undefined) fields.visit_type = visit_type
    if (followup_of !== undefined) fields.followup_of = followup_of || null
    if (chief_complaint !== undefined) fields.chief_complaint = chief_complaint
    if (diagnosis !== undefined) fields.diagnosis = diagnosis
    if (treatment_given !== undefined) fields.treatment_given = treatment_given
    if (injection_given !== undefined) fields.injection_given = Boolean(injection_given)
    if (injection_details !== undefined) fields.injection_details = injection_details
    if (treatment_cost !== undefined) fields.treatment_cost = treatment_cost
    if (amount_paid !== undefined) fields.amount_paid = amount_paid
    if (payment_status !== undefined) fields.payment_status = payment_status
    if (notes !== undefined) fields.notes = notes
    if (next_visit_date !== undefined) fields.next_visit_date = next_visit_date || null
    if (vitals.age !== undefined) fields.age = vitals.age !== '' && vitals.age !== null ? parseInt(vitals.age, 10) : null
    if (vitals.weight !== undefined) fields.weight = vitals.weight !== '' && vitals.weight !== null ? vitals.weight : null
    if (vitals.blood_pressure !== undefined) fields.blood_pressure = vitals.blood_pressure ? String(vitals.blood_pressure).trim() : null
    if (vitals.blood_sugar !== undefined) fields.blood_sugar = vitals.blood_sugar !== '' && vitals.blood_sugar !== null ? vitals.blood_sugar : null
    if (vitals.pulse_rate !== undefined) fields.pulse_rate = vitals.pulse_rate !== '' && vitals.pulse_rate !== null ? parseInt(vitals.pulse_rate, 10) : null
    if (vitals.spo2 !== undefined) fields.spo2 = vitals.spo2 !== '' && vitals.spo2 !== null ? vitals.spo2 : null

    if (Object.keys(fields).length > 0) {
      const setClauses = []
      const values = []
      let idx = 1
      for (const [key, value] of Object.entries(fields)) {
        setClauses.push(`${key} = $${idx}`)
        values.push(value === '' ? null : value)
        idx++
      }
      setClauses.push('updated_at = now()')
      values.push(id)
      await client.query(`UPDATE sessions SET ${setClauses.join(', ')} WHERE id = $${idx}`, values)
    } else {
      await client.query('UPDATE sessions SET updated_at = now() WHERE id = $1', [id])
    }

    // Replace session_doctors if doctors array provided
    if (doctorList !== undefined) {
      await client.query('DELETE FROM session_doctors WHERE session_id = $1', [id])
      for (const doctorId of doctorList) {
        if (!doctorId) continue
        await client.query('INSERT INTO session_doctors (session_id, doctor_id) VALUES ($1,$2)', [id, doctorId])
      }
    }

    // Replace dental_chart_entries if chart list provided
    if (chartList !== undefined) {
      await client.query('DELETE FROM dental_chart_entries WHERE session_id = $1', [id])
      for (const entry of chartList) {
        if (!entry.region || !entry.procedure_done) continue
        await client.query(
          `INSERT INTO dental_chart_entries (session_id, patient_id, region, tooth_number, procedure_done, notes)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, currentPatientId, entry.region, entry.tooth_number || null, entry.procedure_done, entry.notes || null]
        )
      }
    }

    await client.query('COMMIT')

    const sessionRes = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
    const [doctorsRes, chartRes] = await Promise.all([
      pool.query(`SELECT d.* FROM doctors d JOIN session_doctors sd ON sd.doctor_id = d.id WHERE sd.session_id = $1`, [id]),
      pool.query('SELECT * FROM dental_chart_entries WHERE session_id = $1 ORDER BY created_at', [id]),
    ])

    res.json({ ...sessionRes.rows[0], doctors: doctorsRes.rows, dental_chart_entries: chartRes.rows })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('PUT /api/sessions/:id error:', err.message)
    if (err.code === '23503') return res.status(400).json({ error: 'Invalid patient_id or doctor_id' })
    if (err.code === '23514') return res.status(400).json({ error: err.message })
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // Cascade will delete children
    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/sessions/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET / - list all patients, optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    if (search) {
      const term = `%${search}%`
      const result = await pool.query(
        `SELECT * FROM patients
         WHERE full_name ILIKE $1 OR phone ILIKE $1 OR patient_id ILIKE $1
         ORDER BY created_at DESC`,
        [term]
      )
      return res.json(result.rows)
    }
    const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/patients error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /:id - single patient
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('GET /api/patients/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - create patient with auto-generated patient_id
router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      full_name,
      phone,
      registration_date,
      date_of_birth,
      dob,
      gender,
      email,
      address,
      blood_group,
      allergies,
      medical_history,
      medical_conditions,
      current_medications,
      previous_dental_history,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
      age,
      weight,
      blood_pressure,
      blood_sugar,
      pulse_rate,
      spo2,
    } = req.body

    if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'full_name is required' })
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'phone is required' })
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ error: 'gender must be Male, Female or Other' })
    }

    await client.query('BEGIN')
    const countRes = await client.query('SELECT COUNT(*) FROM patients')
    const count = parseInt(countRes.rows[0].count, 10) + 1
    const year = new Date().getFullYear()
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, 'X')
    const patient_id = `DC-${year}-${String(count).padStart(4, '0')}-${suffix}`

    const dobValue = date_of_birth || dob || null

    const insertRes = await client.query(
      `INSERT INTO patients
        (patient_id, full_name, registration_date, date_of_birth, gender, phone, email, address, blood_group, allergies, medical_history, medical_conditions, current_medications, previous_dental_history, emergency_contact_name, emergency_contact_phone, notes, age, weight, blood_pressure, blood_sugar, pulse_rate, spo2)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [
        patient_id,
        full_name.trim(),
        registration_date || null,
        dobValue,
        gender || null,
        phone.trim(),
        email ? email.trim() : null,
        address ? address.trim() : null,
        blood_group || null,
        allergies ? allergies.trim() : null,
        medical_history ? medical_history.trim() : null,
        medical_conditions ? medical_conditions.trim() : null,
        current_medications ? current_medications.trim() : null,
        previous_dental_history ? previous_dental_history.trim() : null,
        emergency_contact_name ? emergency_contact_name.trim() : null,
        emergency_contact_phone ? emergency_contact_phone.trim() : null,
        notes ? notes.trim() : null,
        age !== undefined && age !== '' && age !== null ? parseInt(age, 10) : null,
        weight !== undefined && weight !== '' && weight !== null ? weight : null,
        blood_pressure ? blood_pressure.trim() : null,
        blood_sugar !== undefined && blood_sugar !== '' && blood_sugar !== null ? blood_sugar : null,
        pulse_rate !== undefined && pulse_rate !== '' && pulse_rate !== null ? parseInt(pulse_rate, 10) : null,
        spo2 !== undefined && spo2 !== '' && spo2 !== null ? spo2 : null,
      ]
    )
    await client.query('COMMIT')
    res.status(201).json(insertRes.rows[0])
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('POST /api/patients error:', err.message)
    if (err.code === '23505') return res.status(400).json({ error: 'patient_id already exists, please retry' })
    if (err.code === '23514') return res.status(400).json({ error: err.message })
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PUT /:id - update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const allowed = [
      'full_name', 'registration_date', 'date_of_birth', 'dob', 'gender', 'phone', 'email', 'address',
      'blood_group', 'allergies', 'medical_history', 'medical_conditions', 'current_medications',
      'previous_dental_history', 'emergency_contact_name', 'emergency_contact_phone', 'notes',
      'age', 'weight', 'blood_pressure', 'blood_sugar', 'pulse_rate', 'spo2'
    ]

    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    // Map dob -> date_of_birth
    if (updates.dob !== undefined && updates.date_of_birth === undefined) {
      updates.date_of_birth = updates.dob
      delete updates.dob
    } else if (updates.dob !== undefined) {
      delete updates.dob
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' })

    if (updates.gender && !['Male', 'Female', 'Other', null, ''].includes(updates.gender)) {
      return res.status(400).json({ error: 'gender must be Male, Female or Other' })
    }

    // Normalize empty strings to null for nullable fields
    for (const k of Object.keys(updates)) {
      if (updates[k] === '') updates[k] = null
    }

    const setClauses = []
    const values = []
    let idx = 1
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${idx}`)
      // Parse integer fields
      if (['age', 'pulse_rate'].includes(key) && value !== null) values.push(parseInt(value, 10))
      else values.push(value)
      idx++
    }
    setClauses.push(`updated_at = now()`)
    values.push(id)

    const result = await pool.query(
      `UPDATE patients SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('PUT /api/patients/:id error:', err.message)
    if (err.code === '23514') return res.status(400).json({ error: err.message })
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/patients/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

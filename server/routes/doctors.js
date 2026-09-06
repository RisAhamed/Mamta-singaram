import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET / - list doctors, optional is_active filter
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query
    if (is_active !== undefined && is_active !== '') {
      const boolVal = is_active === 'true' ? true : is_active === 'false' ? false : null
      if (boolVal === null) return res.status(400).json({ error: 'is_active must be true or false' })
      const result = await pool.query('SELECT * FROM doctors WHERE is_active = $1 ORDER BY name', [boolVal])
      return res.json(result.rows)
    }
    const result = await pool.query('SELECT * FROM doctors ORDER BY name')
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/doctors error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('GET /api/doctors/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - create doctor
router.post('/', async (req, res) => {
  try {
    const { name, specialty, qualification, phone, email, is_active } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' })
    if (!specialty || !specialty.trim()) return res.status(400).json({ error: 'specialty is required' })

    const result = await pool.query(
      `INSERT INTO doctors (name, specialty, qualification, phone, email, is_active)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        name.trim(),
        specialty.trim(),
        qualification ? qualification.trim() : null,
        phone ? phone.trim() : null,
        email ? email.trim() : null,
        is_active !== undefined ? Boolean(is_active) : true,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/doctors error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const allowed = ['name', 'specialty', 'qualification', 'phone', 'email', 'is_active']
    const updates = {}
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k]
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' })

    const setClauses = []
    const values = []
    let idx = 1
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${idx}`)
      if (typeof value === 'string') values.push(value.trim() === '' ? null : value.trim())
      else values.push(value)
      idx++
    }
    setClauses.push('updated_at = now()')
    values.push(id)

    const result = await pool.query(
      `UPDATE doctors SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('PUT /api/doctors/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    // Check if doctor is assigned to any session (spec requires 400 even though DB has CASCADE)
    const assigned = await pool.query('SELECT 1 FROM session_doctors WHERE doctor_id = $1 LIMIT 1', [id])
    if (assigned.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete doctor: assigned to sessions' })
    }
    const result = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/doctors/:id error:', err.message)
    // Foreign key violation fallback
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete doctor: assigned to sessions' })
    }
    res.status(500).json({ error: err.message })
  }
})

export default router

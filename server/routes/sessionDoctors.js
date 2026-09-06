import { Router } from 'express'
import pool from '../db.js'

const router = Router({ mergeParams: true })

// GET / - list doctors for a session (with details)
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    // Verify session exists
    const sessionCheck = await pool.query('SELECT id FROM sessions WHERE id = $1', [sessionId])
    if (sessionCheck.rows.length === 0) return res.status(404).json({ error: 'Session not found' })

    const result = await pool.query(
      `SELECT d.*, sd.id as link_id, sd.created_at as linked_at
       FROM doctors d
       JOIN session_doctors sd ON sd.doctor_id = d.id
       WHERE sd.session_id = $1
       ORDER BY d.name`,
      [sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/sessions/:sessionId/doctors error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - link doctor to session
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { doctor_id } = req.body
    if (!doctor_id) return res.status(400).json({ error: 'doctor_id is required' })

    const sessionCheck = await pool.query('SELECT id FROM sessions WHERE id = $1', [sessionId])
    if (sessionCheck.rows.length === 0) return res.status(404).json({ error: 'Session not found' })

    const doctorCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctor_id])
    if (doctorCheck.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' })

    // Prevent duplicate
    const existing = await pool.query('SELECT id FROM session_doctors WHERE session_id = $1 AND doctor_id = $2', [sessionId, doctor_id])
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Doctor already linked to session' })

    const result = await pool.query(
      'INSERT INTO session_doctors (session_id, doctor_id) VALUES ($1,$2) RETURNING *',
      [sessionId, doctor_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/sessions/:sessionId/doctors error:', err.message)
    if (err.code === '23505') return res.status(400).json({ error: 'Doctor already linked' })
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:doctorId - remove doctor link
router.delete('/:doctorId', async (req, res) => {
  try {
    const { sessionId, doctorId } = req.params
    const result = await pool.query(
      'DELETE FROM session_doctors WHERE session_id = $1 AND doctor_id = $2 RETURNING id',
      [sessionId, doctorId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor link not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/sessions/:sessionId/doctors/:doctorId error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

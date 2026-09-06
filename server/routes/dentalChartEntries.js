import { Router } from 'express'
import pool from '../db.js'

const router = Router({ mergeParams: true })

// GET / - list chart entries for session
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const result = await pool.query(
      'SELECT * FROM dental_chart_entries WHERE session_id = $1 ORDER BY created_at',
      [sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/sessions/:sessionId/chart error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - add chart entry
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { region, procedure_done, tooth_number, notes } = req.body
    if (!region || !region.trim()) return res.status(400).json({ error: 'region is required' })
    if (!procedure_done || !procedure_done.trim()) return res.status(400).json({ error: 'procedure_done is required' })

    const sessionRes = await pool.query('SELECT patient_id FROM sessions WHERE id = $1', [sessionId])
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    const patient_id = sessionRes.rows[0].patient_id

    const result = await pool.query(
      `INSERT INTO dental_chart_entries (session_id, patient_id, region, tooth_number, procedure_done, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [sessionId, patient_id, region.trim(), tooth_number ? tooth_number.trim() : null, procedure_done.trim(), notes ? notes.trim() : null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/sessions/:sessionId/chart error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:entryId
router.delete('/:entryId', async (req, res) => {
  try {
    const { sessionId, entryId } = req.params
    const result = await pool.query(
      'DELETE FROM dental_chart_entries WHERE id = $1 AND session_id = $2 RETURNING id',
      [entryId, sessionId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Chart entry not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/sessions/:sessionId/chart/:entryId error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

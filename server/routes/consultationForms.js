import { Router } from 'express'
import pool from '../db.js'

const router = Router({ mergeParams: true })

// GET / - list consultation forms for session
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const result = await pool.query(
      'SELECT * FROM consultation_forms WHERE session_id = $1 ORDER BY acknowledged_at DESC',
      [sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('GET /api/sessions/:sessionId/consultation-forms error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST / - create acknowledgement
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { form_type, form_label, acknowledged, signature_url, storage_path } = req.body
    if (!form_type || !form_type.trim()) return res.status(400).json({ error: 'form_type is required' })
    if (!form_label || !form_label.trim()) return res.status(400).json({ error: 'form_label is required' })

    const sessionRes = await pool.query('SELECT patient_id FROM sessions WHERE id = $1', [sessionId])
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    const patient_id = sessionRes.rows[0].patient_id

    const result = await pool.query(
      `INSERT INTO consultation_forms (session_id, patient_id, form_type, form_label, acknowledged, signature_url, storage_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        sessionId,
        patient_id,
        form_type.trim(),
        form_label.trim(),
        acknowledged !== undefined ? Boolean(acknowledged) : true,
        signature_url || null,
        storage_path || null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/sessions/:sessionId/consultation-forms error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:formId
router.delete('/:formId', async (req, res) => {
  try {
    const { sessionId, formId } = req.params
    const result = await pool.query(
      'DELETE FROM consultation_forms WHERE id = $1 AND session_id = $2 RETURNING id',
      [formId, sessionId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Consultation form not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/sessions/:sessionId/consultation-forms/:formId error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router

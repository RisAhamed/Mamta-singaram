import { Router } from 'express'
import pool from '../db.js'

const router = Router({ mergeParams: true })

// GET /api/sessions/:sessionId/consent-forms
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const r = await pool.query(
      `SELECT scf.*, cf.title as master_title, cf.file_path as master_file_path, cf.is_active as master_is_active
       FROM session_consent_forms scf
       LEFT JOIN consent_forms cf ON cf.id = scf.consent_form_id
       WHERE scf.session_id=$1 ORDER BY scf.created_at DESC`,
      [sessionId]
    )
    res.json(r.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/sessions/:sessionId/consent-forms - create or update acknowledgement (upsert by session+form)
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { consent_form_id, patient_name, acknowledged } = req.body
    if (!consent_form_id) return res.status(400).json({ error: 'consent_form_id is required' })
    if (!patient_name || !String(patient_name).trim()) return res.status(400).json({ error: 'patient_name is required' })
    if (acknowledged !== true) return res.status(400).json({ error: 'acknowledged must be true' })

    const sess = await pool.query('SELECT patient_id FROM sessions WHERE id=$1', [sessionId])
    if (!sess.rows.length) return res.status(404).json({ error: 'Session not found' })
    const patient_id = sess.rows[0].patient_id

    const cf = await pool.query('SELECT * FROM consent_forms WHERE id=$1', [consent_form_id])
    if (!cf.rows.length) return res.status(404).json({ error: 'Consent form not found' })
    if (cf.rows[0].is_active === false) {
      // Allow acknowledging inactive? Only if already exists? For new, block.
      const exists = await pool.query('SELECT id FROM session_consent_forms WHERE session_id=$1 AND consent_form_id=$2', [sessionId, consent_form_id])
      if (!exists.rows.length) return res.status(400).json({ error: 'Consent form is inactive' })
    }

    // Upsert: if already exists for this session+form, update patient_name/acknowledged snapshot and file
    const existing = await pool.query('SELECT id FROM session_consent_forms WHERE session_id=$1 AND consent_form_id=$2', [sessionId, consent_form_id])
    if (existing.rows.length) {
      const r = await pool.query(
        `UPDATE session_consent_forms SET patient_name=$1, acknowledged=true, acknowledged_at=now(), updated_at=now(),
         consent_key=$2, consent_title=$3, file_path=$4 WHERE session_id=$5 AND consent_form_id=$6 RETURNING *`,
        [String(patient_name).trim(), cf.rows[0].key, cf.rows[0].title, cf.rows[0].file_path, sessionId, consent_form_id]
      )
      return res.json(r.rows[0])
    }

    const r = await pool.query(
      `INSERT INTO session_consent_forms (session_id, patient_id, consent_form_id, consent_key, consent_title, file_path, patient_name, acknowledged, acknowledged_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,now()) RETURNING *`,
      [sessionId, patient_id, consent_form_id, cf.rows[0].key, cf.rows[0].title, cf.rows[0].file_path, String(patient_name).trim()]
    )
    res.status(201).json(r.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Already acknowledged for this session' })
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/sessions/:sessionId/consent-forms/:id
router.delete('/:id', async (req, res) => {
  try {
    const { sessionId, id } = req.params
    const r = await pool.query('DELETE FROM session_consent_forms WHERE id=$1 AND session_id=$2 RETURNING id', [id, sessionId])
    if (!r.rows.length) return res.status(404).json({ error: 'Consent record not found' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router

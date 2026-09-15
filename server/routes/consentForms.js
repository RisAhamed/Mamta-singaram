import { Router } from 'express'
import pool from '../db.js'

const router = Router()

function isValidFilePath(p) {
  if (!p || typeof p !== 'string') return false
  if (p.includes('..') || p.includes('\\')) return false
  // Must be under /consent_forms/ with .pdf
  if (!p.startsWith('/consent_forms/')) return false
  if (!p.toLowerCase().endsWith('.pdf')) return false
  // No absolute filesystem, no traversal
  if (p.includes('//')) return false
  return true
}

router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query
    if (is_active !== undefined && is_active !== '') {
      const b = is_active === 'true' ? true : is_active === 'false' ? false : null
      if (b === null) return res.status(400).json({ error: 'is_active must be true or false' })
      const r = await pool.query('SELECT * FROM consent_forms WHERE is_active=$1 ORDER BY display_order, title', [b])
      return res.json(r.rows)
    }
    const r = await pool.query('SELECT * FROM consent_forms ORDER BY display_order, title')
    res.json(r.rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM consent_forms WHERE id=$1', [req.params.id])
    if (!r.rows.length) return res.status(404).json({ error: 'Consent form not found' })
    res.json(r.rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', async (req, res) => {
  try {
    const { key, title, description, file_path, storage_path, is_active, display_order, version } = req.body
    if (!key || !String(key).trim()) return res.status(400).json({ error: 'key is required' })
    if (!/^[a-z0-9_]+$/.test(String(key).trim())) return res.status(400).json({ error: 'key must be lowercase alphanumeric + underscore' })
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'title is required' })
    if (!file_path || !String(file_path).trim()) return res.status(400).json({ error: 'file_path is required' })
    if (!isValidFilePath(String(file_path).trim())) return res.status(400).json({ error: 'file_path must be /consent_forms/<file>.pdf without traversal' })
    const r = await pool.query(
      `INSERT INTO consent_forms (key, title, description, file_path, storage_path, is_active, display_order, version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [String(key).trim(), String(title).trim(), description ? String(description).trim() : null, String(file_path).trim(), storage_path || null, is_active !== undefined ? Boolean(is_active) : true, display_order ?? 0, version ?? 1]
    )
    res.status(201).json(r.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Consent form key already exists' })
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['key','title','description','file_path','storage_path','is_active','display_order','version']
    const updates = {}
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k]
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update' })
    if (updates.key !== undefined) {
      if (!String(updates.key).trim()) return res.status(400).json({ error: 'key cannot be empty' })
      if (!/^[a-z0-9_]+$/.test(String(updates.key).trim())) return res.status(400).json({ error: 'key must be lowercase alphanumeric + underscore' })
      updates.key = String(updates.key).trim()
    }
    if (updates.title !== undefined && !String(updates.title).trim()) return res.status(400).json({ error: 'title cannot be empty' })
    if (updates.file_path !== undefined && !isValidFilePath(String(updates.file_path).trim())) return res.status(400).json({ error: 'file_path must be /consent_forms/<file>.pdf without traversal' })
    if (updates.title) updates.title = String(updates.title).trim()
    if (updates.description !== undefined) updates.description = updates.description ? String(updates.description).trim() : null
    if (updates.file_path) updates.file_path = String(updates.file_path).trim()
    if (updates.is_active !== undefined) updates.is_active = Boolean(updates.is_active)
    const set = []; const vals = []; let i = 1
    for (const [k, v] of Object.entries(updates)) { set.push(`${k} = $${i}`); vals.push(v); i++ }
    set.push('updated_at = now()'); vals.push(req.params.id)
    const r = await pool.query(`UPDATE consent_forms SET ${set.join(', ')} WHERE id=$${i} RETURNING *`, vals)
    if (!r.rows.length) return res.status(404).json({ error: 'Consent form not found' })
    res.json(r.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Key already exists' })
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const ref = await pool.query('SELECT 1 FROM session_consent_forms WHERE consent_form_id=$1 LIMIT 1', [req.params.id])
    if (ref.rows.length) return res.status(400).json({ error: 'Cannot delete consent form: referenced by sessions. Set inactive instead.' })
    const r = await pool.query('DELETE FROM consent_forms WHERE id=$1 RETURNING id', [req.params.id])
    if (!r.rows.length) return res.status(404).json({ error: 'Consent form not found' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router

import { Router } from 'express'
import multer from 'multer'
import pool from '../db.js'
import { uploadFile, deleteFile, getFileUrl } from '../r2.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512000 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.mimetype)) return cb(new Error('Unsupported file type: ' + file.mimetype))
    cb(null, true)
  },
})

const router = Router({ mergeParams: true })

// GET /api/sessions/:sessionId/files - list files for session, refresh file_url dynamically
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.params
    const result = await pool.query('SELECT * FROM session_files WHERE session_id = $1 ORDER BY uploaded_at DESC', [sessionId])
    const files = await Promise.all(result.rows.map(async (row) => {
      try {
        const url = await getFileUrl(row.storage_path)
        return { ...row, file_url: url }
      } catch {
        return row
      }
    }))
    res.json(files)
  } catch (err) {
    console.error('GET session files error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sessions/:sessionId/files - upload to R2
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { sessionId } = req.params
    const { description } = req.body
    if (!req.file) return res.status(400).json({ error: 'file is required' })

    const sess = await pool.query('SELECT patient_id FROM sessions WHERE id = $1', [sessionId])
    if (sess.rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    const patient_id = sess.rows[0].patient_id

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `patients/${patient_id}/sessions/${sessionId}/${Date.now()}_${safeName}`

    await uploadFile(key, req.file.buffer, req.file.mimetype)
    const file_url = await getFileUrl(key)

    const result = await pool.query(
      `INSERT INTO session_files (session_id, patient_id, file_name, file_type, file_size_bytes, storage_path, file_url, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [sessionId, patient_id, req.file.originalname, req.file.mimetype, req.file.size, key, file_url, description || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST session files error:', err.message)
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Max 0.5 MB' })
    res.status(500).json({ error: err.message })
  }
})

export default router

// Separate router for DELETE /api/files/:fileId
export const filesRouter = Router()
filesRouter.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const result = await pool.query('DELETE FROM session_files WHERE id = $1 RETURNING storage_path', [fileId])
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' })
    const storagePath = result.rows[0].storage_path
    if (storagePath) {
      try { await deleteFile(storagePath) } catch (e) { console.error('R2 delete error:', e.message) }
    }
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE file error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

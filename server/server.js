import express from 'express'
import cors from 'cors'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'
import pool from './db.js'
import patientsRouter from './routes/patients.js'
import doctorsRouter from './routes/doctors.js'
import sessionsRouter from './routes/sessions.js'
import sessionDoctorsRouter from './routes/sessionDoctors.js'
import dentalChartEntriesRouter from './routes/dentalChartEntries.js'
import consultationFormsRouter from './routes/consultationForms.js'
import sessionFilesRouter, { filesRouter } from './routes/sessionFiles.js'
import locationsRouter from './routes/locations.js'
import labVendorsRouter from './routes/labVendors.js'
import facialBonesRouter from './routes/facialBones.js'
import surgeryFormsRouter from './routes/surgeryForms.js'
import appointmentsRouter from './routes/appointments.js'
import surgeryNotesRouter from './routes/surgeryNotes.js'
import labEntriesRouter from './routes/labEntries.js'
import patientLedgerRouter from './routes/patientLedger.js'
import patientLabEntriesRouter from './routes/patientLabEntries.js'
import sessionSurgeryFormsRouter from './routes/sessionSurgeryForms.js'
import labsRouter from './routes/labs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env if it exists (on Vercel they come from dashboard)
try {
  const envPath = path.resolve(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
} catch { /* .env not present — rely on process.env from hosting platform */ }

const app = express()

// CORS: not needed for same-origin Vercel deployment (frontend and /api share origin).
// Applied when ALLOWED_ORIGINS is set, or automatically for localhost cross-port dev.
const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
// Always allow localhost for local cross-port development (5173 -> 3001)
const devOrigins = !process.env.VERCEL ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'] : []
const allowedOrigins = [...new Set([...allowedOriginsEnv, ...devOrigins])]
if (allowedOrigins.length > 0) {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }))
}

app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    console.error('Health check failed:', err.message)
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// Mount routers - nested session sub-resources first to avoid /:id collision
app.use('/api/labs', labsRouter)
app.use('/api/locations', locationsRouter)
app.use('/api/lab-vendors', labVendorsRouter)
app.use('/api/facial-bones', facialBonesRouter)
app.use('/api/surgery-forms', surgeryFormsRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/patients/:patientId/ledger', patientLedgerRouter)
app.use('/api/patients/:patientId/lab-entries', patientLabEntriesRouter)
app.use('/api/sessions/:sessionId/surgery-notes', surgeryNotesRouter)
app.use('/api/sessions/:sessionId/lab-entries', labEntriesRouter)
app.use('/api/sessions/:sessionId/surgery-forms', sessionSurgeryFormsRouter)
app.use('/api/patients', patientsRouter)
app.use('/api/doctors', doctorsRouter)
app.use('/api/sessions/:sessionId/doctors', sessionDoctorsRouter)
app.use('/api/sessions/:sessionId/chart', dentalChartEntriesRouter)
app.use('/api/sessions/:sessionId/consultation-forms', consultationFormsRouter)
app.use('/api/sessions/:sessionId/files', sessionFilesRouter)
app.use('/api/files', filesRouter)
app.use('/api/sessions', sessionsRouter)

export default app

// Only listen when running as a standalone server (local dev).
// On Vercel the app is imported via api/index.js and handled as a serverless function.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

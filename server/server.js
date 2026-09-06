import express from 'express'
import cors from 'cors'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

app.use(cors())
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

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

import { Router } from 'express'
import pool from '../db.js'
const router = Router({ mergeParams: true })

// GET /api/patients/:patientId/lab-entries - all lab entries for a patient across sessions
router.get('/', async (req,res)=>{
  try{
    const { patientId } = req.params
    const r=await pool.query(
      `SELECT le.*, s.chief_complaint as session_chief_complaint, s.visit_date as session_visit_date
       FROM lab_entries le
       LEFT JOIN sessions s ON s.id = le.session_id
       WHERE le.patient_id = $1
       ORDER BY le.entry_date DESC, le.created_at DESC`,
      [patientId]
    )
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

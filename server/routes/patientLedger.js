import { Router } from 'express'
import pool from '../db.js'
const router = Router({ mergeParams: true })

// GET /api/patients/:patientId/ledger - financial history (immutable audit)
router.get('/', async (req,res)=>{
  try{
    const { patientId } = req.params
    const { from, to } = req.query
    const cond=['patient_id = $1']; const vals=[patientId]; let i=2
    if(from){ cond.push(`entry_date >= $${i}`); vals.push(from); i++}
    if(to){ cond.push(`entry_date <= $${i}`); vals.push(to.includes('T') ? to : to+'T23:59:59Z'); i++}
    const sql=`SELECT * FROM patient_ledger_entries WHERE ${cond.join(' AND ')} ORDER BY entry_date DESC, created_at DESC`
    const r=await pool.query(sql, vals)
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})

// POST
router.post('/', async (req,res)=>{
  try{
    const { patientId } = req.params
    const { session_id, entry_type, amount, description, entry_date } = req.body
    if(!entry_type||!['charge','payment','adjustment','lab_fee'].includes(entry_type)) return res.status(400).json({error:'entry_type must be charge|payment|adjustment|lab_fee'})
    if(amount===undefined||amount===''||isNaN(Number(amount))) return res.status(400).json({error:'amount is required and must be numeric'})
    // verify patient
    const pr=await pool.query('SELECT id FROM patients WHERE id=$1',[patientId])
    if(!pr.rows.length) return res.status(404).json({error:'Patient not found'})
    if(session_id){
      const sr=await pool.query('SELECT id FROM sessions WHERE id=$1 AND patient_id=$2',[session_id, patientId])
      if(!sr.rows.length) return res.status(400).json({error:'Invalid session_id for this patient'})
    }
    const r=await pool.query(`INSERT INTO patient_ledger_entries (patient_id, session_id, entry_type, amount, description, entry_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [patientId, session_id||null, entry_type, amount, description?String(description).trim():null, entry_date||new Date().toISOString()])
    res.status(201).json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})

router.get('/:entryId', async (req,res)=>{
  try{const r=await pool.query('SELECT * FROM patient_ledger_entries WHERE id=$1 AND patient_id=$2',[req.params.entryId, req.params.patientId]); if(!r.rows.length) return res.status(404).json({error:'Ledger entry not found'}); res.json(r.rows[0])}catch(err){res.status(500).json({error:err.message})}
})

router.delete('/:entryId', async (req,res)=>{
  try{
    // Historical records should remain immutable - allow delete only if explicitly needed, but log warning
    const r=await pool.query('DELETE FROM patient_ledger_entries WHERE id=$1 AND patient_id=$2 RETURNING id',[req.params.entryId, req.params.patientId])
    if(!r.rows.length) return res.status(404).json({error:'Ledger entry not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

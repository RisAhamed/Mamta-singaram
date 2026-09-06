import { Router } from 'express'
import pool from '../db.js'
const router = Router({ mergeParams: true })

// GET /api/sessions/:sessionId/surgery-forms
router.get('/', async (req,res)=>{
  try{
    const r=await pool.query(`SELECT ssf.*, sf.title, sf.description as form_description FROM session_surgery_forms ssf JOIN surgery_forms sf ON sf.id=ssf.surgery_form_id WHERE ssf.session_id=$1 ORDER BY ssf.created_at`,[req.params.sessionId])
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})

// POST - link form to session
router.post('/', async (req,res)=>{
  try{
    const { sessionId } = req.params
    const { surgery_form_id, form_data, status } = req.body
    if(!surgery_form_id) return res.status(400).json({error:'surgery_form_id is required'})
    const sess=await pool.query('SELECT patient_id FROM sessions WHERE id=$1',[sessionId])
    if(!sess.rows.length) return res.status(404).json({error:'Session not found'})
    const patient_id=sess.rows[0].patient_id
    const fr=await pool.query('SELECT id FROM surgery_forms WHERE id=$1',[surgery_form_id])
    if(!fr.rows.length) return res.status(400).json({error:'Invalid surgery_form_id'})
    if(status && !['draft','submitted','reviewed'].includes(status)) return res.status(400).json({error:'Invalid status'})
    const r=await pool.query(`INSERT INTO session_surgery_forms (session_id, patient_id, surgery_form_id, form_data, status) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [sessionId, patient_id, surgery_form_id, form_data||null, status||'draft'])
    res.status(201).json(r.rows[0])
  }catch(err){
    if(err.code==='23505') return res.status(400).json({error:'Form already linked to session'})
    res.status(500).json({error:err.message})
  }
})

router.delete('/:linkId', async (req,res)=>{
  try{
    const r=await pool.query('DELETE FROM session_surgery_forms WHERE id=$1 AND session_id=$2 RETURNING id',[req.params.linkId, req.params.sessionId])
    if(!r.rows.length) return res.status(404).json({error:'Link not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

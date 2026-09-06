import { Router } from 'express'
import pool from '../db.js'
const router = Router({ mergeParams: true })

// GET /api/sessions/:sessionId/surgery-notes - single (1 per session)
router.get('/', async (req,res)=>{
  try{
    const r=await pool.query('SELECT * FROM surgery_notes WHERE session_id=$1', [req.params.sessionId])
    if(!r.rows.length) return res.json(null)
    res.json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})

// PUT /api/sessions/:sessionId/surgery-notes - upsert
router.put('/', async (req,res)=>{
  try{
    const { sessionId } = req.params
    const { notes, facial_bone_id, facial_bone_name } = req.body
    if(!notes || !String(notes).trim()) return res.status(400).json({error:'notes is required'})
    const sess=await pool.query('SELECT patient_id FROM sessions WHERE id=$1',[sessionId])
    if(!sess.rows.length) return res.status(404).json({error:'Session not found'})
    const patient_id=sess.rows[0].patient_id
    let boneName = facial_bone_name ? String(facial_bone_name).trim() : null
    let boneId = facial_bone_id || null
    if(boneId){
      const br=await pool.query('SELECT name FROM facial_bones WHERE id=$1',[boneId])
      if(!br.rows.length) return res.status(400).json({error:'Invalid facial_bone_id'})
      boneName = br.rows[0].name
    } else if(boneName){
      // Allow free text; try to resolve to master for id, but preserve snapshot
      const br=await pool.query('SELECT id FROM facial_bones WHERE name ILIKE $1 LIMIT 1',[boneName])
      if(br.rows.length) boneId=br.rows[0].id
    }
    // Upsert
    const existing=await pool.query('SELECT id FROM surgery_notes WHERE session_id=$1',[sessionId])
    let r
    if(existing.rows.length){
      r=await pool.query(`UPDATE surgery_notes SET notes=$1, facial_bone_id=$2, facial_bone_name=$3, updated_at=now() WHERE session_id=$4 RETURNING *`,
        [String(notes).trim(), boneId, boneName, sessionId])
    } else {
      r=await pool.query(`INSERT INTO surgery_notes (session_id, patient_id, notes, facial_bone_id, facial_bone_name) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [sessionId, patient_id, String(notes).trim(), boneId, boneName])
    }
    res.json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})

// DELETE
router.delete('/', async (req,res)=>{
  try{
    const r=await pool.query('DELETE FROM surgery_notes WHERE session_id=$1 RETURNING id',[req.params.sessionId])
    if(!r.rows.length) return res.status(404).json({error:'Surgery notes not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

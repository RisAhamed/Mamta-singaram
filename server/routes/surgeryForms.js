import { Router } from 'express'
import pool from '../db.js'
const router = Router()

router.get('/', async (req,res)=>{
  try{
    const { is_active } = req.query
    if(is_active!==undefined && is_active!==''){
      const b=is_active==='true'?true:is_active==='false'?false:null
      if(b===null) return res.status(400).json({error:'is_active must be true or false'})
      const r=await pool.query('SELECT * FROM surgery_forms WHERE is_active=$1 ORDER BY display_order, title',[b])
      return res.json(r.rows)
    }
    const r=await pool.query('SELECT * FROM surgery_forms ORDER BY display_order, title')
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})
router.get('/:id', async (req,res)=>{
  try{const r=await pool.query('SELECT * FROM surgery_forms WHERE id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Surgery form not found'}); res.json(r.rows[0])}catch(err){res.status(500).json({error:err.message})}
})
router.post('/', async (req,res)=>{
  try{
    const { title, description, is_active, display_order, file_url, storage_path } = req.body
    if(!title||!String(title).trim()) return res.status(400).json({error:'title is required'})
    const r=await pool.query(`INSERT INTO surgery_forms (title, description, is_active, display_order, file_url, storage_path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,[String(title).trim(), description?String(description).trim():null, is_active!==undefined?Boolean(is_active):true, display_order??0, file_url||null, storage_path||null])
    res.status(201).json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})
router.put('/:id', async (req,res)=>{
  try{
    const allowed=['title','description','is_active','display_order','file_url','storage_path']
    const updates={}; for(const k of allowed) if(req.body[k]!==undefined) updates[k]=req.body[k]
    if(!Object.keys(updates).length) return res.status(400).json({error:'No fields to update'})
    if(updates.title!==undefined && !String(updates.title).trim()) return res.status(400).json({error:'title cannot be empty'})
    const set=[]; const vals=[]; let i=1
    for(const [k,v] of Object.entries(updates)){ set.push(`${k} = $${i}`); if(k==='title'||k==='description') vals.push(v?String(v).trim():null); else if(k==='is_active') vals.push(Boolean(v)); else vals.push(v); i++}
    set.push('updated_at = now()'); vals.push(req.params.id)
    const r=await pool.query(`UPDATE surgery_forms SET ${set.join(', ')} WHERE id=$${i} RETURNING *`, vals)
    if(!r.rows.length) return res.status(404).json({error:'Surgery form not found'})
    res.json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})
router.delete('/:id', async (req,res)=>{
  try{
    const ref=await pool.query('SELECT 1 FROM session_surgery_forms WHERE surgery_form_id=$1 LIMIT 1',[req.params.id])
    if(ref.rows.length) return res.status(400).json({error:'Cannot delete surgery form: referenced by sessions. Set inactive instead.'})
    const r=await pool.query('DELETE FROM surgery_forms WHERE id=$1 RETURNING id',[req.params.id])
    if(!r.rows.length) return res.status(404).json({error:'Surgery form not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})
export default router

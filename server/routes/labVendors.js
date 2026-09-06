import { Router } from 'express'
import pool from '../db.js'
const router = Router()

router.get('/', async (req,res)=>{
  try{
    const { is_active } = req.query
    if(is_active!==undefined && is_active!==''){
      const b=is_active==='true'?true:is_active==='false'?false:null
      if(b===null) return res.status(400).json({error:'is_active must be true or false'})
      const r=await pool.query('SELECT * FROM lab_vendors WHERE is_active=$1 ORDER BY display_order, name',[b])
      return res.json(r.rows)
    }
    const r=await pool.query('SELECT * FROM lab_vendors ORDER BY display_order, name')
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})
router.get('/:id', async (req,res)=>{
  try{const r=await pool.query('SELECT * FROM lab_vendors WHERE id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Lab vendor not found'}); res.json(r.rows[0])}catch(err){res.status(500).json({error:err.message})}
})
router.post('/', async (req,res)=>{
  try{
    const {name,is_active,display_order,is_custom}=req.body
    if(!name||!String(name).trim()) return res.status(400).json({error:'name is required'})
    const trimmed=String(name).trim()
    const dup=await pool.query('SELECT id FROM lab_vendors WHERE LOWER(name)=LOWER($1) LIMIT 1',[trimmed])
    if(dup.rows.length) return res.status(400).json({error:'Lab vendor name already exists'})
    const r=await pool.query(`INSERT INTO lab_vendors (name,is_active,display_order,is_custom) VALUES ($1,$2,$3,$4) RETURNING *`,[trimmed, is_active!==undefined?Boolean(is_active):true, display_order??0, is_custom?true:false])
    res.status(201).json(r.rows[0])
  }catch(err){if(err.code==='23505') return res.status(400).json({error:'Lab vendor name already exists'}); res.status(500).json({error:err.message})}
})
router.put('/:id', async (req,res)=>{
  try{
    const allowed=['name','is_active','display_order','is_custom']
    const updates={}; for(const k of allowed) if(req.body[k]!==undefined) updates[k]=req.body[k]
    if(!Object.keys(updates).length) return res.status(400).json({error:'No fields to update'})
    if(updates.name!==undefined && !String(updates.name).trim()) return res.status(400).json({error:'name cannot be empty'})
    if(updates.name!==undefined){
      const dup=await pool.query('SELECT id FROM lab_vendors WHERE LOWER(name)=LOWER($1) AND id!=$2 LIMIT 1',[String(updates.name).trim(), req.params.id])
      if(dup.rows.length) return res.status(400).json({error:'Lab vendor name already exists'})
    }
    const set=[]; const vals=[]; let i=1
    for(const [k,v] of Object.entries(updates)){ set.push(`${k} = $${i}`); if(k==='name') vals.push(String(v).trim()); else if(k==='is_active'||k==='is_custom') vals.push(Boolean(v)); else vals.push(v); i++}
    set.push('updated_at = now()'); vals.push(req.params.id)
    const r=await pool.query(`UPDATE lab_vendors SET ${set.join(', ')} WHERE id=$${i} RETURNING *`, vals)
    if(!r.rows.length) return res.status(404).json({error:'Lab vendor not found'})
    res.json(r.rows[0])
  }catch(err){ if(err.code==='23505') return res.status(400).json({error:'Lab vendor name already exists'}); res.status(500).json({error:err.message})}
})
router.delete('/:id', async (req,res)=>{
  try{
    const ref=await pool.query('SELECT 1 FROM lab_entries WHERE lab_vendor_id=$1 LIMIT 1',[req.params.id])
    if(ref.rows.length) return res.status(400).json({error:'Cannot delete lab vendor: referenced by lab entries. Set inactive instead.'})
    const r=await pool.query('DELETE FROM lab_vendors WHERE id=$1 RETURNING id',[req.params.id])
    if(!r.rows.length) return res.status(404).json({error:'Lab vendor not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})
export default router

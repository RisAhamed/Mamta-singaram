import { Router } from 'express'
import pool from '../db.js'
const router = Router()

// GET /api/appointments?patient_id&status&date_from&date_to&location_id
router.get('/', async (req,res)=>{
  try{
    const { patient_id, status, date_from, date_to, location_id, session_id } = req.query
    const cond=[]; const vals=[]; let i=1
    if(patient_id){ cond.push(`patient_id = $${i}`); vals.push(patient_id); i++}
    if(session_id){ cond.push(`session_id = $${i}`); vals.push(session_id); i++}
    if(status){ cond.push(`status = $${i}`); vals.push(status); i++}
    if(location_id){ cond.push(`location_id = $${i}`); vals.push(location_id); i++}
    if(date_from){ cond.push(`appointment_date >= $${i}`); vals.push(date_from); i++}
    if(date_to){ cond.push(`appointment_date <= $${i}`); vals.push(date_to); i++}
    let sql='SELECT * FROM appointments'
    if(cond.length) sql+=' WHERE '+cond.join(' AND ')
    sql+=' ORDER BY appointment_date DESC, appointment_time DESC'
    const r=await pool.query(sql, vals)
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})

router.get('/:id', async (req,res)=>{
  try{const r=await pool.query('SELECT * FROM appointments WHERE id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Appointment not found'}); res.json(r.rows[0])}catch(err){res.status(500).json({error:err.message})}
})

router.post('/', async (req,res)=>{
  try{
    const { patient_id, session_id, title, appointment_date, appointment_time, status, notes, location_id } = req.body
    if(!patient_id) return res.status(400).json({error:'patient_id is required'})
    if(!appointment_date) return res.status(400).json({error:'appointment_date is required'})
    if(status && !['Scheduled','Completed','Cancelled','No-Show'].includes(status)) return res.status(400).json({error:'Invalid status'})
    let location_name=null
    if(location_id){
      const lr=await pool.query('SELECT name FROM locations WHERE id=$1',[location_id])
      if(!lr.rows.length) return res.status(400).json({error:'Invalid location_id'})
      location_name=lr.rows[0].name
    }
    const r=await pool.query(`INSERT INTO appointments (patient_id, session_id, title, appointment_date, appointment_time, status, notes, location_id, location_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [patient_id, session_id||null, title?String(title).trim():null, appointment_date, appointment_time||null, status||'Scheduled', notes?String(notes).trim():null, location_id||null, location_name])
    res.status(201).json(r.rows[0])
  }catch(err){
    if(err.code==='23503') return res.status(400).json({error:'Invalid patient_id, session_id or location_id'})
    if(err.code==='23514') return res.status(400).json({error:err.message})
    res.status(500).json({error:err.message})
  }
})

router.put('/:id', async (req,res)=>{
  try{
    const { id } = req.params
    const allowed=['patient_id','session_id','title','appointment_date','appointment_time','status','notes','location_id']
    const updates={}; for(const k of allowed) if(req.body[k]!==undefined) updates[k]=req.body[k]
    if(!Object.keys(updates).length) return res.status(400).json({error:'No fields to update'})
    if(updates.status && !['Scheduled','Completed','Cancelled','No-Show'].includes(updates.status)) return res.status(400).json({error:'Invalid status'})
    // Handle location_name snapshot
    if(updates.location_id !== undefined){
      if(updates.location_id===null || updates.location_id===''){
        updates.location_id=null; updates.location_name=null
      } else {
        const lr=await pool.query('SELECT name FROM locations WHERE id=$1',[updates.location_id])
        if(!lr.rows.length) return res.status(400).json({error:'Invalid location_id'})
        updates.location_name=lr.rows[0].name
      }
    }
    const set=[]; const vals=[]; let i=1
    for(const [k,v] of Object.entries(updates)){
      set.push(`${k} = $${i}`)
      if(k==='title'||k==='notes'||k==='location_name') vals.push(v?String(v).trim():null)
      else vals.push(v)
      i++
    }
    set.push('updated_at = now()'); vals.push(id)
    const r=await pool.query(`UPDATE appointments SET ${set.join(', ')} WHERE id=$${i} RETURNING *`, vals)
    if(!r.rows.length) return res.status(404).json({error:'Appointment not found'})
    res.json(r.rows[0])
  }catch(err){
    if(err.code==='23503') return res.status(400).json({error:'Invalid reference'})
    if(err.code==='23514') return res.status(400).json({error:err.message})
    res.status(500).json({error:err.message})
  }
})

router.delete('/:id', async (req,res)=>{
  try{
    const r=await pool.query('DELETE FROM appointments WHERE id=$1 RETURNING id',[req.params.id])
    if(!r.rows.length) return res.status(404).json({error:'Appointment not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

import { Router } from 'express'
import pool from '../db.js'
const router = Router({ mergeParams: true })

// GET /api/sessions/:sessionId/lab-entries
router.get('/', async (req,res)=>{
  try{
    const r=await pool.query('SELECT * FROM lab_entries WHERE session_id=$1 ORDER BY entry_date DESC, created_at DESC',[req.params.sessionId])
    res.json(r.rows)
  }catch(err){res.status(500).json({error:err.message})}
})

// POST
router.post('/', async (req,res)=>{
  try{
    const { sessionId } = req.params
    const { test_name, cost, amount_paid, entry_date, required_date, status, notes, lab_vendor_id } = req.body
    if(!test_name || !String(test_name).trim()) return res.status(400).json({error:'test_name is required'})
    if(cost!==undefined && cost!=='' && (isNaN(Number(cost)) || Number(cost) < 0)) return res.status(400).json({error:'cost must be a non-negative number'})
    if(amount_paid!==undefined && amount_paid!=='' && (isNaN(Number(amount_paid)) || Number(amount_paid) < 0)) return res.status(400).json({error:'amount_paid must be a non-negative number'})
    if(Number(amount_paid||0) > Number(cost||0)) return res.status(400).json({error:'amount_paid cannot exceed cost'})
    if(status && !['Ordered','Received','Cancelled'].includes(status)) return res.status(400).json({error:'Invalid status'})
    if(required_date && entry_date && new Date(required_date) < new Date(entry_date)) return res.status(400).json({error:'required_date cannot be before entry_date'})
    const sess=await pool.query('SELECT patient_id FROM sessions WHERE id=$1',[sessionId])
    if(!sess.rows.length) return res.status(404).json({error:'Session not found'})
    const patient_id=sess.rows[0].patient_id
    let vendorName=null
    if(lab_vendor_id){
      const vr=await pool.query('SELECT name FROM lab_vendors WHERE id=$1',[lab_vendor_id])
      if(!vr.rows.length) return res.status(400).json({error:'Invalid lab_vendor_id'})
      vendorName=vr.rows[0].name
    }
    const r=await pool.query(`INSERT INTO lab_entries (session_id, patient_id, lab_vendor_id, lab_vendor_name, test_name, cost, amount_paid, entry_date, required_date, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [sessionId, patient_id, lab_vendor_id||null, vendorName, String(test_name).trim(), cost!==undefined&&cost!==''?Number(cost):0, amount_paid!==undefined&&amount_paid!==''?Number(amount_paid):0, entry_date||new Date().toISOString().split('T')[0], required_date||null, status||'Ordered', notes?String(notes).trim():null])
    res.status(201).json(r.rows[0])
  }catch(err){
    if(err.code==='23514') return res.status(400).json({error:err.message})
    res.status(500).json({error:err.message})
  }
})

// PUT /api/sessions/:sessionId/lab-entries/:entryId
router.put('/:entryId', async (req,res)=>{
  try{
    const { sessionId, entryId } = req.params
    const allowed=['test_name','cost','amount_paid','entry_date','required_date','status','notes','lab_vendor_id']
    const updates={}; for(const k of allowed) if(req.body[k]!==undefined) updates[k]=req.body[k]
    if(!Object.keys(updates).length) return res.status(400).json({error:'No fields to update'})
    if(updates.test_name!==undefined && !String(updates.test_name).trim()) return res.status(400).json({error:'test_name cannot be empty'})
    if(updates.cost!==undefined && (isNaN(Number(updates.cost)) || Number(updates.cost) < 0)) return res.status(400).json({error:'cost must be a non-negative number'})
    if(updates.amount_paid!==undefined && (isNaN(Number(updates.amount_paid)) || Number(updates.amount_paid) < 0)) return res.status(400).json({error:'amount_paid must be non-negative'})
    if(updates.status!==undefined && !['Ordered','Received','Cancelled'].includes(updates.status)) return res.status(400).json({error:'Invalid status'})
    // Fetch existing to validate cross-field
    const existing = await pool.query('SELECT cost, amount_paid, entry_date FROM lab_entries WHERE id=$1 AND session_id=$2',[entryId, sessionId])
    if(!existing.rows.length) return res.status(404).json({error:'Lab entry not found'})
    const effCost = updates.cost!==undefined ? Number(updates.cost) : Number(existing.rows[0].cost)
    const effPaid = updates.amount_paid!==undefined ? Number(updates.amount_paid) : Number(existing.rows[0].amount_paid)
    if(effPaid > effCost) return res.status(400).json({error:'amount_paid cannot exceed cost'})
    const effEntry = updates.entry_date!==undefined ? updates.entry_date : existing.rows[0].entry_date
    const effReq = updates.required_date!==undefined ? updates.required_date : null
    if(effReq && effEntry && new Date(effReq) < new Date(effEntry)) return res.status(400).json({error:'required_date cannot be before entry_date'})
    if(updates.lab_vendor_id!==undefined){
      if(updates.lab_vendor_id===null||updates.lab_vendor_id===''){ updates.lab_vendor_id=null; updates.lab_vendor_name=null } else {
        const vr=await pool.query('SELECT name FROM lab_vendors WHERE id=$1',[updates.lab_vendor_id])
        if(!vr.rows.length) return res.status(400).json({error:'Invalid lab_vendor_id'})
        updates.lab_vendor_name=vr.rows[0].name
      }
    }
    const set=[]; const vals=[]; let i=1
    for(const [k,v] of Object.entries(updates)){ set.push(`${k} = $${i}`); if(k==='test_name'||k==='notes'||k==='lab_vendor_name'||k==='status') vals.push(v?String(v).trim():null); else vals.push(v); i++}
    set.push('updated_at = now()'); vals.push(entryId); vals.push(sessionId)
    const r=await pool.query(`UPDATE lab_entries SET ${set.join(', ')} WHERE id=$${i} AND session_id=$${i+1} RETURNING *`, vals)
    if(!r.rows.length) return res.status(404).json({error:'Lab entry not found'})
    res.json(r.rows[0])
  }catch(err){res.status(500).json({error:err.message})}
})

// DELETE
router.delete('/:entryId', async (req,res)=>{
  try{
    const r=await pool.query('DELETE FROM lab_entries WHERE id=$1 AND session_id=$2 RETURNING id',[req.params.entryId, req.params.sessionId])
    if(!r.rows.length) return res.status(404).json({error:'Lab entry not found'})
    res.json({success:true})
  }catch(err){res.status(500).json({error:err.message})}
})

export default router

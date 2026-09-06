import fs from 'fs/promises'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'
import pool from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  try {
    const schemaPath = path.resolve(__dirname, 'schema.sql')
    const sql = await fs.readFile(schemaPath, 'utf-8')
    console.log('Running migration from server/schema.sql ...')
    const rawStatements = sql.split(';')
    const statements = rawStatements.map(s=>{
      // Remove comment lines starting with --
      const lines = s.split('\n').filter(l=>!l.trim().startsWith('--'))
      return lines.join('\n').trim()
    }).filter(s=>s.length>0)
    console.log(`Executing ${statements.length} statements...`)
    const client = await pool.connect()
    try {
      for (let i=0;i<statements.length;i++){
        const stmt = statements[i]
        await client.query(stmt)
        if((i+1)%20===0) console.log(`  ${i+1}/${statements.length} done`)
      }
      console.log('Migration completed successfully. All tables created with indexes and seed data.')
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Migration failed:', err.message)
    if (err.stack) console.error(err.stack)
    process.exitCode = 1
  } finally {
    try {
      await pool.end()
    } catch {}
    setTimeout(() => process.exit(process.exitCode || 0), 100)
  }
}

migrate()

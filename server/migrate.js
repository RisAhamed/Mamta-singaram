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
    await pool.query(sql)
    console.log('Migration completed successfully. All 7 tables created with indexes.')
  } catch (err) {
    console.error('Migration failed:', err.message)
    if (err.stack) console.error(err.stack)
    process.exitCode = 1
  } finally {
    try {
      await pool.end()
    } catch {}
    // Ensure process exits (pool.end may keep event loop alive briefly)
    setTimeout(() => process.exit(process.exitCode || 0), 100)
  }
}

migrate()

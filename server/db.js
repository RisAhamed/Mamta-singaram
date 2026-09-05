import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Optional: verify connection on startup (non-blocking)
// pool.query('SELECT 1').catch(err => console.error('DB pool init error:', err.message))

export default pool
export { pool }

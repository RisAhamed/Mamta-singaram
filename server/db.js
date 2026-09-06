import fs from 'fs'
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

function resolveConnectionString() {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing from the root .env file')
  }
  if (connectionString.includes('<ENTER-SQL-USER-PASSWORD>')) {
    throw new Error('DATABASE_URL is still the placeholder value in the root .env file')
  }
  return connectionString
}

function resolveSslOptions() {
  const candidates = [
    path.resolve(__dirname, '../root.crt'),
    path.join(process.env.APPDATA || '', 'postgresql', 'root.crt'),
  ]

  for (const certPath of candidates) {
    if (certPath && fs.existsSync(certPath)) {
      return {
        ca: fs.readFileSync(certPath),
        rejectUnauthorized: true,
      }
    }
  }

  throw new Error('CockroachDB root certificate not found at root.crt or %APPDATA%\\postgresql\\root.crt')
}

const pool = new Pool({
  connectionString: resolveConnectionString(),
  ssl: resolveSslOptions(),
})

// Optional: verify connection on startup (non-blocking)
// pool.query('SELECT 1').catch(err => console.error('DB pool init error:', err.message))

export default pool
export { pool }

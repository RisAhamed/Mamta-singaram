import fs from 'fs'
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env if it exists (skip on Render/Vercel where env vars are set in dashboard)
try {
  const envPath = path.resolve(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
} catch { /* .env not present — rely on process.env from hosting platform */ }

const { Pool } = pg

function resolveConnectionString() {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing. Set it in .env (local) or in your hosting dashboard (Render, etc.).')
  }
  if (connectionString.includes('<ENTER-SQL-USER-PASSWORD>')) {
    throw new Error('DATABASE_URL is still the placeholder value.')
  }
  return connectionString
}

function resolveSslOptions() {
  // Look for CockroachDB root certificate in multiple locations
  const candidates = [
    path.resolve(__dirname, '../root.crt'),
    path.resolve(__dirname, '../certs/root.crt'),
    path.join(process.env.APPDATA || '', 'postgresql', 'root.crt'),
    '/etc/ssl/certs/root.crt',
    path.join(process.env.HOME || '', '.postgresql', 'root.crt'),
  ]

  for (const certPath of candidates) {
    if (certPath && fs.existsSync(certPath)) {
      console.log(`[db] Using SSL certificate from ${certPath}`)
      return {
        ca: fs.readFileSync(certPath),
        rejectUnauthorized: true,
      }
    }
  }

  // If no certificate found, try sslmode=require (works for CockroachDB Serverless)
  console.warn('[db] No SSL certificate found. Trying sslmode=require via connection string.')
  return false
}

const sslOptions = resolveSslOptions()
const pool = new Pool({
  connectionString: resolveConnectionString(),
  ...(sslOptions ? { ssl: sslOptions } : {}),
})

export default pool
export { pool }

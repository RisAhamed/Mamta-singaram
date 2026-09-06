import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

function envTrim(name) {
  const v = process.env[name]
  return v ? v.trim() : ''
}

// Support both R2_ENDPOINT and legacy DEFAULT_ENDPOINT_URL_S3
const endpoint = envTrim('R2_ENDPOINT') || envTrim('DEFAULT_ENDPOINT_URL_S3') || envTrim('R2_PUBLIC_URL') || ''
const accessKeyId = envTrim('R2_ACCESS_KEY_ID')
const secretAccessKey = envTrim('R2_SECRET_ACCESS_KEY')
const bucketName = envTrim('R2_BUCKET_NAME')
const publicUrl = envTrim('R2_PUBLIC_URL')

if (!bucketName) console.warn('[r2] R2_BUCKET_NAME missing')
if (!endpoint) console.warn('[r2] R2 endpoint missing (R2_ENDPOINT / DEFAULT_ENDPOINT_URL_S3)')

export const s3 = new S3Client({
  region: 'auto',
  endpoint: endpoint || undefined,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
})

export const bucket = bucketName
export const r2PublicUrl = publicUrl

export async function uploadFile(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
}

export async function deleteFile(key) {
  await s3.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  }))
}

export async function getFileUrl(key) {
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`
  }
  // Private bucket -> presigned URL 1 hour
  const cmd = new GetObjectCommand({ Bucket: bucketName, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn: 3600 })
}

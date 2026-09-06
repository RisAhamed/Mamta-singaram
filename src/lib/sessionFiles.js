// Deprecated: Firebase implementation removed. Re-export from api.js for compatibility.
export { validateSessionFile, formatFileSize, uploadSessionFile, deleteSessionFile, getSessionFiles } from './api.js'
import { uploadSessionFile as apiUpload, deleteSessionFile as apiDelete } from './api.js'

// Legacy signature (file, patientId, sessionId) -> map to new API (sessionId, file)
// Keep compat: if called with (file, patientId, sessionId) we ignore patientId
export async function uploadSessionFileCompat(file, _patientId, sessionId) {
  return apiUpload(sessionId, file)
}

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

console.log('API Base URL:', BASE_URL, '| VITE_API_URL env:', import.meta.env.VITE_API_URL)

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  console.log(`[API] ${options.method || 'GET'} ${url}`)
  let res
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch (networkErr) {
    console.error(`[API] Network error for ${url}:`, networkErr)
    // Surface URL in thrown error so toast shows it
    throw new Error(`Failed to fetch ${url}: ${networkErr.message}. Is the backend running at ${BASE_URL}?`)
  }
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const serverMsg = data && typeof data === 'object' && data.error ? data.error : (data?.message || text || `Request failed ${res.status}`)
    console.error(`[API] ${res.status} ${url}:`, serverMsg, data)
    throw new Error(`${serverMsg} (${res.status} ${url})`)
  }
  console.log(`[API] ${res.status} ${url} OK`)
  return data
}

// Patients
export function getPatients(search) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return request(`/api/patients${qs}`)
}
export function getPatient(id) { return request(`/api/patients/${id}`) }
export function createPatient(data) { return request('/api/patients', { method: 'POST', body: JSON.stringify(data) }) }
export function updatePatient(id, data) { return request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deletePatient(id) { return request(`/api/patients/${id}`, { method: 'DELETE' }) }

// Doctors
export function getDoctors(isActive) {
  if (isActive === true) return request('/api/doctors?is_active=true')
  if (isActive === false) return request('/api/doctors?is_active=false')
  if (typeof isActive === 'string' && (isActive === 'true' || isActive === 'false')) return request(`/api/doctors?is_active=${isActive}`)
  return request('/api/doctors')
}
export function getDoctor(id) { return request(`/api/doctors/${id}`) }
export function createDoctor(data) { return request('/api/doctors', { method: 'POST', body: JSON.stringify(data) }) }
export function updateDoctor(id, data) { return request(`/api/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteDoctor(id) { return request(`/api/doctors/${id}`, { method: 'DELETE' }) }

// Sessions
export function getSessions(filters = {}) {
  const params = new URLSearchParams()
  if (filters.patient_id) params.set('patient_id', filters.patient_id)
  if (filters.payment_status) params.set('payment_status', filters.payment_status)
  if (filters.visit_date_from) params.set('visit_date_from', filters.visit_date_from)
  if (filters.visit_date_to) params.set('visit_date_to', filters.visit_date_to)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/sessions${qs}`)
}
export function getSession(id) { return request(`/api/sessions/${id}`) }
export function createSession(data) { return request('/api/sessions', { method: 'POST', body: JSON.stringify(data) }) }
export function updateSession(id, data) { return request(`/api/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteSession(id) { return request(`/api/sessions/${id}`, { method: 'DELETE' }) }

// Session Doctors
export function getSessionDoctors(sessionId) { return request(`/api/sessions/${sessionId}/doctors`) }
export function addSessionDoctor(sessionId, doctorId) { return request(`/api/sessions/${sessionId}/doctors`, { method: 'POST', body: JSON.stringify({ doctor_id: doctorId }) }) }
export function removeSessionDoctor(sessionId, doctorId) { return request(`/api/sessions/${sessionId}/doctors/${doctorId}`, { method: 'DELETE' }) }

// Dental Chart
export function getChartEntries(sessionId) { return request(`/api/sessions/${sessionId}/chart`) }
export function addChartEntry(sessionId, data) { return request(`/api/sessions/${sessionId}/chart`, { method: 'POST', body: JSON.stringify(data) }) }
export function deleteChartEntry(sessionId, entryId) { return request(`/api/sessions/${sessionId}/chart/${entryId}`, { method: 'DELETE' }) }

// Consultation Forms
export function getConsultationForms(sessionId) { return request(`/api/sessions/${sessionId}/consultation-forms`) }
export function createConsultationForm(sessionId, data) { return request(`/api/sessions/${sessionId}/consultation-forms`, { method: 'POST', body: JSON.stringify(data) }) }
export function deleteConsultationForm(sessionId, formId) { return request(`/api/sessions/${sessionId}/consultation-forms/${formId}`, { method: 'DELETE' }) }

// Session Files (R2)
export function getSessionFiles(sessionId) { return request(`/api/sessions/${sessionId}/files`) }
export async function uploadSessionFile(sessionId, file, metadata = {}) {
  const form = new FormData()
  form.append('file', file)
  if (metadata.description) form.append('description', metadata.description)
  const url = `${BASE_URL}/api/sessions/${sessionId}/files`
  console.log(`[API] POST ${url} (multipart)`)
  let res
  try {
    res = await fetch(url, { method: 'POST', body: form })
  } catch (networkErr) {
    console.error(`[API] Network error for ${url}:`, networkErr)
    throw new Error(`Failed to fetch ${url}: ${networkErr.message}. Is the backend running at ${BASE_URL}?`)
  }
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const serverMsg = data && typeof data === 'object' && data.error ? data.error : `Upload failed ${res.status}`
    console.error(`[API] ${res.status} ${url}:`, serverMsg, data)
    throw new Error(`${serverMsg} (${res.status} ${url})`)
  }
  console.log(`[API] ${res.status} ${url} OK`)
  return data
}
export function deleteSessionFile(fileId) { return request(`/api/files/${fileId}`, { method: 'DELETE' }) }

// Helpers kept for frontend compatibility
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
export function validateSessionFile(file) {
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
  const MAX_SIZE_BYTES = 512000
  if (!file) return { valid: false, message: 'No file selected.', error: 'No file selected.' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    const msg = `Unsupported file type: ${file.type}. Allowed: PDF, JPG, PNG.`
    return { valid: false, message: msg, error: msg }
  }
  if (file.size >= MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const msg = `File too large (${sizeMB} MB). Maximum allowed is less than 0.5 MB.`
    return { valid: false, message: msg, error: msg }
  }
  return { valid: true, message: '', error: '' }
}

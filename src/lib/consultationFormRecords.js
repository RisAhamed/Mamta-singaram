// Deprecated: Firebase implementation removed. Re-export from api.js for compatibility.
export { getConsultationForms, createConsultationForm, deleteConsultationForm } from './api.js'
import { getConsultationForms as apiGet, createConsultationForm as apiCreate, deleteConsultationForm as apiDelete } from './api.js'

export async function getConsultationFormsForSession(sessionId) {
  return apiGet(sessionId)
}
export async function saveConsultationFormRecord({ sessionId, formId, formLabel, signatureUrl, storagePath, acknowledged }) {
  return apiCreate(sessionId, { form_type: formId, form_label: formLabel, signature_url: signatureUrl, storage_path: storagePath, acknowledged: acknowledged ?? true })
}
export async function deleteConsultationFormRecord(recordId) {
  // Note: new API needs sessionId; this compat wrapper cannot delete without it.
  // Callers should use deleteConsultationForm(sessionId, formId) directly.
  throw new Error('deleteConsultationFormRecord deprecated: use deleteConsultationForm(sessionId, formId) from api.js')
}
export async function uploadConsultationSignature() {
  throw new Error('uploadConsultationSignature deprecated: use createConsultationForm')
}

// Consultation form registry — data-driven, future-ready
// Feature architecture is preserved. Current content is temporarily unavailable.
// To add a new consultation form in the future:
// 1. Place the new document (PDF) in public/consultation-forms/
// 2. Add an entry: { id: 'unique_id', label: 'Display Label', file: '/consultation-forms/your-file.pdf' }
// 3. The sidebar and session UI will automatically expose it (opens in new tab via target="_blank").
//
// Current state: no valid consultation-form document is configured. UI handles empty list gracefully
// with an unavailable/placeholder state instead of broken links.
export const CONSULTATION_FORMS = []

export function validateSignatureFile(file) {
  const MAX_SIZE = 512000 // 0.5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png']
  if (!file) return { valid: false, message: 'No file selected' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, message: 'Only JPG or PNG allowed' }
  }
  if (file.size >= MAX_SIZE) {
    return { valid: false, message: 'File size must be less than 0.5 MB' }
  }
  return { valid: true, message: '' }
}

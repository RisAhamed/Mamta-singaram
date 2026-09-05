export const CONSULTATION_FORMS = [
  { id: 'restoration', label: 'Restoration', file: '/consultation-forms/restoration.pdf' },
  { id: 'root_canal', label: 'Root Canal Treatment', file: '/consultation-forms/root-canal-treatment.pdf' },
  { id: 'post_endodontic', label: 'Post Endodontic Restorations', file: '/consultation-forms/post-endodontic-restorations.pdf' },
  { id: 'endodontic_surgery', label: 'Endodontic Surgery', file: '/consultation-forms/endodontic-surgery.pdf' },
  { id: 'esthetic', label: 'Esthetic Procedures', file: '/consultation-forms/esthetic-procedures.pdf' },
  { id: 'periodontics_scaling_root_planing', label: 'Scaling and Root Planing Consent', file: '/consultation-forms/Clear_Periodontics_Scaling_Root_Planing_Consent_Form.pdf' },
  { id: 'periodontics_informed_consent', label: 'Periodontics Informed Consent', file: '/consultation-forms/Periodontics_Consent_Form.pdf.pdf' },
  { id: 'tooth_extraction', label: 'Tooth Extraction', file: '/consultation-forms/tooth-extraction.pdf' },
]

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

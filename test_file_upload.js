const base = 'http://localhost:3001/api'

async function req(method, path, body, isMultipart = false) {
  const opts = { method, headers: {} }
  if (!isMultipart && body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (body) {
    opts.body = body
  }
  const r = await fetch(base + path, opts)
  const t = await r.text()
  let d
  try { d = JSON.parse(t) } catch { d = t }
  return { status: r.status, data: d }
}

function assert(condition, msg) {
  if (!condition) throw new Error('ASSERT FAILED: ' + msg)
  console.log('  PASS:', msg)
}

function createTestFile(name, size, mimeType) {
  const buffer = Buffer.alloc(size, 0x41)
  const blob = new Blob([buffer], { type: mimeType })
  return new File([blob], name, { type: mimeType })
}

let pid, sid

async function setup() {
  const p = await req('POST', '/patients', { full_name: 'Upload Test Patient', phone: '9009000001' })
  pid = p.data.id

  const s = await req('POST', '/sessions', {
    patient_id: pid,
    chief_complaint: 'Upload test',
    next_visit_date: '2026-01-01',
  })
  sid = s.data.id
  console.log('Setup: patient + session created')
}

async function testJPGUpload() {
  console.log('\n--- Test: JPG upload ---')
  const file = createTestFile('test.jpg', 1024, 'image/jpeg')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  const d = await r.json()
  assert(r.status === 201, 'JPG upload -> 201')
  assert(d.file_name === 'test.jpg', 'File name preserved')
  assert(d.file_type === 'image/jpeg', 'MIME type correct')
  assert(d.file_size_bytes > 0, 'File size > 0')
  assert(d.session_id === sid, 'Session ID correct')
  assert(d.patient_id === pid, 'Patient ID correct')
  assert(d.storage_path.startsWith(`patients/${pid}/sessions/${sid}/`), 'Storage path correct')
  assert(d.file_url, 'File URL generated')
}

async function testPNGUpload() {
  console.log('\n--- Test: PNG upload ---')
  const file = createTestFile('test.png', 2048, 'image/png')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  const d = await r.json()
  assert(r.status === 201, 'PNG upload -> 201')
  assert(d.file_type === 'image/png', 'MIME type correct')
}

async function testPDFUpload() {
  console.log('\n--- Test: PDF upload ---')
  const file = createTestFile('document.pdf', 4096, 'application/pdf')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  const d = await r.json()
  assert(r.status === 201, 'PDF upload -> 201')
  assert(d.file_type === 'application/pdf', 'MIME type correct')
}

async function testHEICUpload() {
  console.log('\n--- Test: HEIC upload ---')
  const file = createTestFile('photo.heic', 3000, 'image/heic')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  const d = await r.json()
  assert(r.status === 201, 'HEIC upload -> 201')
  assert(d.file_type === 'image/heic', 'MIME type correct')
}

async function testHEIFUpload() {
  console.log('\n--- Test: HEIF upload ---')
  const file = createTestFile('photo.heif', 3000, 'image/heif')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  const d = await r.json()
  assert(r.status === 201, 'HEIF upload -> 201')
  assert(d.file_type === 'image/heif', 'MIME type correct')
}

async function testInvalidType() {
  console.log('\n--- Test: Invalid file type ---')
  const file = createTestFile('script.exe', 1000, 'application/octet-stream')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  assert(r.status === 400, 'Invalid type -> 400')
}

async function testOversizedFile() {
  console.log('\n--- Test: Oversized file ---')
  const file = createTestFile('large.jpg', 600000, 'image/jpeg')
  const form = new FormData()
  form.append('file', file)

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  assert(r.status === 400, 'Oversized -> 400')
}

async function testEmptyFile() {
  console.log('\n--- Test: Empty file ---')
  const form = new FormData()
  form.append('file', new Blob([], { type: 'image/jpeg' }), '')

  const r = await fetch(`${base}/sessions/${sid}/files`, { method: 'POST', body: form })
  assert(r.status === 400, 'Empty file -> 400')
}

async function testMetadataPersistence() {
  console.log('\n--- Test: Metadata persistence ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  assert(arr.length >= 3, `At least 3 files (got ${arr.length})`)

  const jpg = arr.find(f => f.file_type === 'image/jpeg')
  assert(jpg, 'JPG file found')
  assert(jpg.file_name === 'test.jpg', 'JPG name persisted')
  assert(jpg.file_size_bytes > 0, 'JPG size persisted')
  assert(jpg.file_url, 'JPG URL persisted')

  const heic = arr.find(f => f.file_type === 'image/heic')
  assert(heic, 'HEIC file found')
  assert(heic.file_name === 'photo.heic', 'HEIC name persisted')
}

async function testFileRetrieval() {
  console.log('\n--- Test: File retrieval ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  assert(arr.length > 0, 'Files retrieved')

  for (const file of arr) {
    assert(file.file_url, `URL for ${file.file_name}`)
    assert(file.storage_path, `Storage path for ${file.file_name}`)
  }
}

async function testFileDelete() {
  console.log('\n--- Test: File delete ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  const fileToDelete = arr[0]
  assert(fileToDelete, 'File to delete exists')

  const d = await req('DELETE', `/api/files/${fileToDelete.id}`)
  assert(d.status === 200, 'Delete -> 200')

  const after = await req('GET', `/sessions/${sid}/files`)
  const afterArr = Array.isArray(after.data) ? after.data : []
  assert(!afterArr.find(f => f.id === fileToDelete.id), 'File removed from list')
}

async function testSessionRelationship() {
  console.log('\n--- Test: Session relationship ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  assert(arr.every(f => f.session_id === sid), 'All files belong to session')
  assert(arr.every(f => f.patient_id === pid), 'All files belong to patient')
}

async function testNoR2CredentialsExposed() {
  console.log('\n--- Test: No R2 credentials exposed ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  for (const file of arr) {
    assert(!file.storage_path?.includes('R2_ACCESS'), 'No R2 access key in storage_path')
    assert(!file.file_url?.includes('R2_ACCESS'), 'No R2 access key in URL')
    assert(!file.file_url?.includes('R2_SECRET'), 'No R2 secret in URL')
  }
}

async function testCleanup() {
  console.log('\n--- Cleanup ---')
  const files = await req('GET', `/sessions/${sid}/files`)
  const arr = Array.isArray(files.data) ? files.data : []
  for (const f of arr) {
    await req('DELETE', `/api/files/${f.id}`)
  }
  await req('DELETE', `/sessions/${sid}`)
  await req('DELETE', `/patients/${pid}`)
}

async function run() {
  console.log('=== File Upload Tests (iPhone/Mobile) ===\n')
  await setup()
  await testJPGUpload()
  await testPNGUpload()
  await testPDFUpload()
  await testHEICUpload()
  await testHEIFUpload()
  await testInvalidType()
  await testOversizedFile()
  await testEmptyFile()
  await testMetadataPersistence()
  await testFileRetrieval()
  await testFileDelete()
  await testSessionRelationship()
  await testNoR2CredentialsExposed()
  await testCleanup()
  console.log('\n=== ALL FILE UPLOAD TESTS PASS ===')
}

run().catch(e => { console.error('TEST FAILED:', e.message); console.error(e.stack); process.exit(1) })

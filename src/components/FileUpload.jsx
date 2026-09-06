import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Paperclip, Trash2, X, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { validateSessionFile, formatFileSize, uploadSessionFile } from '../lib/api'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif']
const MAX_SIZE_BYTES = 512000

const FileUpload = forwardRef(function FileUpload({
  existingFiles = [],
  required = false,
  showExistingFiles = false,
  onOpenFile,
  onDeleteFile,
  deletingFileId,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
}, ref) {
  const [pendingFiles, setPendingFiles] = useState([])
  const [fileErrors, setFileErrors] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const abortRef = useRef(null)

  const handleFilesSelected = useCallback((event) => {
    const incomingFiles = Array.from(event.target.files || [])
    if (!incomingFiles.length) return

    const nextValid = []
    const nextErrors = []

    incomingFiles.forEach((file) => {
      const isDuplicate = pendingFiles.some(
        (item) => item.name === file.name && item.size === file.size && item.type === file.type
      )
      if (isDuplicate) {
        nextErrors.push(`${file.name}: already added`)
        return
      }

      const result = validateSessionFile(file)
      if (result.valid) {
        nextValid.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
        })
      } else {
        nextErrors.push(`${file.name}: ${result.message}`)
      }
    })

    if (nextValid.length > 0) {
      setPendingFiles((prev) => [...prev, ...nextValid])
    }

    if (nextErrors.length > 0) {
      setFileErrors(nextErrors)
    } else {
      setFileErrors([])
    }

    event.target.value = ''
  }, [pendingFiles])

  const removePendingFile = useCallback((fileId) => {
    setPendingFiles((prev) => prev.filter((item) => item.id !== fileId))
  }, [])

  const clearErrors = useCallback(() => {
    setFileErrors([])
  }, [])

  const uploadAll = useCallback(async (targetSessionId) => {
    if (pendingFiles.length === 0) return { success: true, failedFiles: [] }

    setUploading(true)
    abortRef.current = new AbortController()
    const failedFiles = []

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const item = pendingFiles[i]
        if (abortRef.current.signal.aborted) {
          failedFiles.push({ ...item, uploadError: 'Cancelled' })
          continue
        }

        setPendingFiles((prev) =>
          prev.map((f) => f.id === item.id ? { ...f, status: 'uploading' } : f)
        )

        try {
          await uploadSessionFile(targetSessionId, item.file)
          setPendingFiles((prev) =>
            prev.map((f) => f.id === item.id ? { ...f, status: 'done' } : f)
          )
        } catch (err) {
          setPendingFiles((prev) =>
            prev.map((f) => f.id === item.id ? { ...f, status: 'failed', uploadError: err.message } : f)
          )
          failedFiles.push({ ...item, uploadError: err.message })
        }
      }

      if (failedFiles.length === 0) {
        setPendingFiles([])
        setFileErrors([])
      }

      return { success: failedFiles.length === 0, failedFiles }
    } finally {
      setUploading(false)
    }
  }, [pendingFiles])

  const cancelUpload = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setUploading(false)
  }, [])

  const retryFailed = useCallback(() => {
    setPendingFiles((prev) =>
      prev.map((f) => f.status === 'failed' ? { ...f, status: 'pending', uploadError: null } : f)
    )
    setFileErrors([])
  }, [])

  const hasFailed = pendingFiles.some((f) => f.status === 'failed')
  const allDone = pendingFiles.length > 0 && pendingFiles.every((f) => f.status === 'done')

  useImperativeHandle(ref, () => ({
    uploadAll,
    hasPending: () => pendingFiles.length > 0,
    isUploading: () => uploading,
    getPendingCount: () => pendingFiles.filter((f) => f.status !== 'done').length,
  }), [uploadAll, pendingFiles, uploading])

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        {required && <span className="text-rose-600">*</span>}
        {required ? ' Required' : ''} — at least one photo/document is required for new sessions.
        Allowed: PDF/JPG/PNG. Maximum file size: 0.5 MB per file. You can add multiple files.
        <span className="hidden sm:inline"> On iPhone, tap to take a photo or choose from library.</span>
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.heic,.heif"
          onChange={handleFilesSelected}
          disabled={uploading}
          className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 file:transition hover:file:bg-slate-50 disabled:opacity-50"
        />
      </div>

      {fileErrors.length > 0 && (
        <div className="space-y-1">
          {fileErrors.map((err, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-red-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={clearErrors}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending uploads ({pendingFiles.filter((f) => f.status !== 'done').length} remaining)
            </p>
            {hasFailed && (
              <button
                type="button"
                onClick={retryFailed}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                <RotateCcw className="h-3 w-3" />
                Retry failed
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {pendingFiles.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${
                  item.status === 'done'
                    ? 'border-emerald-200 bg-emerald-50'
                    : item.status === 'failed'
                      ? 'border-red-200 bg-red-50'
                      : item.status === 'uploading'
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {item.status === 'uploading' ? (
                    <Loader2 className="h-4 w-4 text-blue-600 shrink-0 animate-spin" />
                  ) : item.status === 'done' ? (
                    <span className="h-4 w-4 text-emerald-600 shrink-0 flex items-center justify-center text-xs">✓</span>
                  ) : item.status === 'failed' ? (
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-teal-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${
                      item.status === 'done' ? 'text-emerald-700' :
                      item.status === 'failed' ? 'text-red-700' : 'text-slate-700'
                    }`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(item.size)}
                      {item.status === 'done' && ' — uploaded'}
                      {item.status === 'failed' && item.uploadError && ` — ${item.uploadError}`}
                    </p>
                  </div>
                </div>
                {!uploading && item.status !== 'done' && (
                  <button
                    type="button"
                    onClick={() => removePendingFile(item.id)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            Uploading documents…
          </div>
          <button
            type="button"
            onClick={cancelUpload}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      )}

      {allDone && (
        <p className="text-xs text-emerald-600 font-medium">All files uploaded successfully.</p>
      )}

      {showExistingFiles && existingFiles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Uploaded documents ({existingFiles.length})
          </p>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(file.file_size_bytes)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenFile?.(file)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-teal-700 transition hover:bg-teal-50"
                  >
                    <Paperclip className="h-3 w-3" />
                    Open
                  </button>
                  {confirmDeleteId === file.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={deletingFileId === file.id}
                        onClick={() => onDeleteFile?.(file)}
                        className="inline-flex items-center gap-1 rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingFileId === file.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelDelete?.()}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConfirmDelete?.(file.id)}
                      className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default FileUpload
export { ALLOWED_TYPES, MAX_SIZE_BYTES }

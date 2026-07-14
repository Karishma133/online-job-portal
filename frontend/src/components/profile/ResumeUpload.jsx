import { useRef, useState } from 'react'
import { HiOutlineDocumentText, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineTrash } from 'react-icons/hi'
import { userService } from '../../services/userService'
import { showToast } from '../common/Toast'

export default function ResumeUpload({ currentResume, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState(currentResume?.split('/').pop() || null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      showToast.error('Please upload a PDF file only')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('File must be under 5MB')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    setUploading(true)
    try {
      const data = await userService.uploadResume(formData)
      setFileName(file.name)
      onUploaded?.(data.resumeUrl)
      showToast.success('Resume uploaded!')
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFileName(null)
    onUploaded?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="label">Resume (PDF, max 5MB)</label>

      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />

      {!fileName ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-surface-200 rounded-xl py-8
                     flex flex-col items-center gap-2 text-surface-400
                     hover:border-primary-400 hover:text-primary-500 transition-colors"
        >
          <HiOutlineUpload className="text-2xl" />
          <span className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Click to upload your resume'}
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-surface-50">
          <div className="flex items-center gap-3 min-w-0">
            <HiOutlineDocumentText className="text-xl text-primary-500 shrink-0" />
            <span className="text-sm text-surface-700 truncate">{fileName}</span>
            <HiOutlineCheckCircle className="text-accent-500 shrink-0" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-primary-600 hover:underline">
              Replace
            </button>
            <button type="button" onClick={handleRemove} className="text-danger-500 hover:text-danger-600">
              <HiOutlineTrash />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineClipboardCopy, HiOutlineCheckCircle } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { showToast } from '../common/Toast'

export default function CoverLetterGenerator({ job }) {
  const { user } = useAuth()
  const [letter,   setLetter]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [copied,   setCopied]   = useState(false)

  if (!user || user.role !== 'student' || !job) return null

  const generate = async () => {
    setLoading(true)
    try {
      const data = await api.post('/ai/cover-letter', {
        jobTitle:       job.title,
        company:        job.company,
        jobDescription: job.description,
        userSkills:     user.skills || [],
        userName:       user.name,
      })
      setLetter(data.coverLetter)
    } catch (err) {
      showToast.error(err.message || 'Cover letter generation failed')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast.success('Copied to clipboard!')
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineDocumentText className="text-primary-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">AI Cover Letter</h3>
        <span className="badge-primary text-xs">Instant & Free</span>
      </div>

      {!letter && (
        <div className="card text-center py-8">
          <HiOutlineSparkles className="text-3xl text-primary-400 mx-auto mb-3" />
          <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
            AI teri skills aur is job ke hisaab se personalized cover letter likhega
          </p>
          <button onClick={generate} disabled={loading} className="btn btn-primary mx-auto">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><HiOutlineSparkles /> Generate Cover Letter</>
            )}
          </button>
        </div>
      )}

      {letter && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-surface-900 dark:text-white">Generated Cover Letter</p>
            <button onClick={copy} className="btn btn-ghost btn-sm">
              {copied ? <HiOutlineCheckCircle className="text-accent-500" /> : <HiOutlineClipboardCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">{letter}</p>
          </div>
          <button onClick={() => setLetter('')} className="btn btn-ghost btn-sm mt-3">
            Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

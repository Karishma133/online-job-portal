import { useState, useRef } from 'react'
import { HiOutlineSparkles, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDocumentText } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import { showToast } from '../common/Toast'

export default function AIResumeAnalyzer({ jobSkills = [], jobTitle = '' }) {
  const { user } = useAuth()
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [resumeText,setResumeText]= useState('')
  const [mode,      setMode]      = useState('paste') // paste | upload
  const inputRef = useRef(null)

  const analyze = async (text) => {
    if (!text.trim()) { showToast.error('Resume content daalo'); return }
    setLoading(true)
    try {
      const data = await api.post('/ai/analyze-resume', {
        resumeText: text,
        jobSkills,
        jobTitle,
      })
      setResult(data.analysis)
    } catch (err) {
      showToast.error(err.message || 'AI analysis failed — check ANTHROPIC_API_KEY in .env')
    } finally {
      setLoading(false)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      setResumeText(text)
      analyze(text)
    }
    reader.readAsText(file)
  }

  if (!user) return null

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <HiOutlineSparkles className="text-primary-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">
          AI Resume Analyzer
        </h3>
        <span className="badge-primary text-xs">Instant & Free</span>
      </div>

      {!result && !loading && (
        <>
          {/* Mode toggle */}
          <div className="flex gap-2">
            {['paste', 'upload'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  mode === m
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                }`}>{m === 'paste' ? 'Paste Text' : 'Upload File'}</button>
            ))}
          </div>

          {mode === 'paste' ? (
            <div className="space-y-3">
              <textarea
                rows={6}
                className="input resize-none"
                placeholder="Apni resume ka content yahan paste karo (skills, experience, education)..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <button onClick={() => analyze(resumeText)} className="btn btn-primary">
                <HiOutlineSparkles /> Analyze with AI
              </button>
            </div>
          ) : (
            <>
              <input ref={inputRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFile} className="hidden" />
              <button onClick={() => inputRef.current?.click()}
                className="w-full border-2 border-dashed border-primary-300 dark:border-primary-800 rounded-2xl py-10
                           flex flex-col items-center gap-3 text-primary-500 hover:border-primary-500
                           hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                <HiOutlineUpload className="text-3xl" />
                <div className="text-center">
                  <p className="font-medium text-sm">Upload resume file</p>
                  <p className="text-xs text-surface-400 mt-1">TXT file best kaam karta hai</p>
                </div>
              </button>
            </>
          )}
        </>
      )}

      {loading && (
        <div className="card text-center py-10">
          <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-surface-900 dark:text-white">Analyzing resume...</p>
          <p className="text-xs text-surface-400 mt-1">Ek moment please</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="card text-center">
            <div className={`text-5xl font-display font-bold mb-2 ${
              result.score >= 70 ? 'text-accent-500' : result.score >= 40 ? 'text-warn-500' : 'text-danger-500'
            }`}>{result.score}%</div>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">{result.summary}</p>
            <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all duration-700 ${
                result.score >= 70 ? 'bg-accent-500' : result.score >= 40 ? 'bg-warn-500' : 'bg-danger-500'
              }`} style={{ width: `${result.score}%` }} />
            </div>
          </div>

          {/* Skills found */}
          {result.skillsFound?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                <HiOutlineCheckCircle className="text-accent-500" /> Skills found
              </p>
              <div className="flex flex-wrap gap-2">
                {result.skillsFound.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-accent-400/10 text-accent-600 border border-accent-300 rounded-lg text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {result.missingSkills?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                <HiOutlineXCircle className="text-danger-500" /> Missing skills
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-danger-400/10 text-danger-500 border border-danger-300 rounded-lg text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-surface-900 dark:text-white mb-3">💪 Strengths</p>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex gap-2">
                    <span className="text-accent-500 shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-surface-900 dark:text-white mb-3">🚀 Improvements</p>
              <ul className="space-y-2">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex gap-2">
                    <span className="text-primary-500 shrink-0">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => setResult(null)} className="btn btn-ghost btn-sm w-full justify-center">
            Analyze another resume
          </button>
        </div>
      )}
    </div>
  )
}

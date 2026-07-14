import { useState } from 'react'
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLightBulb } from 'react-icons/hi'
import api from '../../services/api'
import { showToast } from '../common/Toast'

export default function ATSScore({ jobId, jobTitle = '' }) {
  const [resumeText, setResumeText] = useState('')
  const [result,     setResult]     = useState(null)
  const [loading,    setLoading]    = useState(false)

  const analyze = async () => {
    if (!resumeText.trim()) { showToast.error('Please paste your resume text'); return }
    setLoading(true)
    try {
      const data = await api.post('/users/ats-score', { resumeText, jobId })
      setResult(data)
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const gradeColor = {
    A: 'text-accent-500', B: 'text-primary-500',
    C: 'text-warn-500',   D: 'text-danger-500',
  }

  const barColor = (score, max) => {
    const pct = (score / max) * 100
    return pct >= 70 ? 'bg-accent-500' : pct >= 40 ? 'bg-warn-500' : 'bg-danger-500'
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <HiOutlineDocumentText className="text-primary-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">
          ATS Score Checker
        </h3>
        <span className="badge-primary text-xs">MNC Ready</span>
      </div>

      <div className="card bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
        <p className="text-xs text-primary-700 dark:text-primary-300 font-medium mb-1">💡 What is ATS?</p>
        <p className="text-xs text-surface-600 dark:text-surface-400">
          Most MNCs use Applicant Tracking Systems to filter resumes automatically before a human sees them.
          A score of 60%+ means your resume passes the ATS filter.
        </p>
      </div>

      {!result && (
        <div className="space-y-3">
          <textarea
            rows={7}
            className="input resize-none font-mono text-xs"
            placeholder="Paste your complete resume text here...

Example:
John Doe | john@email.com | +91-9876543210
Education: B.Tech Computer Science, XYZ University, 2024
Skills: React, Node.js, MongoDB, JavaScript, Git
Experience: Built a job portal using MERN stack...
Projects: SkillMatch - A skill-based job matching platform..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <button
            onClick={analyze}
            disabled={loading || !resumeText.trim()}
            className="btn btn-primary w-full justify-center"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <><HiOutlineDocumentText /> Check ATS Score</>
            )}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Main score */}
          <div className="card text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div>
                <p className={`text-6xl font-display font-bold ${gradeColor[result.grade] || 'text-primary-600'}`}>
                  {result.score}
                </p>
                <p className="text-surface-400 text-sm">out of 100</p>
              </div>
              <div className={`text-4xl font-bold ${gradeColor[result.grade]}`}>
                Grade {result.grade}
              </div>
            </div>
            <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-3 mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${barColor(result.score, 100)}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
              result.passesATS
                ? 'bg-accent-400/15 text-accent-600'
                : 'bg-danger-400/15 text-danger-600'
            }`}>
              {result.passesATS
                ? <><HiOutlineCheckCircle /> Passes ATS Filter ✓</>
                : <><HiOutlineXCircle /> Below ATS Threshold</>
              }
            </div>
          </div>

          {/* Breakdown */}
          <div className="card">
            <p className="font-semibold text-surface-900 dark:text-white mb-4">Score Breakdown</p>
            <div className="space-y-3">
              {Object.entries(result.breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-600 dark:text-surface-300 capitalize font-medium">{key}</span>
                    <span className="font-bold text-surface-800 dark:text-white">{val.score}/{val.max}</span>
                  </div>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${barColor(val.score, val.max)}`}
                      style={{ width: `${(val.score / val.max) * 100}%` }}
                    />
                  </div>
                  {key === 'skills' && val.missing?.length > 0 && (
                    <p className="text-xs text-danger-500 mt-1">
                      Missing: {val.missing.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="card">
              <p className="font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                <HiOutlineLightBulb className="text-warn-500" /> Improvement suggestions
              </p>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex gap-2">
                    <span className="text-primary-500 shrink-0 font-bold">{i + 1}.</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => setResult(null)} className="btn btn-ghost btn-sm w-full justify-center">
            Check again
          </button>
        </div>
      )}
    </div>
  )
}

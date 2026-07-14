import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineLocationMarker, HiOutlineCurrencyRupee, HiOutlineClock,
  HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineFire, HiOutlineChatAlt2,
} from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { jobService } from '../services/jobService'
import { userService } from '../services/userService'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useSkillMatch } from '../hooks/useSkillMatch'
import { formatSalary, timeAgo } from '../utils/helpers'
import SkillMatchBadge from '../components/job/SkillMatchBadge'
import SkillGapRoadmap from '../components/job/SkillGapRoadmap'
import InterviewPrep from '../components/job/InterviewPrep'
import SalaryPredictor from '../components/job/SalaryPredictor'
import CompanyReviews from '../components/job/CompanyReviews'
import AIResumeAnalyzer from '../components/features/AIResumeAnalyzer'
import CoverLetterGenerator from '../components/features/CoverLetterGenerator'
import ATSScore from '../components/features/ATSScore'
import Loader from '../components/common/Loader'
import { showToast } from '../components/common/Toast'

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'skill-gap',  label: 'Skill Gap' },
  { id: 'interview',  label: 'Interview Prep' },
  { id: 'salary',     label: 'Salary' },
  { id: 'ats',        label: 'ATS Score' },
  { id: 'ai-resume',  label: 'AI Resume' },
  { id: 'cover',      label: 'Cover Letter' },
  { id: 'reviews',    label: 'Reviews' },
]

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job,       setJob]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [applying,  setApplying]  = useState(false)
  const [applied,   setApplied]   = useState(false)
  const [messaging, setMessaging] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    jobService.getJobById(id)
      .then(data => { if (mounted) { setJob(data.job); setApplied(Boolean(data.hasApplied)) } })
      .catch(() => showToast.error('Job not found'))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const match = useSkillMatch(job?.requiredSkills || [])

  const handleApply = async () => {
    setApplying(true)
    try {
      const data = await userService.applyToJob(id)
      setApplied(true)

      if (data.instantResponse?.interviewDate) {
        // Strong match — the auto-response engine already booked an interview
        const when = new Date(data.instantResponse.interviewDate).toLocaleString('en-IN', {
          weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
        })
        showToast.success(`⚡ Great match! Interview auto-scheduled for ${when} (${data.instantResponse.interviewMode}).`)
      } else {
        showToast.success("Application submitted! You're guaranteed a response within 24 hours.")
      }
    } catch (err) { showToast.error(err.message) }
    finally { setApplying(false) }
  }

  const handleMessageRecruiter = async () => {
    if (!job?.postedBy?._id) return
    setMessaging(true)
    try {
      const data = await api.post('/chat', { participantId: job.postedBy._id, jobId: job._id })
      navigate('/chat', { state: { openChatId: data.chat._id } })
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setMessaging(false)
    }
  }

  if (loading) return <Loader fullscreen />
  if (!job) return null

  const isStudent = user?.role === 'student'

  return (
    <div className="section pt-6 md:pt-10">
      <div className="container-app max-w-4xl px-4">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 mb-5">
          <HiOutlineArrowLeft /> Back to jobs
        </Link>

        <div className="card">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <HiOutlineBuildingOffice2 className="text-2xl md:text-3xl text-primary-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg md:text-2xl font-display font-bold text-surface-900 dark:text-white">{job.title}</h1>
                  {job.isUrgent && (
                    <span className="badge bg-danger-100 text-danger-600 text-xs">
                      <HiOutlineFire /> Urgently Hiring
                    </span>
                  )}
                </div>
                <p className="text-surface-500 text-sm md:text-base">{job.company}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 text-xs md:text-sm text-surface-500">
                  <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {job.location}</span>
                  <span className="flex items-center gap-1"><HiOutlineCurrencyRupee /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="flex items-center gap-1"><HiOutlineClock /> {timeAgo(job.createdAt)}</span>
                  <span className="badge-gray text-xs">{job.jobType}</span>
                  <span className="badge-gray text-xs">{job.experienceLevel}</span>
                </div>
              </div>
            </div>
            {isStudent && job.requiredSkills?.length > 0 && (
              <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} size={48} />
            )}
          </div>

          {/* Social proof */}
          {job.applicationCount > 0 && (
            <div className="mt-4 text-xs text-surface-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              {job.applicationCount} people have applied · {job.views} views
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0 mt-6 overflow-x-auto scrollbar-hide border-b border-surface-100 dark:border-surface-800 -mx-6 px-6">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
                }`}>{tab.label}</button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              <div className="mt-5">
                <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-2">About the role</h2>
                <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
              {job.responsibilities?.length > 0 && (
                <div className="mt-5">
                  <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-2">Responsibilities</h2>
                  <ul className="space-y-1.5">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="text-surface-600 dark:text-surface-300 text-sm flex gap-2">
                        <span className="text-primary-500">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.benefits?.length > 0 && (
                <div className="mt-5">
                  <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-2">Benefits</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                      <span key={i} className="badge-green text-xs">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-5">
                <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-2">Required skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills?.map(s => (
                    <span key={s} className={`skill-tag ${match.matched?.includes(s) ? '!bg-accent-400/10 !text-accent-600 !border-accent-300' : ''}`}>{s}</span>
                  ))}
                </div>
              </div>
              {job.niceToHaveSkills?.length > 0 && (
                <div className="mt-4">
                  <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-2">Nice to have</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHaveSkills.map(s => <span key={s} className="badge-gray text-xs">{s}</span>)}
                  </div>
                </div>
              )}
              {isStudent && match.missing?.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-warn-400/10 text-sm text-surface-700 dark:text-surface-300">
                  Missing: <span className="font-semibold">{match.missing.join(', ')}</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'skill-gap'  && (
            user?.role === 'student'
              ? <SkillGapRoadmap jobSkills={job.requiredSkills || []} />
              : <StudentOnlyNotice feature="Skill Gap Roadmap" />
          )}
          {activeTab === 'interview'  && <InterviewPrep jobSkills={job.requiredSkills || []} />}
          {activeTab === 'salary'     && <SalaryPredictor skills={user?.skills || []} />}
          {activeTab === 'ats'        && (
            user?.role === 'student'
              ? <ATSScore jobId={job._id} jobTitle={job.title} />
              : <StudentOnlyNotice feature="ATS Score" />
          )}
          {activeTab === 'ai-resume'  && (
            user?.role === 'student'
              ? <AIResumeAnalyzer jobSkills={job.requiredSkills || []} jobTitle={job.title} />
              : <StudentOnlyNotice feature="AI Resume Analyzer" />
          )}
          {activeTab === 'cover'      && (
            user?.role === 'student'
              ? <CoverLetterGenerator job={job} />
              : <StudentOnlyNotice feature="Cover Letter Generator" />
          )}
          {activeTab === 'reviews'    && <CompanyReviews company={job.company} />}

          {/* Apply button */}
          <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-800">
            {isStudent && (
              applied ? (
                <div className="btn bg-accent-400/15 text-accent-600 w-full justify-center cursor-default">
                  ✓ Application submitted
                </div>
              ) : (
                <>
                  <button onClick={handleApply} disabled={applying} className="btn btn-primary btn-lg w-full justify-center">
                    {applying ? 'Submitting...' : 'Apply Now'}
                  </button>
                  <p className="text-center text-[11px] text-surface-400 mt-2">
                    ⚡ Guaranteed response within 24 hours — strong matches get an instant interview slot.
                  </p>
                </>
              )
            )}

            {isStudent && job.postedBy?._id && (
              <button onClick={handleMessageRecruiter} disabled={messaging}
                className="btn btn-outline w-full justify-center mt-3">
                <HiOutlineChatAlt2 />
                {messaging ? 'Opening chat...' : `Message ${job.postedBy.companyName || job.postedBy.name || 'recruiter'}`}
              </button>
            )}
            {!user && (
              <p className="text-center text-sm text-surface-400">
                <Link to="/login" className="text-primary-600 font-medium">Sign in</Link> to apply.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Friendly explainer shown when a recruiter (or logged-out visitor) opens
 *  one of the student-only tabs, instead of leaving the panel blank. */
function StudentOnlyNotice({ feature }) {
  return (
    <div className="mt-6 p-6 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800 text-center">
      <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
        {feature} is a student-facing feature
      </p>
      <p className="text-xs text-surface-400 mt-1">
        It's meant to help applicants prepare — sign in with a student account to see it in action.
      </p>
    </div>
  )
}

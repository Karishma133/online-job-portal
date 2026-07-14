import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineMail, HiOutlineLocationMarker,
  HiOutlineDocumentText, HiOutlineChatAlt2, HiOutlineVideoCamera, HiOutlineCheck,
} from 'react-icons/hi'
import { jobService } from '../services/jobService'
import api from '../services/api'
import Loader from '../components/common/Loader'
import { showToast } from '../components/common/Toast'
import { timeAgo } from '../utils/helpers'
import { APPLICATION_STATUS } from '../utils/constants'

const STATUS_ACTIONS = [
  { status: 'SHORTLISTED', label: 'Shortlist' },
  { status: 'INTERVIEW',   label: 'Move to Interview' },
  { status: 'HIRED',       label: 'Hire' },
  { status: 'REJECTED',    label: 'Reject' },
]

function matchColor(pct) {
  if (pct >= 75) return 'text-accent-500 border-accent-400/30 bg-accent-400/10'
  if (pct >= 45) return 'text-warn-500 border-warn-400/30 bg-warn-400/10'
  return 'text-surface-400 border-surface-300 bg-surface-100 dark:bg-surface-800 dark:border-surface-700'
}

export default function JobApplicants() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job,          setJob]          = useState(null)
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [updatingId,   setUpdatingId]   = useState(null)
  const [messagingId,  setMessagingId]  = useState(null)

  useEffect(() => {
    Promise.all([jobService.getJobById(id), jobService.getApplicants(id)])
      .then(([jobData, appData]) => {
        setJob(jobData.job)
        setApplications(appData.applications || [])
      })
      .catch((err) => showToast.error(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (appId, status) => {
    setUpdatingId(appId)
    try {
      const data = await api.put(`/applications/${appId}/status`, { status })
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, ...data.application } : a))
      showToast.success(
        status === 'INTERVIEW'
          ? 'Moved to interview — an auto-scheduled slot was set and the candidate was notified.'
          : `Status updated to ${APPLICATION_STATUS[status]?.label || status}.`
      )
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMessage = async (applicantId) => {
    setMessagingId(applicantId)
    try {
      const data = await api.post('/chat', { participantId: applicantId, jobId: id })
      navigate('/chat', { state: { openChatId: data.chat._id } })
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setMessagingId(null)
    }
  }

  if (loading) return <Loader fullscreen label="Loading applicants..." />

  return (
    <div className="section pt-8 pb-14">
      <div className="container-app px-4 max-w-4xl">
        <Link to="/recruiter/dashboard" className="inline-flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
          <HiOutlineArrowLeft /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
          <div>
            <h1 className="page-title text-2xl md:text-3xl">{job?.title}</h1>
            <p className="page-subtitle">{job?.company} · {applications.length} applicant{applications.length !== 1 ? 's' : ''}, ranked by skill match</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-surface-500 font-medium">No applicants yet</p>
            <p className="text-surface-400 text-sm mt-1">Check back once students start applying.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold flex items-center justify-center shrink-0 shadow-sm">
                      {app.applicant?.avatar
                        ? <img src={app.applicant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        : (app.applicant?.name?.[0] || '?')
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-surface-900 dark:text-white">{app.applicant?.name}</p>
                      <p className="text-sm text-surface-400 flex items-center gap-1.5">
                        <HiOutlineMail className="shrink-0" /> {app.applicant?.email}
                      </p>
                      {app.applicant?.location && (
                        <p className="text-sm text-surface-400 flex items-center gap-1.5 mt-0.5">
                          <HiOutlineLocationMarker className="shrink-0" /> {app.applicant.location}
                        </p>
                      )}
                      {app.applicant?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.applicant.skills.slice(0, 6).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full border text-sm font-bold font-mono tnum ${matchColor(app.matchPercent)}`}>
                      {app.matchPercent}% match
                    </span>
                    <span className={APPLICATION_STATUS[app.status]?.color || 'badge-gray'}>
                      {APPLICATION_STATUS[app.status]?.label || app.status}
                    </span>
                    <span className="text-[11px] text-surface-400">Applied {timeAgo(app.createdAt)}</span>
                  </div>
                </div>

                {app.coverNote && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 leading-relaxed">
                    "{app.coverNote}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                  {STATUS_ACTIONS.filter(a => a.status !== app.status).map(({ status, label }) => (
                    <button key={status} disabled={updatingId === app._id}
                      onClick={() => handleStatusChange(app._id, status)}
                      className="btn btn-outline btn-sm disabled:opacity-50">
                      {status === 'INTERVIEW' && <HiOutlineVideoCamera />}
                      {status === 'HIRED' && <HiOutlineCheck />}
                      {label}
                    </button>
                  ))}

                  {app.status === 'INTERVIEW' && (
                    <Link to={`/interview/${app._id}`} className="btn btn-primary btn-sm">
                      <HiOutlineVideoCamera /> Join Interview
                    </Link>
                  )}

                  <button onClick={() => handleMessage(app.applicant._id)} disabled={messagingId === app.applicant._id}
                    className="btn btn-ghost btn-sm disabled:opacity-50">
                    <HiOutlineChatAlt2 /> Message
                  </button>

                  {app.resumeSnapshot && (
                    <a href={app.resumeSnapshot} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      <HiOutlineDocumentText /> Resume
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

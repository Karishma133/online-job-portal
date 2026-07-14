import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlinePlusCircle,
  HiOutlineTrash, HiOutlineEye, HiOutlineChartBar, HiOutlineVideoCamera,
  HiOutlineSparkles, HiCheck, HiOutlineArrowRight,
} from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { capitalize } from '../../utils/helpers'
import { jobService } from '../../services/jobService'
import api from '../../services/api'
import StatsCard from '../../components/dashboard/StatsCard'
import RecruiterProfileCard from '../../components/dashboard/RecruiterProfileCard'
import Loader from '../../components/common/Loader'
import { showToast } from '../../components/common/Toast'
import { timeAgo, formatSalary, formatDate } from '../../utils/helpers'
import AnalyticsDashboard from './AnalyticsDashboard'

const tabs = ['My Jobs', 'Interviews', 'Analytics']

/** Same circular match-ring visual used in the homepage hero's Match Card —
 *  reused here so the "signature" look shows up inside the product too. */
function MatchRing({ percent }) {
  return (
    <div className="relative w-20 h-20 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#4f46e5 ${percent * 3.6}deg, #e2e8f0 ${percent * 3.6}deg)` }}
      />
      <div className="absolute inset-[5px] rounded-full bg-white dark:bg-surface-900 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-lg text-primary-700 dark:text-primary-300 tnum">{percent}%</span>
        <span className="text-[8px] uppercase tracking-wide text-surface-400">match</span>
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs,       setJobs]       = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [loadingInterviews, setLoadingInterviews] = useState(true)
  const [topCandidate, setTopCandidate] = useState(null)
  const [activeTab,  setActiveTab]  = useState('My Jobs')

  useEffect(() => {
    jobService.getMyJobs()
      .then(async (data) => {
        const jobList = data.jobs || []
        setJobs(jobList)

        // Spotlight the single best-matching applicant across active postings —
        // check the first few jobs that actually have applicants, cheapest way
        // to surface this without a dedicated "all applicants" endpoint.
        const candidateJobs = jobList.filter(j => j.applicantCount > 0).slice(0, 3)
        const results = await Promise.all(
          candidateJobs.map(j => jobService.getApplicants(j._id).catch(() => ({ applications: [] })))
        )
        const allApplicants = results.flatMap((r, i) =>
          (r.applications || []).map(a => ({ ...a, jobTitle: candidateJobs[i].title }))
        )
        if (allApplicants.length > 0) {
          const best = allApplicants.reduce((a, b) => (b.matchPercent > a.matchPercent ? b : a))
          setTopCandidate(best)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/applications/upcoming-interviews')
      .then(data => setInterviews(data.applications || []))
      .catch(() => {})
      .finally(() => setLoadingInterviews(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return
    try {
      await jobService.deleteJob(id)
      setJobs(jobs.filter(j => j._id !== id))
      showToast.success('Job deleted')
    } catch (err) { showToast.error(err.message) }
  }

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0)

  return (
    <div className="section pt-8 md:pt-10">
      <div className="container-app px-4">
        
        {/* HERO SECTION: Updated Grid to fill left space */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center mb-12">
          
          {/* LEFT SIDE: Welcome Text + Stats Grid + CTA Buttons */}
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="page-title">Welcome, {capitalize(user?.name?.split(' ')[0] || '')} 👋</h1>
              <p className="page-subtitle">Manage your job postings and applicants</p>
            </div>

            {/* Stats Grid moved inside the left column */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard icon={<HiOutlineBriefcase />}  label="Active jobs"      value={jobs.length}      detail={`${jobs.filter(j => j.isFeatured).length} featured`} color="primary" />
              <StatsCard icon={<HiOutlineUserGroup />}   label="Total applicants" value={totalApplicants}  detail="Across all postings" color="green" />
              <StatsCard icon={<HiOutlineEye />}         label="Total views"      value={jobs.reduce((s, j) => s + (j.views || 0), 0)} detail="Lifetime impressions" color="yellow" />
            </div>

            {/* Quick Actions to balance the layout */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/post-job" className="btn btn-primary flex items-center gap-2">
                <HiOutlinePlusCircle /> Post a job
              </Link>
              <Link to="/profile" className="btn bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white border border-transparent dark:border-surface-700">
                Company Profile
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Profile Card */}
          <div className="flex justify-center lg:justify-end">
            <RecruiterProfileCard user={user} jobCount={jobs.length} applicantCount={totalApplicants} />
          </div>
        </div>

        {topCandidate && (
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 dark:border-primary-900
                          bg-gradient-to-br from-primary-50 via-white to-white dark:from-primary-900/20 dark:via-surface-900 dark:to-surface-900
                          p-5 md:p-6 mb-8 flex items-center gap-5 flex-wrap">
            <div className="absolute inset-0 bg-signature-grid opacity-30 dark:opacity-10 pointer-events-none" />
            <MatchRing percent={topCandidate.matchPercent} />
            <div className="relative flex-1 min-w-[200px]">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
                <HiOutlineSparkles /> Top candidate spotlight
              </span>
              <p className="font-display font-semibold text-lg text-surface-900 dark:text-white">
                {topCandidate.applicant?.name}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                <HiOutlineBuildingOffice2 className="shrink-0" /> Applied to {topCandidate.jobTitle}
              </p>
              {topCandidate.applicant?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {topCandidate.applicant.skills.slice(0, 5).map(s => (
                    <span key={s} className="skill-tag flex items-center gap-1"><HiCheck className="text-[11px]" /> {s}</span>
                  ))}
                </div>
              )}
            </div>
            <Link to={`/jobs/${topCandidate.job || jobs.find(j => j.title === topCandidate.jobTitle)?._id}/applicants`}
              className="relative btn btn-primary btn-sm shrink-0">
              View applicant <HiOutlineArrowRight />
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-200 dark:border-surface-800">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-400'
              }`}>
              {tab === 'Analytics' && <HiOutlineChartBar />}
              {tab === 'Interviews' && <HiOutlineVideoCamera />}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'My Jobs' && (
          <>
            {loading ? <Loader /> : jobs.length === 0 ? (
              <div className="card text-center py-14">
                <p className="text-surface-500 mb-4">You haven't posted any jobs yet.</p>
                <Link to="/post-job" className="btn btn-primary inline-flex">Post your first job</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job._id} className="card flex items-center justify-between flex-wrap gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/jobs/${job._id}`} className="font-semibold text-surface-900 dark:text-white hover:text-primary-600 truncate">
                          {job.title}
                        </Link>
                        {job.isUrgent && <span className="badge bg-danger-100 text-danger-600 text-xs">Urgent</span>}
                        {job.isFeatured && <span className="badge bg-warn-400/20 text-warn-500 text-xs">Featured</span>}
                      </div>
                      <p className="text-sm text-surface-400">
                        {job.location} · {formatSalary(job.salaryMin, job.salaryMax)} · Posted {timeAgo(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge-primary">
                        <HiOutlineUserGroup /> {job.applicantCount || 0} applicants
                      </span>
                      <span className="badge-gray text-xs">
                        <HiOutlineEye className="mr-1" /> {job.views || 0}
                      </span>
                      <Link to={`/jobs/${job._id}/applicants`} className="btn btn-ghost btn-sm hidden md:inline-flex">
                        View applicants
                      </Link>
                      <button onClick={() => handleDelete(job._id)} className="btn-ghost btn btn-sm px-2.5 text-danger-500">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'Interviews' && (
          loadingInterviews ? <Loader /> : interviews.length === 0 ? (
            <div className="card text-center py-14">
              <HiOutlineVideoCamera className="text-3xl text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">No upcoming interviews yet.</p>
              <p className="text-surface-400 text-sm mt-1">Strong-match applicants get auto-scheduled here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map(app => (
                <div key={app._id} className="card flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                      {app.applicant?.name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-surface-900 dark:text-white truncate">{app.applicant?.name}</p>
                      <p className="text-sm text-surface-400 truncate">{app.job?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {app.interviewDate && (
                      <span className="badge-primary text-xs">{formatDate(app.interviewDate, 'dd MMM, hh:mm a')}</span>
                    )}
                    <Link to={`/interview/${app._id}`} className="btn btn-primary btn-sm">
                      <HiOutlineVideoCamera /> Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'Analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  )
}
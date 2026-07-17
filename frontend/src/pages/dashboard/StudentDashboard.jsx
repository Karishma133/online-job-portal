import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTrendingUp,
  HiOutlineSparkles, HiCheck, HiOutlineArrowRight,
} from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'
import { capitalize } from '../../utils/helpers'
import { userService } from '../../services/userService'
import { jobService } from '../../services/jobService'
import StatsCard from '../../components/dashboard/StatsCard'
import StudentProfileCard from '../../components/dashboard/StudentProfileCard'
import ApplicationTracker from '../../components/dashboard/ApplicationTracker'
import RecommendedJobs from '../../components/dashboard/RecommendedJobs'
import LiveJobAlert from '../../components/features/LiveJobAlert'
import ReferralSystem from '../../components/features/ReferralSystem'
import Loader from '../../components/common/Loader'
import { formatSalary } from '../../utils/helpers'

/** Same circular match-ring visual used in the homepage hero and the
 *  recruiter dashboard's Top Candidate card — kept consistent everywhere. */
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

export default function StudentDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [bestMatch, setBestMatch] = useState(null)

  useEffect(() => {
    let mounted = true
    userService.getApplications()
      .then((data) => { if (mounted) setApplications(data.applications || []) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })

    jobService.getRecommended()
      .then((data) => { if (mounted && data.jobs?.length) setBestMatch(data.jobs[0]) })
      .catch(() => {})

    return () => { mounted = false }
  }, [])

  const stats = {
    total:     applications.length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    hired:     applications.filter(a => a.status === 'HIRED').length,
    pending:   applications.filter(a => a.status === 'APPLIED').length,
  }

  return (
    <div className="section pt-4 md:pt-5">
      <div className="container-app">
        
        {/* HERO SECTION: Updated Grid to fill left space */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center mb-6">
          
          {/* LEFT SIDE: Welcome Text + Stats Grid + CTA Buttons */}
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="page-title text-xl md:text-2xl">Welcome back, {capitalize(user?.name?.split(' ')[0] || '')} 👋</h1>
              <p className="page-subtitle text-xs md:text-sm">Here's where things stand with your job search</p>
            </div>

            {/* Stats Grid moved inside the left column */}
            <div className="grid grid-cols-2 gap-3">
              <StatsCard icon={<HiOutlineBriefcase />}  label="Applications" value={stats.total}     color="primary" />
              <StatsCard icon={<HiOutlineClock />}       label="Pending"      value={stats.pending}   color="yellow" />
              <StatsCard icon={<HiOutlineTrendingUp />}   label="Interviews"   value={stats.interview} color="green" />
              <StatsCard icon={<HiOutlineCheckCircle />}  label="Hired"        value={stats.hired}     color="green" />
            </div>

            {/* Quick Actions to balance the layout */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/jobs" className="btn btn-primary btn-sm flex items-center gap-2">
                Explore Jobs <HiOutlineArrowRight />
              </Link>
              <Link to="/profile" className="btn btn-sm bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-white border border-transparent dark:border-surface-700">
                Update Profile
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Profile Card */}
          <div className="flex justify-center lg:justify-end">
            <StudentProfileCard user={user} />
          </div>
        </div>

        {bestMatch && (
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 dark:border-primary-900
                          bg-gradient-to-br from-primary-50 via-white to-white dark:from-primary-900/20 dark:via-surface-900 dark:to-surface-900
                          p-3.5 md:p-4 mb-5 flex items-center gap-4 flex-wrap">
            <div className="absolute inset-0 bg-signature-grid opacity-30 dark:opacity-10 pointer-events-none" />
            <MatchRing percent={bestMatch.matchPercent} />
            <div className="relative flex-1 min-w-[200px]">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
                <HiOutlineSparkles /> Best match for you
              </span>
              <p className="font-display font-semibold text-base text-surface-900 dark:text-white">
                {bestMatch.title}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                <HiOutlineBuildingOffice2 className="shrink-0" /> {bestMatch.company} · {formatSalary(bestMatch.salaryMin, bestMatch.salaryMax)}
              </p>
              {bestMatch.requiredSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {bestMatch.requiredSkills.slice(0, 5).map(s => {
                    const hasSkill = user?.skills?.some(us => us.toLowerCase() === s.toLowerCase())
                    return hasSkill ? (
                      <span key={s} className="skill-tag !bg-accent-400/10 !text-accent-600 !border-accent-400/30 flex items-center gap-1">
                        <HiCheck className="text-[11px]" /> {s}
                      </span>
                    ) : (
                      <span key={s} className="skill-tag !bg-surface-50 !text-surface-400 !border-dashed dark:!bg-surface-800/50">{s}</span>
                    )
                  })}
                </div>
              )}
            </div>
            <Link to={`/jobs/${bestMatch._id}`} className="relative btn btn-primary btn-sm shrink-0">
              View &amp; apply <HiOutlineArrowRight />
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-5">
          <RecommendedJobs />
          <div className="space-y-3">
            <LiveJobAlert />
            <ReferralSystem />
          </div>
        </div>

        <div>
          <h2 className="font-display font-semibold text-lg text-surface-900 dark:text-white mb-2.5">
            Application tracker
          </h2>
          {loading ? <Loader /> : <ApplicationTracker applications={applications} />}
        </div>
      </div>
    </div>
  )
}

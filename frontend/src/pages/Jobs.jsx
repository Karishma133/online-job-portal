import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  HiOutlineSearch, HiOutlineAdjustments, HiOutlineX, HiOutlineEmojiSad,
  HiOutlineLocationMarker, HiOutlineClock, HiOutlineArrowRight, HiBookmark, HiOutlineBookmark,
} from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { useJob } from '../hooks/useJob'
import { useJobSearch } from '../hooks/useJobSearch'
import { useAuth } from '../hooks/useAuth'
import { useSkillMatch } from '../hooks/useSkillMatch'
import JobFilter from '../components/job/JobFilter'
import SkillMatchBadge from '../components/job/SkillMatchBadge'
import { JobRowSkeletonList } from '../components/common/Skeleton'
import { timeAgo, formatSalary, truncate } from '../utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

/** Compact row for the left-hand scrollable list. */
function JobListRow({ job, active, onClick }) {
  const { user } = useAuth()
  const { toggleSave, isJobSaved } = useJob()
  const match = useSkillMatch(job.requiredSkills)
  const saved = isJobSaved(job._id)

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 group relative
        ${active
          ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/20 dark:border-primary-700'
          : 'bg-white border-surface-100 hover:border-primary-200 dark:bg-surface-900 dark:border-surface-800 dark:hover:border-primary-800'}`}
    >
      {user?.role === 'student' && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(job._id) }}
          className="absolute top-3 right-3 text-surface-300 hover:text-primary-500 transition-colors z-10"
          aria-label="Save job"
        >
          {saved ? <HiBookmark className="text-primary-600" /> : <HiOutlineBookmark />}
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 overflow-hidden">
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
            : <HiOutlineBuildingOffice2 className="text-lg text-primary-500" />}
        </div>
        <div className="min-w-0 pr-5">
          <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {job.title}
          </h3>
          <p className="text-xs text-surface-400">{job.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-[11px] text-surface-400">
        <span className="flex items-center gap-1"><HiOutlineLocationMarker /> {job.location}</span>
        <span className="flex items-center gap-1"><HiOutlineClock /> {timeAgo(job.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs font-semibold text-surface-700 dark:text-surface-200">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        {user?.role === 'student' && job.requiredSkills?.length > 0 && (
          <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} />
        )}
      </div>
    </div>
  )
}

/** Sticky right-hand detail pane for the currently selected job. */
function JobDetailPane({ job }) {
  const { user } = useAuth()
  const match = useSkillMatch(job?.requiredSkills)

  if (!job) {
    return (
      <div className="card h-full flex items-center justify-center text-center py-24">
        <p className="text-surface-400 text-sm">Select a job from the list to see full details here.</p>
      </div>
    )
  }

  return (
    <motion.div
      key={job._id}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="card h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-surface-100 dark:border-surface-800">
        <div className="min-w-0">
          <span className="badge-green text-[11px]">Verified listing</span>
          <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mt-3">{job.title}</h2>
          <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mt-1">
            {job.company} · {job.location}
          </p>
        </div>
        {user?.role === 'student' && job.requiredSkills?.length > 0 && (
          <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} />
        )}
      </div>

      <div className="mt-6 space-y-6 flex-1">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Role overview</h4>
          <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
            {truncate(job.description, 320)}
          </p>
        </div>

        {job.requiredSkills?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Required skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-surface-400">Salary</p>
            <p className="font-semibold text-surface-800 dark:text-surface-100">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          </div>
          <div>
            <p className="text-xs text-surface-400">Type</p>
            <p className="font-semibold text-surface-800 dark:text-surface-100">{job.jobType}</p>
          </div>
          <div>
            <p className="text-xs text-surface-400">Posted</p>
            <p className="font-semibold text-surface-800 dark:text-surface-100">{timeAgo(job.createdAt)}</p>
          </div>
        </div>
      </div>

      <Link to={`/jobs/${job._id}`} className="btn btn-primary justify-center mt-6">
        View full details & apply <HiOutlineArrowRight />
      </Link>
      <p className="text-center text-[11px] text-surface-400 mt-2">
        ⚡ Guaranteed response within 24 hours
      </p>
    </motion.div>
  )
}

export default function Jobs() {
  const [searchParams] = useSearchParams()
  const { filters, updateFilter } = useJob()
  const { jobs, loading, error, total, page, setPage } = useJobSearch(filters)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  // Pick up ?keyword= & ?location= coming from the homepage search bar
  useEffect(() => {
    const kw = searchParams.get('keyword')
    const loc = searchParams.get('location')
    if (kw) updateFilter('keyword', kw)
    if (loc) updateFilter('location', loc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the detail pane in sync with whichever job is first in the list
  useEffect(() => {
    if (jobs.length > 0 && !jobs.some(j => j._id === selectedJob?._id)) {
      setSelectedJob(jobs[0])
    }
    if (jobs.length === 0) setSelectedJob(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs])

  const totalPages = Math.ceil(total / 10) || 1

  return (
    <div className="section pt-8 md:pt-10 pb-10">
      <div className="container-app px-4">
        <div className="mb-6 md:mb-8 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title text-2xl md:text-3xl">Browse jobs</h1>
            <p className="page-subtitle text-sm md:text-base">{total} open roles matching your search</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-6 p-1.5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 shadow-card">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
            <input
              type="text"
              className="w-full pl-11 py-2.5 bg-transparent text-sm outline-none text-surface-800 dark:text-surface-100 placeholder-surface-400"
              placeholder="Search by job title, company..."
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilter(v => !v)}
            className="md:hidden btn btn-outline px-3 py-2.5 relative"
          >
            <HiOutlineAdjustments className="text-xl" />
            {Object.values(filters).some(v => Array.isArray(v) ? v.length : v && v !== 'newest') && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden mb-6 overflow-hidden"
            >
              <div className="relative">
                <button onClick={() => setShowFilter(false)} className="absolute top-4 right-4 z-10 text-surface-400 hover:text-surface-600">
                  <HiOutlineX className="text-xl" />
                </button>
                <JobFilter />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1.2fr] gap-6">
          {/* Filters */}
          <div className="hidden lg:block">
            <JobFilter />
          </div>

          {/* Scrollable list */}
          <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1 space-y-3">
            {loading && <JobRowSkeletonList count={6} />}

            {error && <div className="card text-center py-12 text-danger-500 text-sm">{error}</div>}

            {!loading && !error && jobs.length === 0 && (
              <div className="card text-center py-16">
                <HiOutlineEmojiSad className="text-4xl text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500 font-medium">No jobs match your filters</p>
                <p className="text-surface-400 text-sm mt-1">Try widening your search criteria</p>
              </div>
            )}

            {!loading && !error && jobs.map((job) => (
              <JobListRow
                key={job._id}
                job={job}
                active={selectedJob?._id === job._id}
                onClick={() => setSelectedJob(job)}
              />
            ))}

            {!loading && !error && jobs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="btn btn-ghost btn-sm disabled:opacity-30">Previous</button>
                <span className="text-sm text-surface-500 px-3">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="btn btn-ghost btn-sm disabled:opacity-30">Next</button>
              </div>
            )}
          </div>

          {/* Detail pane */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-220px)]">
            <JobDetailPane job={selectedJob} />
          </div>
        </div>
      </div>
    </div>
  )
}

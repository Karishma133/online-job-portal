import { Link } from 'react-router-dom'
import { HiOutlineLocationMarker, HiOutlineClock, HiBookmark, HiOutlineBookmark } from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import SkillMatchBadge from './SkillMatchBadge'
import { useSkillMatch } from '../../hooks/useSkillMatch'
import { useAuth } from '../../hooks/useAuth'
import { useJob } from '../../hooks/useJob'
import { timeAgo, formatSalary, truncate } from '../../utils/helpers'

export default function JobCard({ job }) {
  const { user } = useAuth()
  const { toggleSave, isJobSaved } = useJob()
  const match = useSkillMatch(job.requiredSkills)
  const saved = isJobSaved(job._id)

  return (
    <div className="card-hover group relative">
      {/* Save button */}
      {user?.role === 'student' && (
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(job._id) }}
          className="absolute top-5 right-5 text-xl text-surface-300 hover:text-primary-500 transition-colors z-10"
          aria-label="Save job"
        >
          {saved ? <HiBookmark className="text-primary-600" /> : <HiOutlineBookmark />}
        </button>
      )}

      <Link to={`/jobs/${job._id}`} className="block">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 overflow-hidden">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              : <HiOutlineBuildingOffice2 className="text-2xl text-primary-500 dark:text-primary-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate pr-6">
              {job.title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">{job.company}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-surface-400">
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineClock /> {timeAgo(job.createdAt)}
              </span>
              <span className="badge-gray">{job.jobType}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-surface-500 dark:text-surface-400 mt-4 leading-relaxed">
          {truncate(job.description, 110)}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.requiredSkills?.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {job.requiredSkills?.length > 4 && (
            <span className="skill-tag bg-surface-100 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-100 dark:border-surface-800">
          <span className="text-sm font-semibold text-surface-800 dark:text-surface-100">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>

          {user?.role === 'student' && job.requiredSkills?.length > 0 && (
            <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} />
          )}
        </div>
      </Link>
    </div>
  )
}

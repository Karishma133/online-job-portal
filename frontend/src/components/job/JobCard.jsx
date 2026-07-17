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
    <div className="card-hover group relative p-4"> {/* Explicit padding p-4 for compact look */}
      {/* Save button */}
      {user?.role === 'student' && (
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(job._id) }}
          className="absolute top-4 right-4 text-lg text-surface-300 hover:text-primary-500 transition-colors z-10"
          aria-label="Save job"
        >
          {saved ? <HiBookmark className="text-primary-600" /> : <HiOutlineBookmark />}
        </button>
      )}

      <Link to={`/jobs/${job._id}`} className="block">
        <div className="flex items-start gap-3"> {/* Gap reduced from 4 to 3 */}
          {/* Logo Size reduced to w-10 h-10 */}
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 overflow-hidden">
            {job.companyLogo
              ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              : <HiOutlineBuildingOffice2 className="text-xl text-primary-500 dark:text-primary-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {/* Title size adjusted */}
            <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate pr-6">
              {job.title}
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">{job.company}</p>

            {/* Meta info tags made smaller and tighter */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-surface-400">
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineClock /> {timeAgo(job.createdAt)}
              </span>
              <span className="badge-gray px-1.5 py-0.5 text-[10px]">{job.jobType}</span>
            </div>
          </div>
        </div>

        {/* Description height reduced: smaller text, tighter line-height, truncated to 80 chars */}
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-2.5 leading-snug">
          {truncate(job.description, 80)} 
        </p>

        {/* Skills gap reduced, showing max 3 skills now */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {job.requiredSkills?.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-tag text-[10px] px-1.5 py-0.5">{skill}</span>
          ))}
          {job.requiredSkills?.length > 3 && (
            <span className="skill-tag bg-surface-100 text-[10px] px-1.5 py-0.5 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700">
              +{job.requiredSkills.length - 3}
            </span>
          )}
        </div>

        {/* Footer padding and margin reduced */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          <span className="text-xs font-semibold text-surface-800 dark:text-surface-100">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>

          {user?.role === 'student' && job.requiredSkills?.length > 0 && (
            <div className="scale-90 origin-right">
              <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} />
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

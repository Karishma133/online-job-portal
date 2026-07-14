import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineX, HiOutlineLocationMarker, HiOutlineCurrencyRupee } from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import SkillMatchBadge from './SkillMatchBadge'
import { useSkillMatch } from '../../hooks/useSkillMatch'
import { useAuth } from '../../hooks/useAuth'
import { formatSalary, timeAgo } from '../../utils/helpers'
import { showToast } from '../common/Toast'
import { userService } from '../../services/userService'

export default function JobDetailModal({ job, onClose }) {
  const { user } = useAuth()
  const match = useSkillMatch(job?.requiredSkills || [])

  if (!job) return null

  const handleApply = async () => {
    try {
      await userService.applyToJob(job._id)
      showToast.success('Application submitted!')
      onClose()
    } catch (err) {
      showToast.error(err.message)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 relative"
        >
          <button onClick={onClose} className="absolute top-5 right-5 text-surface-400 hover:text-surface-700">
            <HiOutlineX className="text-xl" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              {job.companyLogo
                ? <img src={job.companyLogo} alt="" className="w-full h-full rounded-xl object-cover" />
                : <HiOutlineBuildingOffice2 className="text-2xl text-primary-500" />
              }
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-surface-900">{job.title}</h2>
              <p className="text-surface-500 text-sm">{job.company} · {timeAgo(job.createdAt)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5 text-sm text-surface-500">
            <span className="flex items-center gap-1.5"><HiOutlineLocationMarker /> {job.location}</span>
            <span className="flex items-center gap-1.5"><HiOutlineCurrencyRupee /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
            <span className="badge-gray">{job.jobType}</span>
          </div>

          {user?.role === 'student' && job.requiredSkills?.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-surface-50 flex items-center justify-between flex-wrap gap-3">
              <SkillMatchBadge percent={match.percent} label={match.label} color={match.color} size={52} />
              {match.missing.length > 0 && (
                <p className="text-xs text-surface-500">
                  Missing: <span className="font-medium text-surface-700">{match.missing.join(', ')}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-surface-800 mb-2">About the role</h3>
            <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-surface-800 mb-2">Required skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((s) => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>

          {user?.role === 'student' && (
            <button onClick={handleApply} className="btn btn-primary w-full justify-center mt-7">
              Apply Now
            </button>
          )}
          {!user && (
            <p className="text-center text-sm text-surface-400 mt-7">
              Please <a href="/login" className="text-primary-600 font-medium">sign in</a> to apply.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePencilAlt, HiOutlineGlobeAlt, HiOutlineBriefcase } from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { getInitials, truncate, capitalize } from '../../utils/helpers'

/**
 * Recruiter/company profile snapshot for the dashboard — same signature look
 * as the homepage's MatchCard (rounded photo + floating widgets over it),
 * just with a different photo and company-specific content.
 */
export default function RecruiterProfileCard({ user, jobCount = 0, applicantCount = 0 }) {
  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-[230px] mx-auto lg:mx-0"
    >
      <div className="rounded-3xl overflow-hidden shadow-elevated border border-surface-100 dark:border-surface-800 aspect-[4/5]">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?fm=jpg&q=70&w=900&auto=format&fit=crop"
          alt="Recruiter workspace"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Edit profile shortcut, pinned to the photo */}
      <Link
        to="/profile"
        className="btn btn-primary btn-sm !px-2.5 !py-1 !text-xs absolute top-3 right-3 shadow-elevated"
      >
        <HiOutlinePencilAlt /> Edit
      </Link>

      {/* Floating company identity card, anchored bottom-left over the photo */}
      <div className="card !p-3 absolute -bottom-4 -left-4 w-[200px] shadow-elevated border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0">
            {user?.companyLogo
              ? <img src={user.companyLogo} alt="" className="w-full h-full object-cover" />
              : getInitials(user?.companyName || user?.name)
            }
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-xs text-surface-900 dark:text-white leading-tight truncate">
              {capitalize(user?.companyName || user?.name || '')}
            </p>
            <p className="text-[10px] text-surface-400 truncate flex items-center gap-1">
              <HiOutlineGlobeAlt className="shrink-0" /> {truncate(user?.companyWebsite, 18) || 'Add company website'}
            </p>
          </div>
        </div>
        <span className="skill-tag !text-[9px] !py-0.5 flex items-center gap-1 w-fit">
          <HiOutlineBuildingOffice2 className="text-[10px]" /> {user?.companyName ? 'Verified recruiter' : 'Complete company info'}
        </span>
      </div>

      {/* Small floating stats chip, top-left */}
      <div className="card !p-2.5 !rounded-xl absolute -top-4 left-4 flex items-center gap-2 shadow-elevated border-surface-100 dark:border-surface-800">
        <span className="w-6 h-6 rounded-full bg-primary-400/15 text-primary-600 flex items-center justify-center text-xs shrink-0">
          <HiOutlineBriefcase />
        </span>
        <div className="pr-1">
          <p className="text-[11px] font-semibold text-surface-900 dark:text-white leading-none whitespace-nowrap">
            {jobCount} active {jobCount === 1 ? 'job' : 'jobs'}
          </p>
          <p className="text-[9px] text-surface-400 mt-0.5">
            {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'} so far
          </p>
        </div>
      </div>
    </motion.div>
  )
}

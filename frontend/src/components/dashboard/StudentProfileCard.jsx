import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePencilAlt, HiCheck, HiOutlineLocationMarker, HiOutlineDocumentText } from 'react-icons/hi'
import { getInitials, truncate, capitalize } from '../../utils/helpers'

/**
 * Student's profile snapshot for the dashboard — same signature look as the
 * homepage's MatchCard (rounded photo + floating widgets over it), just with
 * a different photo and profile-specific content instead of a job match.
 */
export default function StudentProfileCard({ user }) {
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
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=jpg&q=70&w=900&auto=format&fit=crop"
          alt="Student profile"
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

      {/* Floating identity card, anchored bottom-left over the photo */}
      <div className="card !p-3 absolute -bottom-4 -left-4 w-[200px] shadow-elevated border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : getInitials(user?.name)
            }
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-xs text-surface-900 dark:text-white leading-tight truncate">
              {capitalize(user?.name || '')}
            </p>
            <p className="text-[10px] text-surface-400 truncate">
              {truncate(user?.headline, 24) || 'Add a headline'}
            </p>
          </div>
        </div>
        {user?.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 3).map((s) => (
              <span key={s} className="skill-tag !text-[9px] !py-0.5 flex items-center gap-1">
                <HiCheck className="text-[10px]" /> {s}
              </span>
            ))}
          </div>
        ) : (
          <Link to="/profile" className="text-[10px] text-primary-600 font-medium">
            + Add your skills
          </Link>
        )}
      </div>

      {/* Small floating location / resume chip, top-left */}
      <div className="card !p-2.5 !rounded-xl absolute -top-4 left-4 flex items-center gap-2 shadow-elevated border-surface-100 dark:border-surface-800">
        <span className="w-6 h-6 rounded-full bg-primary-400/15 text-primary-600 flex items-center justify-center text-xs shrink-0">
          {user?.resume ? <HiOutlineDocumentText /> : <HiOutlineLocationMarker />}
        </span>
        <div className="pr-1">
          <p className="text-[11px] font-semibold text-surface-900 dark:text-white leading-none whitespace-nowrap">
            {user?.resume ? 'Resume uploaded' : (user?.location || 'Add location')}
          </p>
          <p className="text-[9px] text-surface-400 mt-0.5">
            {user?.resume ? 'Ready to apply' : 'Complete your profile'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

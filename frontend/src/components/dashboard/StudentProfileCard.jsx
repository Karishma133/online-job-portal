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
      className="relative w-full max-w-[380px] mx-auto lg:mx-0"
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
        className="btn btn-primary btn-sm !px-3 !py-1.5 absolute top-4 right-4 shadow-elevated"
      >
        <HiOutlinePencilAlt /> Edit
      </Link>

      {/* Floating identity card, anchored bottom-left over the photo */}
      <div className="card !p-4 absolute -bottom-6 -left-6 w-[250px] shadow-elevated border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : getInitials(user?.name)
            }
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-surface-900 dark:text-white leading-tight truncate">
              {capitalize(user?.name || '')}
            </p>
            <p className="text-[11px] text-surface-400 truncate">
              {truncate(user?.headline, 28) || 'Add a headline'}
            </p>
          </div>
        </div>
        {user?.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 3).map((s) => (
              <span key={s} className="skill-tag !text-[10px] !py-0.5 flex items-center gap-1">
                <HiCheck className="text-[11px]" /> {s}
              </span>
            ))}
          </div>
        ) : (
          <Link to="/profile" className="text-[11px] text-primary-600 font-medium">
            + Add your skills
          </Link>
        )}
      </div>

      {/* Small floating location / resume chip, top-left */}
      <div className="card !p-3 !rounded-xl absolute -top-5 left-5 flex items-center gap-2 shadow-elevated border-surface-100 dark:border-surface-800">
        <span className="w-7 h-7 rounded-full bg-primary-400/15 text-primary-600 flex items-center justify-center text-sm shrink-0">
          {user?.resume ? <HiOutlineDocumentText /> : <HiOutlineLocationMarker />}
        </span>
        <div className="pr-1">
          <p className="text-xs font-semibold text-surface-900 dark:text-white leading-none whitespace-nowrap">
            {user?.resume ? 'Resume uploaded' : (user?.location || 'Add location')}
          </p>
          <p className="text-[10px] text-surface-400 mt-0.5">
            {user?.resume ? 'Ready to apply' : 'Complete your profile'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

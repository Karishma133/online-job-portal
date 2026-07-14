import { Link } from 'react-router-dom'
import { HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineLightningBolt, HiOutlineVideoCamera } from 'react-icons/hi'
import { timeAgo, formatDate } from '../../utils/helpers'

const columns = [
  { key: 'APPLIED',     title: 'Applied' },
  { key: 'SHORTLISTED', title: 'Shortlisted' },
  { key: 'INTERVIEW',   title: 'Interview' },
  { key: 'HIRED',       title: 'Hired' },
  { key: 'REJECTED',    title: 'Rejected' },
]

/**
 * Kanban-style board for a student's job applications.
 * applications: [{ _id, job: {...}, status, createdAt }]
 */
export default function ApplicationTracker({ applications = [] }) {
  const grouped = columns.reduce((acc, col) => {
    acc[col.key] = applications.filter(app => app.status === col.key)
    return acc
  }, {})

  if (!applications.length) {
    return (
      <div className="card text-center py-12">
        <p className="text-surface-400 text-sm">
          You haven't applied to any jobs yet. <Link to="/jobs" className="text-primary-600 font-medium">Browse jobs →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-5">
        {columns.map(({ key, title }) => (
          <div key={key} className="w-64 md:w-auto shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-sm font-semibold text-surface-700">{title}</h4>
              <span className="badge-gray">{grouped[key].length}</span>
            </div>

            <div className="space-y-3">
              {grouped[key].map((app) => (
                <Link
                  key={app._id}
                  to={`/jobs/${app.job?._id}`}
                  className="block card p-4 hover:shadow-card-hover transition-shadow"
                >
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{app.job?.title}</p>
                  <p className="text-xs text-surface-400 mb-2">{app.job?.company}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-surface-400 flex items-center gap-1">
                      <HiOutlineLocationMarker /> {app.job?.location}
                    </span>
                  </div>

                  {app.status === 'INTERVIEW' && app.interviewDate && (
                    <div className="mt-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg px-2 py-1.5">
                      <span className="text-[11px] font-medium text-primary-700 dark:text-primary-300 flex items-center gap-1">
                        <HiOutlineCalendar /> {formatDate(app.interviewDate, 'dd MMM, hh:mm a')} · {app.interviewMode}
                      </span>
                    </div>
                  )}

                  {app.status === 'INTERVIEW' && (
                    <Link to={`/interview/${app._id}`}
                      className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white
                                bg-gradient-to-b from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500
                                rounded-lg px-2 py-1.5 transition-all">
                      <HiOutlineVideoCamera /> Join Live Interview
                    </Link>
                  )}

                  {app.autoResponded && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-accent-600 bg-accent-400/10 px-2 py-0.5 rounded-full">
                      <HiOutlineLightningBolt /> Auto-response
                    </span>
                  )}

                  <p className="text-[11px] text-surface-300 mt-2">{timeAgo(app.createdAt)}</p>
                </Link>
              ))}

              {grouped[key].length === 0 && (
                <div className="border border-dashed border-surface-200 rounded-xl py-6 text-center">
                  <span className="text-xs text-surface-300">Empty</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

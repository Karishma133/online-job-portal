import { HiCheckCircle, HiOutlineCheckCircle } from 'react-icons/hi'

const checklist = [
  { key: 'avatar',   label: 'Profile photo' },
  { key: 'bio',      label: 'Short bio' },
  { key: 'skills',   label: 'Skills added' },
  { key: 'resume',   label: 'Resume uploaded' },
  { key: 'location', label: 'Location set' },
]

export default function ProfileCompletion({ user }) {
  const completed = checklist.filter(({ key }) => {
    const val = user?.[key]
    return Array.isArray(val) ? val.length > 0 : Boolean(val)
  })

  const percent = Math.round((completed.length / checklist.length) * 100)
  const isComplete = percent === 100

  return (
    <div className="card !p-4">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-display font-semibold text-surface-900 text-sm">Profile strength</h3>
        <span className={`text-sm font-bold ${isComplete ? 'text-accent-600' : 'text-primary-600'}`}>
          {percent}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-accent-500' : 'bg-primary-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {checklist.map(({ key, label }) => {
          const val = user?.[key]
          const done = Array.isArray(val) ? val.length > 0 : Boolean(val)
          return (
            <li key={key} className="flex items-center gap-2 text-xs">
              {done
                ? <HiCheckCircle className="text-accent-500 text-base shrink-0" />
                : <HiOutlineCheckCircle className="text-surface-300 text-base shrink-0" />
              }
              <span className={done ? 'text-surface-600' : 'text-surface-400'}>{label}</span>
            </li>
          )
        })}
      </ul>

      {!isComplete && (
        <p className="text-[11px] text-surface-400 mt-2.5 pt-2.5 border-t border-surface-100">
          Complete your profile to get better job matches and stand out to recruiters.
        </p>
      )}
    </div>
  )
}

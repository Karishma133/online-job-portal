import { HiOutlineSparkles } from 'react-icons/hi'

const colorMap = {
  green:  { ring: 'stroke-accent-500',  text: 'text-accent-600',  bg: 'bg-accent-400/10' },
  yellow: { ring: 'stroke-warn-500',    text: 'text-warn-500',    bg: 'bg-warn-400/10' },
  orange: { ring: 'stroke-orange-500',  text: 'text-orange-500',  bg: 'bg-orange-400/10' },
  red:    { ring: 'stroke-danger-500',  text: 'text-danger-500',  bg: 'bg-danger-400/10' },
}

/**
 * Circular progress badge showing % skill match between student and a job.
 * Pass { percent, label, color } from useSkillMatch / calculateSkillMatch.
 */
export default function SkillMatchBadge({ percent, label, color = 'green', size = 44 }) {
  const c = colorMap[color] || colorMap.green
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            className="stroke-surface-100" strokeWidth="4" fill="none"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            className={`${c.ring} transition-all duration-700 ease-out`}
            strokeWidth="4" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${c.text}`}>
          {percent}%
        </span>
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.text}`}>
        <HiOutlineSparkles className="text-sm" />
        {label}
      </div>
    </div>
  )
}

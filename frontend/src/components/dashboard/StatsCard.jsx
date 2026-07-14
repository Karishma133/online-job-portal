export default function StatsCard({ icon, label, value, detail, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-900/30 dark:border-primary-800',
    green:   'bg-accent-400/10 text-accent-600 border-accent-400/20',
    yellow:  'bg-warn-400/10 text-warn-500 border-warn-400/20',
    red:     'bg-danger-400/10 text-danger-500 border-danger-400/20',
  }

  return (
    <div className="card flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">{label}</span>
        <p className="text-3xl font-display font-bold text-surface-900 dark:text-white mt-1.5 tnum font-mono">{value}</p>
        {detail && <p className="text-xs text-surface-400 mt-1">{detail}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  )
}

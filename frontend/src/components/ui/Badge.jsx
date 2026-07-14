/**
 * Shared Badge component — small pill labels used for skills, statuses,
 * and job tags throughout the app.
 *
 * Usage:
 *   <Badge>React</Badge>                    // default skill-tag style
 *   <Badge color="green">Hired</Badge>
 *   <Badge color="red">Rejected</Badge>
 *   <Badge color="yellow">Pending</Badge>
 */
export default function Badge({ children, color = 'primary', className = '', ...props }) {
  const colorClass = {
    primary: 'badge-primary',
    green:   'badge-green',
    yellow:  'badge-yellow',
    red:     'badge-red',
    gray:    'badge-gray',
    skill:   'skill-tag',
  }[color] || 'badge-primary'

  return (
    <span className={`${colorClass} ${className}`} {...props}>
      {children}
    </span>
  )
}

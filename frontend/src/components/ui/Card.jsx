/**
 * Shared Card component — the base wrapper used by job cards, dashboard
 * widgets, stat tiles, and anything else that needs the app's consistent
 * "card" look (rounded corners, border, shadow, dark mode support).
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card hover>...</Card>                 // adds hover lift, for clickable cards
 *   <Card padding="none">...</Card>         // opt out of default padding (e.g. for image cards)
 */
export default function Card({ children, hover = false, padding = 'default', className = '', ...props }) {
  const base = hover ? 'card-hover' : 'card'
  const paddingClass = padding === 'none' ? '!p-0' : ''

  return (
    <div className={`${base} ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

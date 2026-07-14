/**
 * Shared Button component.
 * ---------------------------------------------------------------------------
 * This wraps the same classes already defined in index.css (.btn, .btn-primary,
 * etc.) so every button in the app stays visually identical automatically —
 * change the look once here (or in index.css) and it updates everywhere.
 *
 * Usage:
 *   <Button>Default</Button>
 *   <Button variant="outline" size="sm">Cancel</Button>
 *   <Button variant="primary" size="lg" icon={<HiArrowRight />}>Get matched</Button>
 *   <Button as={Link} to="/jobs" variant="outline">Browse jobs</Button>
 */
export default function Button({
  children,
  variant = 'primary',   // 'primary' | 'outline' | 'ghost' | 'danger'
  size,                  // undefined (default) | 'sm' | 'lg'
  icon,
  iconPosition = 'right',
  className = '',
  as: Component = 'button',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
  }[variant] || 'btn-primary'

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''

  return (
    <Component className={`${variantClass} ${sizeClass} ${className}`} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </Component>
  )
}

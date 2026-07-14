export default function Loader({ fullscreen = false, size = 'md', label }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-9 h-9 border-[3px]', lg: 'w-14 h-14 border-4' }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
      />
      {label && <p className="text-sm text-surface-400">{label}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-10">{spinner}</div>
}

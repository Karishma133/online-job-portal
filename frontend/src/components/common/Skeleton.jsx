/** Animated placeholder shown while job results are loading, instead of a
 *  blank spinner — gives the page a sense of its final layout immediately. */
export function JobRowSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/5 rounded bg-surface-100 dark:bg-surface-800" />
          <div className="h-3 w-2/5 rounded bg-surface-100 dark:bg-surface-800" />
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <div className="h-2.5 w-16 rounded bg-surface-100 dark:bg-surface-800" />
        <div className="h-2.5 w-14 rounded bg-surface-100 dark:bg-surface-800" />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="h-3 w-20 rounded bg-surface-100 dark:bg-surface-800" />
        <div className="h-5 w-14 rounded-full bg-surface-100 dark:bg-surface-800" />
      </div>
    </div>
  )
}

export function JobRowSkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <JobRowSkeleton key={i} />)}
    </div>
  )
}

/** Card-grid variant, for places using the bigger JobCard layout (dashboard
 *  "Recommended for you", etc.) */
export function JobCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-surface-100 dark:bg-surface-800" />
          <div className="h-3 w-2/5 rounded bg-surface-100 dark:bg-surface-800" />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 w-full rounded bg-surface-100 dark:bg-surface-800" />
        <div className="h-3 w-4/5 rounded bg-surface-100 dark:bg-surface-800" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 rounded-lg bg-surface-100 dark:bg-surface-800" />
        <div className="h-6 w-16 rounded-lg bg-surface-100 dark:bg-surface-800" />
      </div>
    </div>
  )
}

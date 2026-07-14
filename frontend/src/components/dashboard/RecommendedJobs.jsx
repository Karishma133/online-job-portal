import { useEffect, useState } from 'react'
import { HiOutlineSparkles } from 'react-icons/hi'
import { jobService } from '../../services/jobService'
import JobCard from '../job/JobCard'
import { JobCardSkeleton } from '../common/Skeleton'

export default function RecommendedJobs() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    jobService.getRecommended()
      .then((data) => { if (mounted) setJobs(data.jobs) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineSparkles className="text-primary-500 text-lg" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">Recommended for you</h3>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <JobCardSkeleton /><JobCardSkeleton />
        </div>
      ) : !jobs.length ? (
        <div className="card text-center py-10">
          <HiOutlineSparkles className="text-3xl text-primary-300 mx-auto mb-2" />
          <p className="text-surface-400 text-sm">
            Add more skills to your profile to unlock personalized recommendations.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  )
}

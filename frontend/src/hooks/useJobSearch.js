import { useState, useEffect, useCallback } from 'react'
import { jobService } from '../services/jobService'

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useJobSearch(filters) {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)

  const debouncedKeyword = useDebounce(filters.keyword)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { ...filters, keyword: debouncedKeyword, page }
      const data = await jobService.getJobs(params)
      setJobs(data.jobs)
      setTotal(data.total)
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }, [filters, debouncedKeyword, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [filters])

  return { jobs, loading, error, total, page, setPage, refetch: fetchJobs }
}

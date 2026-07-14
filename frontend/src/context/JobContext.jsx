import { createContext, useState, useCallback } from 'react'

export const JobContext = createContext(null)

const defaultFilters = {
  keyword:    '',
  skills:     [],
  location:   '',
  jobType:    '',
  salary:     '',
  category:   '',
  sortBy:     'newest',
}

export function JobProvider({ children }) {
  const [filters,    setFilters]    = useState(defaultFilters)
  const [savedJobs,  setSavedJobs]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('sm_saved') || '[]') }
    catch { return [] }
  })

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const toggleSave = useCallback((jobId) => {
    setSavedJobs(prev => {
      const next = prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
      localStorage.setItem('sm_saved', JSON.stringify(next))
      return next
    })
  }, [])

  const isJobSaved = useCallback((jobId) => savedJobs.includes(jobId), [savedJobs])

  return (
    <JobContext.Provider value={{ filters, updateFilter, resetFilters, savedJobs, toggleSave, isJobSaved }}>
      {children}
    </JobContext.Provider>
  )
}

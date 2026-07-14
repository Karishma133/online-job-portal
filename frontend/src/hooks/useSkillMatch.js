import { useMemo } from 'react'
import { calculateSkillMatch } from '../utils/skillMatcher'
import { useAuth } from './useAuth'

/**
 * Returns match info for a single job against the logged-in student's skills.
 * { percent, matched, missing, label, color }
 */
export function useSkillMatch(jobSkills = []) {
  const { user } = useAuth()
  const userSkills = user?.skills || []

  return useMemo(() => calculateSkillMatch(userSkills, jobSkills), [userSkills, jobSkills])
}

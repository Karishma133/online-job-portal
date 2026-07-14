/**
 * Core Skill Match Engine (backend mirror of frontend's skillMatcher.js)
 * Keep this logic in sync with frontend/src/utils/skillMatcher.js
 */

const normalize = (s) => String(s).toLowerCase().trim()

export function calculateMatch(userSkills = [], jobSkills = []) {
  if (!jobSkills.length) {
    return { percent: 100, matched: [], missing: [], label: 'Open' }
  }
  if (!userSkills.length) {
    return { percent: 0, matched: [], missing: jobSkills, label: 'No match' }
  }

  const normalizedUser = userSkills.map(normalize)
  const matched = jobSkills.filter((s) => normalizedUser.includes(normalize(s)))
  const missing = jobSkills.filter((s) => !normalizedUser.includes(normalize(s)))

  const percent = Math.round((matched.length / jobSkills.length) * 100)

  let label
  if (percent >= 80) label = 'Great match'
  else if (percent >= 50) label = 'Good match'
  else if (percent >= 20) label = 'Partial'
  else label = 'Low match'

  return { percent, matched, missing, label }
}

/**
 * Rank a list of jobs by match % for a given user's skills.
 * Returns jobs with an attached `matchPercent` field, sorted descending.
 */
export function rankJobsBySkillMatch(jobs = [], userSkills = []) {
  return jobs
    .map((job) => {
      const jobObj = job.toObject ? job.toObject() : job
      const { percent } = calculateMatch(userSkills, jobObj.requiredSkills || [])
      return { ...jobObj, matchPercent: percent }
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
}

/**
 * Filter out jobs below a minimum match threshold (used for recommendations).
 */
export function filterByMinMatch(jobs = [], userSkills = [], minPercent = 20) {
  return rankJobsBySkillMatch(jobs, userSkills).filter((j) => j.matchPercent >= minPercent)
}

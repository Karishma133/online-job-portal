/**
 * Core Skill Match Engine
 * Compares student skills with job required skills.
 * Returns percent, matched list, missing list, label, and color.
 */

export function calculateSkillMatch(userSkills = [], jobSkills = []) {
  if (!jobSkills.length) return { percent: 100, matched: [], missing: [], label: 'Open', color: 'green' }
  if (!userSkills.length) return { percent: 0, matched: [], missing: jobSkills, label: 'No match', color: 'red' }

  const normalize = (s) => s.toLowerCase().trim()

  const normalizedUser = userSkills.map(normalize)
  const matched = jobSkills.filter(s => normalizedUser.includes(normalize(s)))
  const missing = jobSkills.filter(s => !normalizedUser.includes(normalize(s)))

  const percent = Math.round((matched.length / jobSkills.length) * 100)

  let label, color
  if (percent >= 80) { label = 'Great match';    color = 'green'  }
  else if (percent >= 50) { label = 'Good match'; color = 'yellow' }
  else if (percent >= 20) { label = 'Partial';    color = 'orange' }
  else                    { label = 'Low match';  color = 'red'    }

  return { percent, matched, missing, label, color }
}

/**
 * Sort jobs by best skill match for a student.
 */
export function sortJobsByMatch(jobs = [], userSkills = []) {
  return [...jobs].sort((a, b) => {
    const aMatch = calculateSkillMatch(userSkills, a.requiredSkills || []).percent
    const bMatch = calculateSkillMatch(userSkills, b.requiredSkills || []).percent
    return bMatch - aMatch
  })
}

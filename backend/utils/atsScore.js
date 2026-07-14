/**
 * ATS (Applicant Tracking System) Score Calculator
 * Simulates how real ATS systems score resumes
 */

export function calculateATSScore(resumeText = '', job = {}) {
  if (!resumeText || !job) return { score: 0, breakdown: {}, suggestions: [] }

  const text = resumeText.toLowerCase()
  const suggestions = []
  let totalScore = 0
  const breakdown = {}

  // 1. Skills match (40 points)
  const requiredSkills = job.requiredSkills || []
  const matchedSkills = requiredSkills.filter(s => text.includes(s.toLowerCase()))
  const skillScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 40)
    : 40
  breakdown.skills = { score: skillScore, max: 40, matched: matchedSkills, missing: requiredSkills.filter(s => !matchedSkills.includes(s)) }
  totalScore += skillScore

  if (breakdown.skills.missing.length > 0) {
    suggestions.push(`Add these missing skills: ${breakdown.skills.missing.slice(0, 3).join(', ')}`)
  }

  // 2. Keywords from job description (20 points)
  const jobWords = (job.description || '').toLowerCase().split(/\s+/).filter(w => w.length > 4)
  const uniqueJobWords = [...new Set(jobWords)].slice(0, 30)
  const matchedKeywords = uniqueJobWords.filter(w => text.includes(w))
  const keywordScore = uniqueJobWords.length > 0
    ? Math.round((matchedKeywords.length / uniqueJobWords.length) * 20)
    : 10
  breakdown.keywords = { score: keywordScore, max: 20 }
  totalScore += keywordScore

  // 3. Experience level (15 points)
  const expKeywords = ['experience', 'worked', 'developed', 'built', 'managed', 'led', 'created', 'designed']
  const expFound = expKeywords.filter(k => text.includes(k)).length
  const expScore = Math.min(15, expFound * 3)
  breakdown.experience = { score: expScore, max: 15 }
  totalScore += expScore

  if (expScore < 10) suggestions.push('Add more action verbs: developed, built, managed, led, designed')

  // 4. Education (10 points)
  const eduKeywords = ['b.tech', 'btech', 'b.e', 'bachelor', 'b.sc', 'mca', 'm.tech', 'mba', 'degree', 'university', 'college', 'graduation']
  const eduFound = eduKeywords.some(k => text.includes(k))
  const eduScore = eduFound ? 10 : 0
  breakdown.education = { score: eduScore, max: 10 }
  totalScore += eduScore

  if (!eduFound) suggestions.push('Add your educational qualifications clearly')

  // 5. Contact info (10 points)
  const emailFound = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText)
  const phoneFound = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(resumeText)
  const contactScore = (emailFound ? 5 : 0) + (phoneFound ? 5 : 0)
  breakdown.contact = { score: contactScore, max: 10 }
  totalScore += contactScore

  if (!emailFound) suggestions.push('Add your email address')
  if (!phoneFound) suggestions.push('Add your phone number')

  // 6. Length check (5 points)
  const wordCount = resumeText.split(/\s+/).length
  const lengthScore = wordCount >= 200 && wordCount <= 800 ? 5 : wordCount < 200 ? 2 : 3
  breakdown.length = { score: lengthScore, max: 5, wordCount }
  totalScore += lengthScore

  if (wordCount < 200) suggestions.push('Your resume seems too short — add more details about your experience and projects')
  if (wordCount > 800) suggestions.push('Consider keeping your resume concise — aim for 1 page')

  // General suggestions
  if (totalScore < 60) {
    suggestions.push('Tailor your resume specifically for this job description')
    suggestions.push('Use numbers to quantify achievements (e.g. "Improved performance by 40%")')
  }

  return {
    score: Math.min(100, totalScore),
    grade: totalScore >= 80 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D',
    breakdown,
    suggestions: suggestions.slice(0, 5),
    passesATS: totalScore >= 60,
  }
}

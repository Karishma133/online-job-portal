/**
 * Rule-based Resume Analyzer
 * ---------------------------------------------------------------------------
 * Does the same job as an LLM call (score a resume against a job, point out
 * strengths/gaps) using plain keyword matching and heuristics instead —
 * no Anthropic API key or subscription required. Mirrors the structure of
 * utils/atsScore.js so the two stay consistent with each other.
 */

const ACTION_VERBS = [
  'developed', 'built', 'designed', 'led', 'managed', 'created', 'implemented',
  'improved', 'optimized', 'launched', 'automated', 'architected', 'deployed',
  'reduced', 'increased', 'delivered', 'collaborated', 'mentored', 'analyzed',
]

const EDU_KEYWORDS = ['b.tech', 'btech', 'b.e', 'bachelor', 'b.sc', 'mca', 'm.tech', 'mba', 'degree', 'university', 'college', 'graduation']

/**
 * @param {string} resumeText
 * @param {string[]} jobSkills - required skills for the job being analyzed against
 * @param {string} jobTitle
 */
export function analyzeResumeText(resumeText = '', jobSkills = [], jobTitle = '') {
  const text = resumeText.toLowerCase()
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length

  // --- Skill matching (this is the heart of the score, same idea as ATS) ---
  const skillsFound   = jobSkills.filter(s => text.includes(s.toLowerCase()))
  const missingSkills = jobSkills.filter(s => !skillsFound.includes(s))
  const skillMatchPct = jobSkills.length > 0 ? skillsFound.length / jobSkills.length : 0.7 // no required skills listed -> neutral baseline

  // --- Supporting signals ---
  const actionVerbsFound = ACTION_VERBS.filter(v => text.includes(v))
  const hasQuantifiedAchievements = /\d+%|\d+x\b|\$\d|₹\d|\b\d{2,}\+/i.test(resumeText)
  const hasEducation = EDU_KEYWORDS.some(k => text.includes(k))
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText)
  const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/.test(resumeText)
  const goodLength = wordCount >= 200 && wordCount <= 800

  // --- Weighted score, same 0-100 scale as before ---
  let score = 0
  score += Math.round(skillMatchPct * 55)                       // skills: up to 55
  score += Math.min(20, actionVerbsFound.length * 3)             // action language: up to 20
  score += hasQuantifiedAchievements ? 10 : 0                    // quantified impact: 10
  score += hasEducation ? 5 : 0                                  // education: 5
  score += (hasEmail && hasPhone) ? 5 : (hasEmail || hasPhone) ? 2 : 0  // contact info: 5
  score += goodLength ? 5 : 0                                    // length: 5
  score = Math.max(0, Math.min(100, score))

  // --- Strengths (only include ones that actually apply) ---
  const strengths = []
  if (skillMatchPct >= 0.6) {
    strengths.push(`Strong overlap with the required skill set${jobTitle ? ` for ${jobTitle}` : ''} — matches on ${skillsFound.slice(0, 4).join(', ')}.`)
  } else if (skillsFound.length > 0) {
    strengths.push(`Some relevant skills present: ${skillsFound.slice(0, 3).join(', ')}.`)
  }
  if (actionVerbsFound.length >= 4) {
    strengths.push('Resume uses strong, action-oriented language (developed, built, led, etc.) rather than passive descriptions.')
  }
  if (hasQuantifiedAchievements) {
    strengths.push('Includes quantified achievements (numbers/percentages), which stands out to both ATS systems and recruiters.')
  }
  if (goodLength) {
    strengths.push('Resume length is in the ideal range — detailed without being overwhelming.')
  }
  if (strengths.length === 0) strengths.push('Resume is readable and includes basic candidate information.')

  // --- Improvements (only include ones that actually apply) ---
  const improvements = []
  if (missingSkills.length > 0) {
    improvements.push(`Add or highlight these missing skills if you have them: ${missingSkills.slice(0, 4).join(', ')}.`)
  }
  if (actionVerbsFound.length < 4) {
    improvements.push('Use more action verbs (developed, built, led, optimized) to describe your work instead of passive phrasing.')
  }
  if (!hasQuantifiedAchievements) {
    improvements.push('Add measurable outcomes where possible — e.g. "reduced load time by 40%" instead of "improved performance".')
  }
  if (!hasEmail || !hasPhone) {
    improvements.push('Make sure your email and phone number are clearly visible at the top of your resume.')
  }
  if (!goodLength) {
    improvements.push(wordCount < 200
      ? 'Resume looks quite short — add more detail about your projects and experience.'
      : 'Resume is on the longer side — consider trimming to focus on your most relevant experience.')
  }
  if (improvements.length === 0) improvements.push('Solid resume overall — keep it updated as you gain more experience.')

  // --- One-line summary ---
  const summary =
    score >= 80 ? `Excellent match${jobTitle ? ` for ${jobTitle}` : ''} — this resume is well-aligned with what the role needs.` :
    score >= 60 ? `Good match${jobTitle ? ` for ${jobTitle}` : ''}, with a few gaps worth addressing before applying.` :
    score >= 40 ? `Moderate match — a handful of key skills or details are missing.` :
    `This resume needs some work to align with what this role is asking for.`

  return {
    score,
    skillsFound,
    missingSkills,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    summary,
  }
}

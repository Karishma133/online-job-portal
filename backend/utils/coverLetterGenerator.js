/**
 * Template-based Cover Letter Generator
 * ---------------------------------------------------------------------------
 * Produces a real, usable 3-paragraph cover letter by filling variable
 * templates with the applicant's actual details — no paid API required.
 * Multiple phrasing options per section are picked using a hash of the
 * inputs (not Math.random) so the same job+skills always render the same
 * letter, but different jobs/applicants naturally get different phrasing.
 */

function pick(list, seed) {
  const hash = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return list[hash % list.length]
}

const OPENERS = [
  ({ name, jobTitle, company }) =>
    `I'm writing to express my interest in the ${jobTitle} position at ${company}. As someone who has been actively building skills in this space, I was excited to see this opportunity and believe my background makes me a strong fit for your team.`,
  ({ name, jobTitle, company }) =>
    `I'd like to apply for the ${jobTitle} role at ${company}. This opportunity stood out to me immediately, and I'm confident my skills and enthusiasm would make me a valuable addition to your team.`,
  ({ name, jobTitle, company }) =>
    `I'm excited to apply for the ${jobTitle} opening at ${company}. Having followed the kind of work your team does, I believe this role aligns closely with both my skill set and where I want to grow professionally.`,
]

const BODIES = [
  ({ skills, jobDescription }) =>
    `Over the course of my learning and project work, I've developed hands-on experience with ${skills}. ${jobDescription ? "I noticed this role emphasizes similar areas, and I'm confident I can contribute meaningfully from day one." : "I've applied these skills to real projects, and I'm confident I can bring that same practical approach to your team."}`,
  ({ skills, jobDescription }) =>
    `My core strengths lie in ${skills}, which I've built through consistent, hands-on project work rather than just theory. ${jobDescription ? "These closely match what this role is looking for, and I'm eager to put them to work for your team." : "I enjoy tackling real problems with these tools, and I'm looking for a team where I can keep growing."}`,
  ({ skills, jobDescription }) =>
    `I bring practical experience in ${skills}, gained through projects where I took ideas from concept to working product. ${jobDescription ? "I'd love to bring that same energy to the responsibilities outlined for this role." : "I'm looking for a role where I can apply these skills to real-world impact, and this position feels like the right fit."}`,
]

const CLOSERS = [
  ({ name, company }) =>
    `I'd welcome the chance to discuss how I can contribute to ${company}. Thank you for considering my application — I look forward to hearing from you.\n\nBest regards,\n${name}`,
  ({ name, company }) =>
    `I'm genuinely excited about the possibility of joining ${company} and would love to talk further about how I can add value to your team. Thank you for your time and consideration.\n\nSincerely,\n${name}`,
  ({ name, company }) =>
    `I'd appreciate the opportunity to speak more about this role and how my background fits what ${company} is building. Thank you for considering my application.\n\nWarm regards,\n${name}`,
]

/**
 * @param {object} params
 * @param {string} params.jobTitle
 * @param {string} params.company
 * @param {string} [params.jobDescription]
 * @param {string[]} [params.userSkills]
 * @param {string} [params.userName]
 */
export function generateCoverLetterText({ jobTitle, company, jobDescription = '', userSkills = [], userName = '' }) {
  const name = userName?.trim() || 'the applicant'
  const seed = `${jobTitle}|${company}|${userSkills.join(',')}`

  const skillsList = userSkills.length > 0
    ? userSkills.slice(0, 4).join(', ')
    : 'the core tools and technologies relevant to this field'

  const ctx = { name, jobTitle, company, skills: skillsList, jobDescription }

  const opener = pick(OPENERS, seed + 'o')(ctx)
  const body   = pick(BODIES,   seed + 'b')(ctx)
  const closer = pick(CLOSERS,  seed + 'c')(ctx)

  return `${opener}\n\n${body}\n\n${closer}`
}

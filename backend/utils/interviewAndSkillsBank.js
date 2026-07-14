/**
 * Static interview-question bank and skill-suggestion tables.
 * Covers the common skills already used across the app's job listings.
 * Falls back to generic questions/skills for anything not explicitly listed.
 */

const QUESTION_BANK = {
  'React': [
    { question: 'Explain how the Virtual DOM improves performance in React.', type: 'technical', tip: 'Mention the diffing algorithm and batched updates.' },
    { question: 'What is the difference between props and state?', type: 'technical', tip: 'Props are read-only and passed down; state is local and mutable via setState/useState.' },
    { question: 'Tell me about a time you had to optimize a slow-rendering component.', type: 'behavioral', tip: 'Mention memoization (React.memo, useMemo) or virtualization.' },
  ],
  'Node.js': [
    { question: 'How does the Node.js event loop work?', type: 'technical', tip: 'Cover the phases: timers, I/O callbacks, poll, check, close.' },
    { question: 'How would you handle a memory leak in a long-running Node process?', type: 'situational', tip: 'Mention heap snapshots, monitoring tools, and closing unused references/listeners.' },
  ],
  'JavaScript': [
    { question: 'Explain closures with a practical example.', type: 'technical', tip: 'Show a function returning another function that retains access to outer variables.' },
    { question: 'What is the difference between == and ===?', type: 'technical', tip: 'Mention type coercion vs strict type+value comparison.' },
  ],
  'Python': [
    { question: 'What are Python decorators and when would you use one?', type: 'technical', tip: 'Give an example like logging or timing a function.' },
    { question: 'Describe a project where you used Python for data processing or automation.', type: 'behavioral', tip: 'Structure your answer with the problem, approach, and measurable result.' },
  ],
  'SQL': [
    { question: 'Explain the difference between INNER JOIN and LEFT JOIN.', type: 'technical', tip: 'Use a concrete two-table example in your answer.' },
    { question: 'How would you optimize a slow SQL query?', type: 'situational', tip: 'Mention indexing, EXPLAIN plans, and avoiding SELECT *.' },
  ],
  'MongoDB': [
    { question: 'When would you choose MongoDB over a relational database?', type: 'technical', tip: 'Talk about flexible schemas and read/write patterns, not just "it\'s NoSQL".' },
  ],
  'AWS': [
    { question: 'Walk me through how you would deploy a web app on AWS.', type: 'situational', tip: 'Mention EC2/ECS, load balancing, and basic security groups.' },
  ],
  'Docker': [
    { question: 'What is the difference between a Docker image and a container?', type: 'technical', tip: 'Image = blueprint, container = running instance of that image.' },
  ],
  'default': [
    { question: 'Walk me through a project you\'re proud of and the impact it had.', type: 'behavioral', tip: 'Use the STAR method: Situation, Task, Action, Result.' },
    { question: 'How do you approach learning a new technology quickly?', type: 'behavioral', tip: 'Give a specific recent example rather than a general answer.' },
    { question: 'Describe a time you disagreed with a teammate — how did you handle it?', type: 'behavioral', tip: 'Focus on the resolution and what you learned, not the conflict itself.' },
  ],
}

const SKILLS_BY_ROLE = {
  'frontend developer':  ['React', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Git', 'REST APIs', 'Responsive Design', 'Webpack'],
  'backend developer':   ['Node.js', 'Express', 'MongoDB', 'SQL', 'REST APIs', 'Docker', 'Git', 'Authentication'],
  'full stack developer':['React', 'Node.js', 'MongoDB', 'SQL', 'JavaScript', 'REST APIs', 'Git', 'Docker'],
  'data analyst':        ['SQL', 'Python', 'Excel', 'Power BI', 'Data Visualization', 'Statistics', 'Pandas', 'Tableau'],
  'data scientist':      ['Python', 'Machine Learning', 'SQL', 'Pandas', 'NumPy', 'Statistics', 'TensorFlow', 'Data Visualization'],
  'ui/ux designer':      ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Adobe XD', 'Design Systems', 'Usability Testing'],
  'devops engineer':     ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Git', 'Monitoring'],
  'mobile developer':    ['React Native', 'Flutter', 'Kotlin', 'Swift', 'REST APIs', 'Git', 'Firebase'],
  'default':             ['Communication', 'Problem Solving', 'Git', 'REST APIs', 'Teamwork', 'Time Management'],
}

export function getInterviewQuestions(jobTitle = '', requiredSkills = []) {
  const questions = []
  const skillsToUse = requiredSkills.length > 0 ? requiredSkills : ['default']

  for (const skill of skillsToUse) {
    const bank = QUESTION_BANK[skill]
    if (bank) {
      for (const q of bank) {
        if (questions.length >= 8) break
        questions.push({ ...q, skill })
      }
    }
    if (questions.length >= 8) break
  }

  // Top up with generic behavioral questions if we didn't reach 8
  let i = 0
  while (questions.length < 8) {
    const filler = QUESTION_BANK.default[i % QUESTION_BANK.default.length]
    questions.push({ ...filler, skill: 'General' })
    i++
  }

  return questions.slice(0, 8)
}

export function suggestSkillsForRole(jobTitle = '') {
  const title = jobTitle.toLowerCase()
  const matchKey = Object.keys(SKILLS_BY_ROLE).find(key => title.includes(key))
  return SKILLS_BY_ROLE[matchKey] || SKILLS_BY_ROLE.default
}

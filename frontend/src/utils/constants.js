export const SKILLS_LIST = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  // Frontend
  'React', 'Next.js', 'Vue.js', 'Angular', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Redux', 'GraphQL',
  // Backend
  'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'FastAPI', 'REST API',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQL', 'SQLite',
  // DevOps & Cloud
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Nginx',
  // Data & AI
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Pandas', 'NumPy',
  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS',
  // Tools
  'Git', 'Figma', 'Postman', 'Jest', 'Webpack', 'Vite',
  // Soft Skills
  'Problem Solving', 'Communication', 'Teamwork', 'Leadership', 'Agile', 'Scrum',
]

export const JOB_CATEGORIES = [
  'Software Development', 'Data Science & Analytics', 'Design & UX',
  'Marketing & SEO', 'Product Management', 'DevOps & Cloud',
  'Mobile Development', 'AI & Machine Learning', 'Cybersecurity',
  'Finance & Accounting', 'Human Resources', 'Content Writing',
  'Customer Support', 'Sales', 'Other',
]

export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote', 'Hybrid']

export const SALARY_RANGES = [
  { label: 'Any', value: '' },
  { label: '0 – 3 LPA',   value: '0-300000' },
  { label: '3 – 6 LPA',   value: '300000-600000' },
  { label: '6 – 10 LPA',  value: '600000-1000000' },
  { label: '10 – 20 LPA', value: '1000000-2000000' },
  { label: '20+ LPA',     value: '2000000-999999999' },
]

export const APPLICATION_STATUS = {
  APPLIED:     { label: 'Applied',     color: 'badge-primary' },
  SHORTLISTED: { label: 'Shortlisted', color: 'badge-yellow'  },
  INTERVIEW:   { label: 'Interview',   color: 'badge-green'   },
  HIRED:       { label: 'Hired 🎉',   color: 'badge-green'   },
  REJECTED:    { label: 'Rejected',    color: 'badge-red'     },
}

export const EXPERIENCE_LEVELS = ['Fresher', '1-2 years', '2-5 years', '5+ years']

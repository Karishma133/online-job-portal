import { HiOutlineAcademicCap, HiOutlinePlay, HiOutlineBookOpen, HiOutlineCheckCircle } from 'react-icons/hi'
import { useSkillMatch } from '../../hooks/useSkillMatch'
import { useAuth } from '../../hooks/useAuth'

const RESOURCES = {
  'React':      { coursera: 'https://www.coursera.org/learn/react-basics', youtube: 'https://youtube.com/results?search_query=React+tutorial', docs: 'https://react.dev' },
  'Node.js':    { coursera: 'https://www.coursera.org/learn/server-side-nodejs', youtube: 'https://youtube.com/results?search_query=nodejs+tutorial', docs: 'https://nodejs.org/docs' },
  'MongoDB':    { coursera: 'https://www.coursera.org/learn/introduction-mongodb', youtube: 'https://youtube.com/results?search_query=mongodb+tutorial', docs: 'https://www.mongodb.com/docs' },
  'JavaScript': { coursera: 'https://www.coursera.org/learn/javascript-basics', youtube: 'https://youtube.com/results?search_query=javascript+tutorial', docs: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  'Python':     { coursera: 'https://www.coursera.org/learn/python', youtube: 'https://youtube.com/results?search_query=python+tutorial', docs: 'https://docs.python.org' },
  'Docker':     { coursera: 'https://www.coursera.org/learn/docker-essentials', youtube: 'https://youtube.com/results?search_query=docker+tutorial', docs: 'https://docs.docker.com' },
  'AWS':        { coursera: 'https://www.coursera.org/learn/aws-cloud-practitioner-essentials', youtube: 'https://youtube.com/results?search_query=aws+tutorial', docs: 'https://docs.aws.amazon.com' },
  'SQL':        { coursera: 'https://www.coursera.org/learn/intro-sql', youtube: 'https://youtube.com/results?search_query=sql+tutorial', docs: 'https://www.w3schools.com/sql' },
  'Git':        { coursera: 'https://www.coursera.org/learn/introduction-git-github', youtube: 'https://youtube.com/results?search_query=git+tutorial', docs: 'https://git-scm.com/doc' },
  'TypeScript': { coursera: 'https://www.coursera.org/learn/programming-with-typescript', youtube: 'https://youtube.com/results?search_query=typescript+tutorial', docs: 'https://www.typescriptlang.org/docs' },
}

const getResources = (skill) => RESOURCES[skill] || {
  coursera: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
  youtube:  `https://youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`,
  docs:     `https://google.com/search?q=${encodeURIComponent(skill)}+documentation`,
}

export default function SkillGapRoadmap({ jobSkills = [] }) {
  const { user } = useAuth()
  const match = useSkillMatch(jobSkills)

  if (!user || user.role !== 'student') return null

  if (match.missing.length === 0) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-accent-400/10 border border-accent-300 flex items-center gap-3">
        <HiOutlineCheckCircle className="text-accent-500 text-2xl shrink-0" />
        <div>
          <p className="font-semibold text-accent-700 text-sm">Tere paas sari required skills hain! 🎉</p>
          <p className="text-xs text-accent-600 mt-0.5">Tu is job ke liye 100% ready hai — apply kar de!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineAcademicCap className="text-primary-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">Skill Gap Roadmap</h3>
        <span className="badge-yellow">{match.missing.length} skills missing</span>
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Yeh skills seekh lo aur is job ke liye ready ho jao:</p>
      <div className="space-y-3">
        {match.missing.map((skill) => {
          const r = getResources(skill)
          return (
            <div key={skill} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warn-400/10 flex items-center justify-center shrink-0">
                  <span className="text-warn-500 text-xs font-bold">?</span>
                </div>
                <span className="font-medium text-surface-800 dark:text-surface-200 text-sm">{skill}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={r.coursera} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-primary-50 text-primary-700 border border-primary-200
                             hover:bg-primary-100 transition-colors dark:bg-primary-900/30
                             dark:text-primary-300 dark:border-primary-800">
                  <HiOutlineAcademicCap /> Coursera
                </a>
                <a href={r.youtube} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-danger-50 text-danger-600 border border-danger-200
                             hover:bg-danger-100 transition-colors dark:bg-danger-900/30
                             dark:text-danger-300 dark:border-danger-800">
                  <HiOutlinePlay /> YouTube
                </a>
                <a href={r.docs} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-surface-100 text-surface-600 border border-surface-200
                             hover:bg-surface-200 transition-colors dark:bg-surface-800
                             dark:text-surface-300 dark:border-surface-700">
                  <HiOutlineBookOpen /> Docs
                </a>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-surface-400 mt-4 text-center">Yeh skills seekhne ke baad profile update karo — match % badh jaayega! 🚀</p>
    </div>
  )
}

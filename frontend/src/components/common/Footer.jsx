import { Link } from 'react-router-dom'
import { HiOutlineBriefcase } from 'react-icons/hi'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const footerLinks = {
  Platform: [
    { label: 'Browse Jobs', to: '/jobs' },
    { label: 'Post a Job', to: '/post-job' },
    { label: 'For Students', to: '/register' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 mt-20">
      <div className="container-app px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-white mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
              <HiOutlineBriefcase className="text-white text-lg" />
            </span>
            Skill<span className="text-primary-400">Match</span>
          </Link>
          <p className="text-sm text-surface-400 max-w-xs leading-relaxed">
            A job portal that matches students to roles based on the skills they actually have —
            not just keyword guesswork.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <SocialIcon href="https://github.com/Karishma133"><FaGithub /></SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/karishma-s-007824293"><FaLinkedin /></SocialIcon>
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-white font-semibold text-sm mb-3">{heading}</h4>
            <ul className="space-y-2">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-surface-400 hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Built by</h4>
          <p className="text-sm text-surface-400">Karishma</p>
          <div className="flex flex-col gap-1.5 mt-2">
            <a href="https://www.linkedin.com/in/karishma-s-007824293" target="_blank" rel="noreferrer"
              className="text-sm text-surface-400 hover:text-primary-400 transition-colors flex items-center gap-1.5">
              <FaLinkedin /> LinkedIn
            </a>
            <a href="https://github.com/Karishma133" target="_blank" rel="noreferrer"
              className="text-sm text-surface-400 hover:text-primary-400 transition-colors flex items-center gap-1.5">
              <FaGithub /> GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-800 py-5 text-center text-xs text-surface-500">
        © {new Date().getFullYear()} SkillMatch. Built for students, by students.
      </div>
    </footer>
  )
}

function SocialIcon({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center
                 text-surface-300 hover:bg-primary-600 hover:text-white transition-colors"
    >
      {children}
    </a>
  )
}

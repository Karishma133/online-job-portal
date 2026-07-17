import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineAcademicCap, HiCheck } from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../hooks/useAuth'
import { showToast } from '../components/common/Toast'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const roles = [
  { value: 'student',   label: 'Student / Job Seeker', icon: <HiOutlineAcademicCap />,     desc: 'Find jobs matched to your skills' },
  { value: 'recruiter', label: 'Recruiter',             icon: <HiOutlineBuildingOffice2 />, desc: 'Post jobs and find talent' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'student' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register(form)
      showToast.success('Account created! Welcome to SkillMatch.')
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-white dark:bg-surface-950">
      {/* Left — branded panel, hidden on mobile */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden
                      bg-surface-950 text-white p-12">
        <div className="absolute inset-0 bg-signature-grid opacity-10 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[420px] h-[420px] bg-primary-600/20 blur-[110px] rounded-full pointer-events-none" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow">
            <HiOutlineBriefcase className="text-white text-lg" />
          </span>
          Skill<span className="text-gradient">Match</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-display font-semibold leading-tight mb-4">
            Stop guessing if you're qualified.
          </h2>
          <p className="text-surface-300 text-sm leading-relaxed mb-6">
            Whether you're hunting for your first internship or hiring your next great engineer,
            SkillMatch scores every match against real skills, not keywords.
          </p>

          <ul className="space-y-3 text-sm text-surface-300">
            {['Live skill-match % on every job', 'Auto-scheduled interviews for strong matches', 'AI resume analysis & ATS scoring'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent-400/15 text-accent-400 flex items-center justify-center shrink-0">
                  <HiCheck className="text-xs" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-surface-500">© {new Date().getFullYear()} SkillMatch</p>
      </div>

      {/* Right — form */}
      <div className="flex items-start lg:items-center justify-center px-4 py-4 lg:py-6
                      max-h-[calc(100vh-4rem)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm my-auto"
        >
          <div className="lg:hidden text-center mb-4">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-surface-900 dark:text-white">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                <HiOutlineBriefcase className="text-white text-lg" />
              </span>
              Skill<span className="text-gradient">Match</span>
            </Link>
          </div>

          <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white">Create your account</h1>
          <p className="text-surface-400 text-sm mt-0.5 mb-3">Takes less than a minute</p>

          <button
            onClick={() => { window.location.href = `${BACKEND}/api/auth/google` }}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-xl
                       border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800
                       text-surface-700 dark:text-surface-200 font-medium text-sm
                       hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
            <span className="text-xs text-surface-400">or</span>
            <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Role selector */}
            <div>
              <label className="label !mb-1">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`flex items-center gap-2 text-left px-2.5 py-2 rounded-xl border-2 transition-all ${
                      form.role === r.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:border-primary-200'
                    }`}>
                    <span className={`text-base shrink-0 ${form.role === r.value ? 'text-primary-600' : 'text-surface-400'}`}>{r.icon}</span>
                    <p className="text-xs font-semibold text-surface-800 dark:text-surface-200 leading-tight">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label !mb-1">Full name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="text" className={`input !py-2 pl-10 ${errors.name ? 'input-error' : ''}`}
                  placeholder="Your name" value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label !mb-1">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" className={`input !py-2 pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label !mb-1">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="password" className={`input !py-2 pl-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="At least 6 characters" value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center !py-2.5">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-3">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

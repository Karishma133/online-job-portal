import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineBriefcase, HiOutlineMail, HiOutlineLockClosed,
  HiOutlineEye, HiOutlineEyeOff, HiCheck,
} from 'react-icons/hi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../hooks/useAuth'
import { showToast } from '../components/common/Toast'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const [form,         setForm]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  // Show error from Google OAuth failure
  const googleError = params.get('error')

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      showToast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const redirectTo = location.state?.from?.pathname ||
        (user.role === 'recruiter' ? '/recruiter/dashboard' : user.role === 'admin' ? '/admin' : '/dashboard')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND}/api/auth/google`
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-white dark:bg-surface-950">
      {/* Left — branded panel, hidden on mobile */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden
                      bg-surface-950 text-white p-12">
        <div className="absolute inset-0 bg-signature-grid opacity-10 pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-[420px] h-[420px] bg-primary-600/20 blur-[110px] rounded-full pointer-events-none" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow">
            <HiOutlineBriefcase className="text-white text-lg" />
          </span>
          Skill<span className="text-gradient">Match</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-display font-semibold leading-tight mb-4">
            Every application, a real answer within 24 hours.
          </h2>
          <p className="text-surface-300 text-sm leading-relaxed">
            No more silent inboxes. SkillMatch scores your profile against every role
            and guarantees a concrete response — interview or update — before the day is out.
          </p>

          <div className="mt-8 flex items-center gap-2 text-sm text-surface-300">
            <span className="w-6 h-6 rounded-full bg-accent-400/15 text-accent-400 flex items-center justify-center shrink-0">
              <HiCheck className="text-xs" />
            </span>
            Free forever for students
          </div>
        </div>

        <p className="relative z-10 text-xs text-surface-500">© {new Date().getFullYear()} SkillMatch</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-surface-900 dark:text-white">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                <HiOutlineBriefcase className="text-white text-lg" />
              </span>
              Skill<span className="text-gradient">Match</span>
            </Link>
          </div>

          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Welcome back</h1>
          <p className="text-surface-400 text-sm mt-1 mb-8">Sign in to continue your job search</p>

          {googleError && (
            <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 text-sm text-center">
              Google login failed. Please try again.
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                       border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800
                       text-surface-700 dark:text-surface-200 font-medium text-sm
                       hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
            <span className="text-xs text-surface-400">or</span>
            <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium mb-1.5">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

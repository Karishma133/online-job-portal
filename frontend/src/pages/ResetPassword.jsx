import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import { showToast } from '../components/common/Toast'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword]  = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [errors,          setErrors]          = useState({})

  const validate = () => {
    const errs = {}
    if (!password || password.length < 6) errs.password = 'Minimum 6 characters'
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await authService.resetPassword(token, password)
      // Log the user straight in with the fresh token, same as a normal login
      loginWithToken(data.token)
      showToast.success('Password updated! You are now signed in.')
      navigate(data.user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-surface-50 dark:bg-surface-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-surface-900 dark:text-white">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
              <HiOutlineBriefcase className="text-white text-lg" />
            </span>
            Skill<span className="text-gradient">Match</span>
          </Link>
          <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white mt-6">Set a new password</h1>
          <p className="text-surface-400 text-sm mt-1">Make it something you'll remember this time.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="At least 6 characters" value={password}
                  onChange={(e) => setPassword(e.target.value)} autoFocus />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm new password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
              {loading ? 'Updating...' : 'Reset password'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
          Link expired or not working? <Link to="/forgot-password" className="text-primary-600 font-medium">Request a new one</Link>
        </p>
      </motion.div>
    </div>
  )
}

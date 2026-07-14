import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineMail, HiOutlineArrowLeft, HiCheck } from 'react-icons/hi'
import { authService } from '../services/authService'
import { showToast } from '../components/common/Toast'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { showToast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
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
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-accent-400/15 text-accent-600 flex items-center justify-center mx-auto mb-4">
                <HiCheck className="text-2xl" />
              </div>
              <h1 className="text-lg font-display font-bold text-surface-900 dark:text-white">Check your email</h1>
              <p className="text-surface-500 dark:text-surface-400 text-sm mt-2 leading-relaxed">
                If an account exists for <strong className="text-surface-700 dark:text-surface-200">{email}</strong>,
                we've sent a link to reset your password. It expires in 30 minutes.
              </p>
              <Link to="/login" className="btn btn-outline w-full justify-center mt-6">
                <HiOutlineArrowLeft /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white">Forgot password?</h1>
              <p className="text-surface-400 text-sm mt-1 mb-6">No worries, we'll send you reset instructions.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="email" className="input pl-10"
                      placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} autoFocus />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 mt-6 transition-colors">
                <HiOutlineArrowLeft className="text-base" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

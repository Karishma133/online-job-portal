import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'

/**
 * This page handles the Google OAuth redirect.
 * After Google login, backend redirects here with ?token=xxx&role=yyy
 */
export default function GoogleAuthSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    const role  = params.get('role')

    if (token) {
      loginWithToken(token)
      const redirect = role === 'recruiter' ? '/recruiter/dashboard'
                     : role === 'admin'     ? '/admin'
                     : '/dashboard'
      navigate(redirect, { replace: true })
    } else {
      navigate('/login?error=google_failed', { replace: true })
    }
  }, [params, navigate, loginWithToken])

  return <Loader fullscreen label="Signing you in with Google..." />
}

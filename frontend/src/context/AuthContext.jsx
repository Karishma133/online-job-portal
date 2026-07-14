import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('sm_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return }
      try {
        const data = await authService.getMe(token)
        setUser(data.user)
      } catch {
        localStorage.removeItem('sm_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password })
    localStorage.setItem('sm_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData)
    localStorage.setItem('sm_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  // Used by Google OAuth redirect page
  const loginWithToken = useCallback((newToken) => {
    localStorage.setItem('sm_token', newToken)
    setToken(newToken)
    // User will be fetched by the useEffect above
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sm_token')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}

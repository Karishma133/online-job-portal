import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loader from './Loader'

/**
 * Wraps routes that require authentication.
 * Pass `role` prop to additionally restrict by user role.
 * Usage: <Route element={<ProtectedRoute role="recruiter" />}> ... </Route>
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullscreen />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

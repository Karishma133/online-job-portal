import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Navbar          from './components/common/Navbar'
import Footer          from './components/common/Footer'
import Loader          from './components/common/Loader'
import ProtectedRoute  from './components/common/ProtectedRoute'

import Home               from './pages/Home'
import Login              from './pages/Login'
import Register           from './pages/Register'
import ForgotPassword     from './pages/ForgotPassword'
import ResetPassword      from './pages/ResetPassword'
import LiveInterview      from './pages/LiveInterview'
import GoogleAuthSuccess  from './pages/GoogleAuthSuccess'
import Jobs               from './pages/Jobs'
import JobDetail          from './pages/JobDetail'
import PostJob            from './pages/PostJob'
import JobApplicants      from './pages/JobApplicants'
import Profile            from './pages/Profile'
import ChatPage           from './pages/chat/ChatPage'
import StudentDashboard   from './pages/dashboard/StudentDashboard'
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard'
import AdminPanel         from './pages/admin/AdminPanel'
import NotFound           from './pages/NotFound'

export default function App() {
  const { loading } = useAuth()
  if (loading) return <Loader fullscreen />

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register />} />
          <Route path="/forgot-password"     element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/jobs"                element={<Jobs />} />
          <Route path="/jobs/:id"            element={<JobDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile"           element={<Profile />} />
            <Route path="/chat"              element={<ChatPage />} />
            <Route path="/interview/:appId"  element={<LiveInterview />} />
          </Route>

          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="recruiter" />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/post-job"            element={<PostJob />} />
            <Route path="/jobs/:id/applicants" element={<JobApplicants />} />
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

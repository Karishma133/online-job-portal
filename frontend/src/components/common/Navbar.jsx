import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../utils/helpers'
import NotificationBell from './NotificationBell'
import {
  HiOutlineBriefcase, HiOutlineMenu, HiOutlineX,
  HiOutlineUser, HiOutlineLogout, HiOutlineViewGrid,
  HiOutlinePlusCircle, HiOutlineShieldCheck,
  HiOutlineSun, HiOutlineMoon, HiOutlineChatAlt2,
} from 'react-icons/hi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const navLinks = [
    { to: '/jobs',     label: 'Browse Jobs' },
    { to: '/register', label: 'For Students' },
    ...(user?.role === 'recruiter' ? [{ to: '/post-job', label: 'Post a Job' }] : []),
  ]

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false) }

  const dashboardLink = user?.role === 'recruiter' ? '/recruiter/dashboard'
    : user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-100 dark:border-surface-800 shadow-sm">
      <nav className="container-app flex items-center justify-between h-16 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-surface-900 dark:text-white shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow">
            <HiOutlineBriefcase className="text-white text-lg" />
          </span>
          Skill<span className="text-gradient">Match</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30'
                    : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                }`
              }>{label}</NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dark/Light toggle */}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-100 dark:bg-surface-800
                       text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
            {theme === 'dark' ? <HiOutlineSun className="text-lg text-warn-400" /> : <HiOutlineMoon className="text-lg" />}
          </button>

          {user ? (
            <>
              {/* Job/application notifications — separate from chat messages */}
              <NotificationBell />

              {/* Chat icon */}
              <Link to="/chat"
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-100 dark:bg-surface-800
                           text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
                <HiOutlineChatAlt2 className="text-lg" />
              </Link>

              {user.role === 'recruiter' && (
                <Link to="/post-job" className="btn btn-primary btn-sm hidden md:inline-flex">
                  <HiOutlinePlusCircle /> Post Job
                </Link>
              )}

              {/* Avatar dropdown */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(v => !v)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-semibold
                             flex items-center justify-center shadow-glow ring-2 ring-white dark:ring-surface-900 hover:ring-primary-300 dark:hover:ring-primary-700
                             transition-all focus:outline-none focus:ring-2 focus:ring-primary-400">
                  {user.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : getInitials(user.name)
                  }
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-surface-800 rounded-2xl shadow-lg
                                 border border-surface-100 dark:border-surface-700 py-1.5 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-surface-100 dark:border-surface-700">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-surface-400 truncate">{user.email}</p>
                      </div>
                      <DropdownItem icon={<HiOutlineViewGrid />} to={dashboardLink} onClick={() => setProfileOpen(false)}>Dashboard</DropdownItem>
                      <DropdownItem icon={<HiOutlineUser />} to="/profile" onClick={() => setProfileOpen(false)}>My Profile</DropdownItem>
                      <DropdownItem icon={<HiOutlineChatAlt2 />} to="/chat" onClick={() => setProfileOpen(false)}>Messages</DropdownItem>
                      {user.role === 'admin' && (
                        <DropdownItem icon={<HiOutlineShieldCheck />} to="/admin" onClick={() => setProfileOpen(false)}>Admin Panel</DropdownItem>
                      )}
                      <div className="border-t border-surface-100 dark:border-surface-700 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger-500
                                     hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors">
                          <HiOutlineLogout className="text-base" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm hidden md:inline-flex">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden btn btn-ghost btn-sm p-2 dark:text-surface-300">
            {menuOpen ? <HiOutlineX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800 px-4 pb-4 space-y-1"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600">
                {label}
              </NavLink>
            ))}
            {user && (
              <Link to="/chat" onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-surface-700 dark:text-surface-300">
                Messages
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium dark:text-surface-300">Sign in</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary w-full mt-2 justify-center">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function DropdownItem({ icon, to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 dark:text-surface-300
                 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
      <span className="text-base text-surface-400">{icon}</span>
      {children}
    </Link>
  )
}

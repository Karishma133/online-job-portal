import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HiOutlineBell, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCheck } from 'react-icons/hi'
import api from '../../services/api'
import { timeAgo } from '../../utils/helpers'

const TYPE_ICON = {
  NEW_MATCH: <HiOutlineBriefcase />,
  APPLICATION_STATUS: <HiOutlineBriefcase />,
  NEW_APPLICANT: <HiOutlineUserGroup />,
  GENERAL: <HiOutlineBell />,
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  const fetchNotifications = () => {
    api.get('/notifications')
      .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unreadCount || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
    // Light polling so a new interview/applicant alert shows up without a full page reload
    const interval = setInterval(fetchNotifications, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpenNotification = async (n) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`)
        setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x))
        setUnreadCount(c => Math.max(0, c - 1))
      } catch { /* non-critical */ }
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* non-critical */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-surface-100 dark:bg-surface-800
                   text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all">
        <HiOutlineBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white
                          text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-surface-900
                      border border-surface-100 dark:border-surface-800 rounded-2xl shadow-elevated z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800 sticky top-0 bg-white dark:bg-surface-900">
              <p className="font-display font-semibold text-sm text-surface-900 dark:text-white">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  <HiOutlineCheck /> Mark all read
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-xs text-surface-400 py-8">Loading...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <HiOutlineBell className="text-3xl text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button key={n._id} onClick={() => handleOpenNotification(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-surface-50 dark:border-surface-800/60
                              hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                  <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 text-sm">
                    {TYPE_ICON[n.type] || <HiOutlineBell />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm ${!n.isRead ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-600 dark:text-surface-300'}`}>
                      {n.title}
                    </span>
                    {n.message && <span className="block text-xs text-surface-400 mt-0.5 line-clamp-2">{n.message}</span>}
                    <span className="block text-[10px] text-surface-400 mt-1">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

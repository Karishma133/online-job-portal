import { useEffect, useState } from 'react'
import {
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineTrash,
  HiOutlineShieldCheck, HiOutlineChartBar, HiOutlineTrendingUp,
} from 'react-icons/hi'
import { userService } from '../../services/userService'
import { jobService } from '../../services/jobService'
import api from '../../services/api'
import StatsCard from '../../components/dashboard/StatsCard'
import Loader from '../../components/common/Loader'
import { showToast } from '../../components/common/Toast'
import { getInitials, timeAgo } from '../../utils/helpers'

const tabs = ['Overview', 'Users', 'Jobs']

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [analytics, setAnalytics] = useState(null)
  const [users,     setUsers]     = useState([])
  const [jobs,      setJobs]      = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsData, userData, jobData] = await Promise.all([
          api.get('/analytics/admin'),
          userService.getAllUsers(),
          jobService.getJobs({ admin: true }),
        ])
        setAnalytics(analyticsData)
        setUsers(userData.users || [])
        setJobs(jobData.jobs || [])
      } catch { showToast.error('Failed to load admin data') }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const handleDeleteUser = async (id) => {
    if (!confirm('Remove this user?')) return
    try {
      await userService.deleteUser(id)
      setUsers(users.filter(u => u._id !== id))
      showToast.success('User removed')
    } catch (err) { showToast.error(err.message) }
  }

  const handleDeleteJob = async (id) => {
    if (!confirm('Remove this job?')) return
    try {
      await jobService.deleteJob(id)
      setJobs(jobs.filter(j => j._id !== id))
      showToast.success('Job removed')
    } catch (err) { showToast.error(err.message) }
  }

  return (
    <div className="section pt-8">
      <div className="container-app px-4">
        <div className="mb-8 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xl">
            <HiOutlineShieldCheck />
          </span>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Platform-wide management</p>
          </div>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatsCard icon={<HiOutlineUsers />}     label="Total users"        value={analytics?.stats?.totalUsers || 0}        color="primary" />
              <StatsCard icon={<HiOutlineBriefcase />} label="Active jobs"         value={analytics?.stats?.totalJobs || 0}         color="green" />
              <StatsCard icon={<HiOutlineTrendingUp />} label="Total applications" value={analytics?.stats?.totalApplications || 0} color="yellow" />
              <StatsCard icon={<HiOutlineChartBar />}  label="Recruiters"          value={analytics?.stats?.recruiterCount || 0}    color="primary" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-surface-200 dark:border-surface-800">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-400'
                  }`}>{tab}</button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'Overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {analytics?.recentUsers?.map(u => (
                      <div key={u._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-surface-400">{u.role} · {timeAgo(u.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Top Jobs by Views</h3>
                  <div className="space-y-3">
                    {analytics?.topJobs?.map(j => (
                      <div key={j._id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{j.title}</p>
                          <p className="text-xs text-surface-400">{j.company}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-primary-600">{j.views} views</p>
                          <p className="text-xs text-surface-400">{j.applicationCount} applied</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'Users' && (
              <div className="card divide-y divide-surface-100 dark:divide-surface-800 p-0">
                {users.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-xs text-surface-400 truncate">{u.email}</p>
                      </div>
                      <span className="badge-gray shrink-0">{u.role}</span>
                    </div>
                    <button onClick={() => handleDeleteUser(u._id)} className="text-danger-500 hover:text-danger-600 shrink-0 ml-2">
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Jobs */}
            {activeTab === 'Jobs' && (
              <div className="card divide-y divide-surface-100 dark:divide-surface-800 p-0">
                {jobs.map(j => (
                  <div key={j._id} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{j.title}</p>
                      <p className="text-xs text-surface-400">{j.company} · {timeAgo(j.createdAt)}</p>
                    </div>
                    <button onClick={() => handleDeleteJob(j._id)} className="text-danger-500 hover:text-danger-600 shrink-0 ml-2">
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { HiOutlineEye, HiOutlineUserGroup, HiOutlineTrendingUp, HiOutlineBriefcase, HiOutlineStar } from 'react-icons/hi'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import StatsCard from '../../components/dashboard/StatsCard'

// Matches the app's design tokens so charts don't look bolted-on
const COLORS = {
  primary: '#4f46e5', primaryLight: '#818cf8',
  accent: '#10b981', warn: '#f59e0b', danger: '#ef4444', signal: '#f97316',
  grid: '#e2e8f0', gridDark: '#334155',
}
const STATUS_COLORS = {
  APPLIED: COLORS.primaryLight, SHORTLISTED: COLORS.warn,
  INTERVIEW: COLORS.signal, HIRED: COLORS.accent, REJECTED: COLORS.danger,
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 shadow-elevated text-xs">
      {label && <p className="font-semibold text-surface-700 dark:text-surface-200 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    api.get('/analytics/recruiter').then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!data) return null

  const pieData = Object.entries(data.stats.byStatus || {})
    .map(([status, count]) => ({ name: status, value: count }))
    .filter(d => d.value > 0)

  const barData = data.jobs.slice(0, 8).map(j => ({
    name: j.title.length > 14 ? j.title.slice(0, 14) + '…' : j.title,
    Views: j.views, Applied: j.applicationCount,
  }))

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Hiring Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={<HiOutlineBriefcase />}  label="Active Jobs"        value={data.stats.totalJobs}         color="primary" />
        <StatsCard icon={<HiOutlineUserGroup />}  label="Total Applications" value={data.stats.totalApplications} color="green" />
        <StatsCard icon={<HiOutlineTrendingUp />}  label="Avg Match %"        value={`${data.stats.avgMatchPercent}%`} color="yellow" />
        <StatsCard icon={<HiOutlineStar />}        label="Hired"              value={data.stats.byStatus?.HIRED || 0} color="green" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Views vs Applications bar chart */}
        <div className="card">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Views vs Applications</h3>
          <p className="text-xs text-surface-400 mb-4">Per job posting, most recent first</p>
          {barData.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-12">No job data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? COLORS.gridDark : COLORS.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="Views" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Applied" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown donut */}
        <div className="card">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-1">Application Pipeline</h3>
          <p className="text-xs text-surface-400 mb-2">Where every applicant currently stands</p>
          {pieData.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-12">No applications yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[d.name] || COLORS.primary }} />
                    <span className="text-surface-500 dark:text-surface-400 capitalize truncate">{d.name.toLowerCase()}</span>
                    <span className="text-surface-700 dark:text-surface-200 font-semibold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Job performance table */}
      <div className="card">
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Job Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-surface-400 text-left">
                <th className="pb-3 font-medium">Job Title</th>
                <th className="pb-3 font-medium text-right"><HiOutlineEye className="inline" /> Views</th>
                <th className="pb-3 font-medium text-right"><HiOutlineUserGroup className="inline" /> Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {data.jobs.map(job => (
                <tr key={job._id}>
                  <td className="py-3 text-surface-800 dark:text-surface-200 font-medium">{job.title}</td>
                  <td className="py-3 text-right text-surface-500">{job.views}</td>
                  <td className="py-3 text-right text-surface-500">{job.applicationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import asyncHandler from 'express-async-handler'
import Job from '../models/Job.js'
import User from '../models/User.js'
import Application from '../models/Application.js'

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalJobs, totalApplications, recentUsers, recentJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('title company views applicationCount'),
  ])

  const studentCount   = await User.countDocuments({ role: 'student' })
  const recruiterCount = await User.countDocuments({ role: 'recruiter' })

  const topJobs = await Job.find({ isActive: true })
    .sort({ views: -1 }).limit(5)
    .select('title company views applicationCount')

  res.json({
    success: true,
    stats: { totalUsers, totalJobs, totalApplications, studentCount, recruiterCount },
    recentUsers,
    recentJobs,
    topJobs,
  })
})

export const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id, isActive: true })
  const jobIds = jobs.map(j => j._id)

  const applications = await Application.find({ job: { $in: jobIds } })

  const byStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  const avgMatchPercent = applications.length
    ? Math.round(applications.reduce((s, a) => s + (a.matchPercent || 0), 0) / applications.length)
    : 0

  const topPerformingJob = jobs.reduce((top, job) =>
    (job.views + job.applicationCount > (top?.views || 0) + (top?.applicationCount || 0)) ? job : top, null)

  res.json({
    success: true,
    stats: {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      avgMatchPercent,
      byStatus,
    },
    topPerformingJob,
    jobs: jobs.map(j => ({
      _id: j._id, title: j.title, views: j.views,
      applicationCount: j.applicationCount, isUrgent: j.isUrgent,
    })),
  })
})

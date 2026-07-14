import asyncHandler from 'express-async-handler'
import Job from '../models/Job.js'
import Application from '../models/Application.js'
import JobView from '../models/JobView.js'
import { calculateMatch } from '../utils/skillMatchEngine.js'

// @desc    Get all jobs with filters, search, pagination
// @route   GET /api/jobs
// @access  Public (optional auth — used to attach match % for students)
export const getJobs = asyncHandler(async (req, res) => {
  const {
    keyword, skills, location, jobType, category, salary,
    sortBy = 'newest', page = 1, limit = 10,
  } = req.query

  const query = { isActive: true }

  if (keyword) {
    query.$text = { $search: keyword }
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' }
  }
  if (jobType) {
    query.jobType = jobType
  }
  if (category) {
    query.category = category
  }
  if (skills) {
    const skillsArr = Array.isArray(skills) ? skills : skills.split(',')
    query.requiredSkills = { $in: skillsArr.map((s) => new RegExp(`^${s}$`, 'i')) }
  }
  if (salary) {
    const [min, max] = salary.split('-').map(Number)
    if (!isNaN(min)) query.salaryMax = { $gte: min }
    if (!isNaN(max)) query.salaryMin = { ...(query.salaryMin || {}), $lte: max }
  }

  let sort = { createdAt: -1 }
  if (sortBy === 'salary-high') sort = { salaryMax: -1 }
  if (sortBy === 'salary-low') sort = { salaryMin: 1 }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(50, Number(limit))

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('postedBy', 'name companyName')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Job.countDocuments(query),
  ])

  // Attach match % if a logged-in student is requesting
  let result = jobs
  if (req.user?.role === 'student') {
    result = jobs.map((job) => {
      const match = calculateMatch(req.user.skills, job.requiredSkills)
      return { ...job.toObject(), matchPercent: match.percent }
    })
    if (sortBy === 'match') {
      result.sort((a, b) => b.matchPercent - a.matchPercent)
    }
  }

  res.json({
    success: true,
    jobs: result,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  })
})

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (optional auth)
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name companyName email')

  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }

  // Count a view, but avoid the two things that inflate the number without
  // meaning anything: (1) the recruiter looking at their own listing, and
  // (2) the same person refreshing/reopening the page repeatedly.
  const isOwner = req.user && job.postedBy._id.toString() === req.user._id.toString()
  if (!isOwner) {
    if (req.user) {
      // Logged-in visitor — only counts once per 24h, tracked per user.
      const ONE_DAY = 24 * 60 * 60 * 1000
      const recentView = await JobView.findOne({
        job: job._id, user: req.user._id, viewedAt: { $gte: new Date(Date.now() - ONE_DAY) },
      })
      if (!recentView) {
        job.views += 1
        await JobView.findOneAndUpdate(
          { job: job._id, user: req.user._id },
          { viewedAt: new Date() },
          { upsert: true }
        )
      }
    } else {
      // Anonymous visitor — no reliable identity to dedupe against without
      // cookies/sessions, so it's counted as-is (rare case; most real
      // traffic here comes from logged-in students).
      job.views += 1
    }
    await job.save()
  }

  let hasApplied = false
  if (req.user?.role === 'student') {
    hasApplied = Boolean(
      await Application.exists({ job: job._id, applicant: req.user._id })
    )
  }

  res.json({ success: true, job, hasApplied })
})

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (recruiter)
export const createJob = asyncHandler(async (req, res) => {
  const {
    title, company, companyLogo, location, jobType, category,
    experienceLevel, salaryMin, salaryMax, description,
    responsibilities, requiredSkills,
  } = req.body

  if (!title || !company || !location || !description) {
    res.status(400)
    throw new Error('Please fill all required fields')
  }
  if (!requiredSkills || requiredSkills.length === 0) {
    res.status(400)
    throw new Error('Please add at least one required skill')
  }

  const job = await Job.create({
    title, company, companyLogo, location, jobType, category,
    experienceLevel, salaryMin, salaryMax, description,
    responsibilities, requiredSkills,
    postedBy: req.user._id,
  })

  res.status(201).json({ success: true, job })
})

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (recruiter — owner only)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to edit this job')
  }

  Object.assign(job, req.body)
  await job.save()

  res.json({ success: true, job })
})

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter — owner only, or admin)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to delete this job')
  }

  await Application.deleteMany({ job: job._id })
  await job.deleteOne()

  res.json({ success: true, message: 'Job deleted successfully' })
})

// @desc    Get jobs posted by the logged-in recruiter
// @route   GET /api/jobs/my
// @access  Private (recruiter)
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate('applicantCount')

  res.json({ success: true, jobs })
})

// @desc    Get applicants for a specific job, ranked by skill match
// @route   GET /api/jobs/:id/applicants
// @access  Private (recruiter — owner only)
export const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    res.status(404)
    throw new Error('Job not found')
  }
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to view applicants for this job')
  }

  const applications = await Application.find({ job: job._id })
    .populate('applicant', 'name email avatar skills resume location')
    .sort({ matchPercent: -1, createdAt: -1 })

  res.json({ success: true, applications })
})

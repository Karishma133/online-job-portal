import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Application from '../models/Application.js'
import { calculateATSScore } from '../utils/atsScore.js'
import Job from '../models/Job.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const {
    name, bio, location, skills, companyName, headline, phone,
    website, github, linkedin, education, experience, certifications,
    projects, emailAlerts,
  } = req.body

  const user = await User.findById(req.user._id)
  if (!user) { res.status(404); throw new Error('User not found') }

  if (name !== undefined) user.name = name
  if (bio !== undefined) user.bio = bio
  if (location !== undefined) user.location = location
  if (headline !== undefined) user.headline = headline
  if (phone !== undefined) user.phone = phone
  if (website !== undefined) user.website = website
  if (github !== undefined) user.github = github
  if (linkedin !== undefined) user.linkedin = linkedin
  if (emailAlerts !== undefined) user.emailAlerts = emailAlerts
  if (companyName !== undefined) user.companyName = companyName
  if (skills !== undefined && user.role === 'student') user.skills = Array.isArray(skills) ? skills : []
  if (education !== undefined) user.education = education
  if (experience !== undefined) user.experience = experience
  if (certifications !== undefined) user.certifications = certifications
  if (projects !== undefined) user.projects = projects

  await user.save()
  res.json({ success: true, user })
})

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded') }
  const resumeUrl = `/uploads/resumes/${req.file.filename}`
  await User.findByIdAndUpdate(req.user._id, { resume: resumeUrl })
  res.json({ success: true, resumeUrl })
})

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded') }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl })
  res.json({ success: true, avatarUrl })
})

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location salaryMin salaryMax jobType isActive')
    .sort({ createdAt: -1 })
  res.json({ success: true, applications })
})

export const getATSScore = asyncHandler(async (req, res) => {
  const { resumeText, jobId } = req.body
  if (!resumeText) { res.status(400); throw new Error('Resume text required') }
  const job = jobId ? await Job.findById(jobId) : null
  const result = calculateATSScore(resumeText, job || {})
  res.json({ success: true, ...result })
})

export const toggleSaveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  const jobId = req.params.jobId
  const isSaved = user.savedJobs?.includes(jobId)
  if (isSaved) {
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId)
  } else {
    user.savedJobs = [...(user.savedJobs || []), jobId]
  }
  await user.save()
  res.json({ success: true, saved: !isSaved, savedJobs: user.savedJobs })
})

export const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedJobs')
  res.json({ success: true, jobs: user.savedJobs || [] })
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json({ success: true, users })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error('User not found') }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin') }
  await user.deleteOne()
  res.json({ success: true, message: 'User removed' })
})

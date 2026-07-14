import asyncHandler from 'express-async-handler'
import Application from '../models/Application.js'
import Job from '../models/Job.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { calculateMatch } from '../utils/skillMatchEngine.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'
import { instantAutoRespond, RESPONSE_WINDOW_HOURS, pickInterviewSlot } from '../utils/autoResponseEngine.js'

export const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId)
  if (!job || !job.isActive) { res.status(404); throw new Error('Job not found or no longer active') }

  const alreadyApplied = await Application.findOne({ job: job._id, applicant: req.user._id })
  if (alreadyApplied) { res.status(400); throw new Error('You have already applied to this job') }

  const match = calculateMatch(req.user.skills, job.requiredSkills)

  const application = await Application.create({
    job: job._id, applicant: req.user._id,
    matchPercent: match.percent,
    resumeSnapshot: req.user.resume,
    coverNote: req.body.coverNote || '',
    responseDeadline: new Date(Date.now() + RESPONSE_WINDOW_HOURS * 60 * 60 * 1000),
  })

  // Update job stats
  job.applicationCount = (job.applicationCount || 0) + 1
  await job.save()

  // Notify recruiter
  await Notification.create({
    user: job.postedBy, type: 'NEW_APPLICANT',
    title: 'New application received',
    message: `${req.user.name} applied to "${job.title}" with ${match.percent}% match.`,
    link: `/jobs/${job._id}/applicants`,
  })

  // Send instant confirmation email to student
  if (req.user.emailAlerts) {
    sendEmail(req.user.email, emailTemplates.applicationSubmitted(req.user.name, job.title, job.company))
  }

  // 24-Hour Instant Response Guarantee — Layer 1: if the candidate is a
  // strong enough match, don't make them wait for a human at all; auto-book
  // an interview right now. (Layer 2, the 24h sweep, handles everyone else —
  // see utils/autoResponseEngine.js + utils/scheduler.js)
  const instantlyResponded = await instantAutoRespond(application, job, req.user)

  res.status(201).json({
    success: true,
    application,
    instantResponse: instantlyResponded
      ? { interviewDate: application.interviewDate, interviewMode: application.interviewMode }
      : null,
  })
})

export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.appId)
  if (!application) { res.status(404); throw new Error('Application not found') }
  if (application.applicant.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized')
  }
  await application.deleteOne()
  res.json({ success: true, message: 'Application withdrawn' })
})

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, interviewDate, interviewMode } = req.body
  const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED']
  if (!validStatuses.includes(status)) { res.status(400); throw new Error('Invalid status') }

  const application = await Application.findById(req.params.appId).populate('job').populate('applicant', 'name email emailAlerts')
  if (!application) { res.status(404); throw new Error('Application not found') }

  application.status = status
  if (status === 'INTERVIEW') {
    // A recruiter manually moving someone to interview — respect a date they
    // picked, otherwise default to 24h out (same slot logic the auto-response
    // engine uses) so the Live Interview room always has something to show.
    application.interviewDate = interviewDate ? new Date(interviewDate) : pickInterviewSlot(24)
    application.interviewMode = interviewMode || application.interviewMode || 'Online'
  }
  await application.save()

  // Notify student
  await Notification.create({
    user: application.applicant._id, type: 'APPLICATION_STATUS',
    title: 'Application status updated',
    message: `Your application for "${application.job.title}" is now: ${status}`,
    link: '/dashboard',
  })

  // Send email
  if (application.applicant.emailAlerts) {
    sendEmail(application.applicant.email, emailTemplates.statusUpdate(application.applicant.name, application.job.title, status))
  }

  res.json({ success: true, application })
})

// @desc    Get the info needed to join a live interview room (validates the
//          requester is either the applicant or the job's recruiter)
// @route   GET /api/applications/interview/:appId
export const getInterviewRoom = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.appId)
    .populate('job', 'title company postedBy')
    .populate('applicant', 'name avatar')

  if (!application) { res.status(404); throw new Error('Application not found') }

  const isApplicant = application.applicant._id.toString() === req.user._id.toString()
  const isRecruiter = application.job.postedBy.toString() === req.user._id.toString()
  if (!isApplicant && !isRecruiter) {
    res.status(403); throw new Error('You are not part of this interview')
  }

  const recruiter = await User.findById(application.job.postedBy).select('name avatar')

  res.json({
    success: true,
    roomId: application._id.toString(),
    jobTitle: application.job.title,
    company: application.job.company,
    interviewDate: application.interviewDate,
    interviewMode: application.interviewMode,
    applicant: application.applicant,
    recruiter,
    myRole: isApplicant ? 'applicant' : 'recruiter',
  })
})

// @desc    List a recruiter's upcoming interviews across all their jobs
// @route   GET /api/applications/upcoming-interviews
export const getUpcomingInterviews = asyncHandler(async (req, res) => {
  const myJobs = await Job.find({ postedBy: req.user._id }).select('_id')
  const jobIds = myJobs.map(j => j._id)

  const applications = await Application.find({ job: { $in: jobIds }, status: 'INTERVIEW' })
    .populate('job', 'title company')
    .populate('applicant', 'name avatar')
    .sort({ interviewDate: 1 })

  res.json({ success: true, applications })
})

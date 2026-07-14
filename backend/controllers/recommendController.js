import asyncHandler from 'express-async-handler'
import Job from '../models/Job.js'
import { filterByMinMatch } from '../utils/skillMatchEngine.js'

// @desc    Get jobs recommended for the logged-in student, ranked by skill match
// @route   GET /api/recommend/jobs
// @access  Private (student)
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    res.status(403)
    throw new Error('Only students can view job recommendations')
  }

  if (!req.user.skills || req.user.skills.length === 0) {
    return res.json({ success: true, jobs: [] })
  }

  // Pull active jobs that share at least one skill — keeps the DB query light
  // before ranking precisely in JS.
  const candidateJobs = await Job.find({
    isActive: true,
    requiredSkills: { $in: req.user.skills.map((s) => new RegExp(`^${s}$`, 'i')) },
  })
    .populate('postedBy', 'name companyName')
    .limit(100)

  const ranked = filterByMinMatch(candidateJobs, req.user.skills, 20).slice(0, 20)

  res.json({ success: true, jobs: ranked })
})

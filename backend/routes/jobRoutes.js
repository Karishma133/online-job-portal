import express from 'express'
import {
  getJobs, getJobById, createJob, updateJob, deleteJob,
  getMyJobs, getJobApplicants,
} from '../controllers/jobController.js'
import { protect, optionalAuth } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Public (with optional auth so match % can be attached for logged-in students)
router.get('/', optionalAuth, getJobs)

// Private — must come before /:id to avoid being captured by the param route
router.get('/my', protect, authorize('recruiter'), getMyJobs)

router.get('/:id', optionalAuth, getJobById)
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants)

router.post('/', protect, authorize('recruiter'), createJob)
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob)
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob)

export default router

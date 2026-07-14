import express from 'express'
import {
  applyToJob, withdrawApplication, updateApplicationStatus,
  getInterviewRoom, getUpcomingInterviews,
} from '../controllers/applicationController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/:jobId', protect, authorize('student'), applyToJob)
router.delete('/:appId', protect, authorize('student'), withdrawApplication)
router.put('/:appId/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus)

// Live interview
router.get('/upcoming-interviews',   protect, authorize('recruiter', 'admin'), getUpcomingInterviews)
router.get('/interview/:appId',      protect, getInterviewRoom)

export default router

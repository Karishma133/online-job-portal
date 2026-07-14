import express from 'express'
import { getRecommendedJobs } from '../controllers/recommendController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/jobs', protect, authorize('student'), getRecommendedJobs)

export default router

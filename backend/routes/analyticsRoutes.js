import express from 'express'
import { getAdminAnalytics, getRecruiterAnalytics } from '../controllers/analyticsController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()
router.get('/admin',     protect, authorize('admin'),     getAdminAnalytics)
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterAnalytics)

export default router

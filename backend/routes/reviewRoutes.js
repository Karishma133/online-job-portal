import express from 'express'
import { getCompanyReviews, createReview, deleteReview } from '../controllers/reviewController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/:company', getCompanyReviews)
router.post('/', protect, authorize('student'), createReview)
router.delete('/:id', protect, deleteReview)

export default router

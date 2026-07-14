import express from 'express'
import {
  updateProfile, uploadResume, uploadAvatar, getMyApplications,
  getATSScore, toggleSaveJob, getSavedJobs, getAllUsers, deleteUser,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.put('/profile',              protect, updateProfile)
router.post('/resume',              protect, authorize('student'), upload.single('resume'), uploadResume)
router.post('/avatar',              protect, upload.single('avatar'), uploadAvatar)
router.get('/applications',         protect, authorize('student'), getMyApplications)
router.post('/ats-score',           protect, getATSScore)
router.post('/saved-jobs/:jobId',   protect, authorize('student'), toggleSaveJob)
router.get('/saved-jobs',           protect, authorize('student'), getSavedJobs)
router.get('/all',                  protect, authorize('admin'), getAllUsers)
router.delete('/:id',               protect, authorize('admin'), deleteUser)

export default router

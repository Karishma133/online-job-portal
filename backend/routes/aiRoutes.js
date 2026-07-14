import express from 'express'
import { analyzeResume, generateCoverLetter, generateInterviewQuestions, suggestSkills } from '../controllers/aiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/analyze-resume',       protect, analyzeResume)
router.post('/cover-letter',         protect, generateCoverLetter)
router.post('/interview-questions',  protect, generateInterviewQuestions)
router.post('/suggest-skills',       protect, suggestSkills)

export default router

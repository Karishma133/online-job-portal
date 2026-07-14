import express from 'express'
import passport from 'passport'
import { registerUser, loginUser, getMe, googleCallback, forgotPassword, resetPassword } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Standard auth
router.post('/register', registerUser)
router.post('/login',    loginUser)
router.get('/me',        protect, getMe)

// Password reset
router.post('/forgot-password',        forgotPassword)
router.put('/reset-password/:token',   resetPassword)

// Google OAuth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env, then restart the server.',
    })
  }
  next()
}, passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`, session: false }),
  googleCallback
)

export default router

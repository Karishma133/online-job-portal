import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'

// @desc    Register
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) {
    res.status(400); throw new Error('Please provide name, email and password')
  }
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    res.status(400); throw new Error('An account with this email already exists')
  }
  const user = await User.create({
    name, email, password,
    role: ['student', 'recruiter'].includes(role) ? role : 'student',
  })
  res.status(201).json({ success: true, token: generateToken(user._id), user })
})

// @desc    Login
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400); throw new Error('Please provide email and password')
  }
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password')
  }
  if (!user.isActive) {
    res.status(403); throw new Error('Your account has been deactivated')
  }
  res.json({ success: true, token: generateToken(user._id), user })
})

// @desc    Get me
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
export const googleCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id)
  // Redirect to frontend with token
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  res.redirect(`${clientUrl}/auth/google/success?token=${token}&role=${req.user.role}`)
})

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) { res.status(400); throw new Error('Please provide your email') }

  const user = await User.findOne({ email: email.toLowerCase() })

  // Always respond with the same generic success message, whether or not the
  // email exists — this stops someone from using this endpoint to check
  // which emails are registered.
  const genericResponse = {
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  }

  if (!user) return res.json(genericResponse)
  if (!user.password) {
    // Account only has Google sign-in, no password to reset
    return res.json(genericResponse)
  }

  const rawToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`

  const sent = await sendEmail(user.email, emailTemplates.passwordReset(user.name, resetUrl))

  if (!sent) {
    // Email didn't go out (e.g. EMAIL_USER/PASS not configured) — undo the
    // token so it can't be used, and tell the caller plainly rather than
    // pretending an email is on its way.
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    res.status(500)
    throw new Error('Could not send reset email. Email sending is not configured on this server (EMAIL_USER/EMAIL_PASS missing in .env).')
  }

  res.json(genericResponse)
})

// @desc    Reset password using the token from the emailed link
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 6) {
    res.status(400); throw new Error('Password must be at least 6 characters')
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire')

  if (!user) {
    res.status(400)
    throw new Error('This reset link is invalid or has expired. Please request a new one.')
  }

  user.password = password // pre-save hook hashes this
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  res.json({ success: true, token: generateToken(user._id), user })
})

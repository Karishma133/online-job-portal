import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

/**
 * Protects routes — verifies JWT and attaches the user to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      res.status(401)
      throw new Error('User no longer exists')
    }
    if (!req.user.isActive) {
      res.status(403)
      throw new Error('Account has been deactivated')
    }

    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized, token failed')
  }
})

/**
 * Optional auth — attaches req.user if token is valid, but doesn't block the request.
 * Useful for routes like GET /jobs where logged-out users can still browse.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id)
    } catch {
      req.user = null
    }
  }
  next()
})

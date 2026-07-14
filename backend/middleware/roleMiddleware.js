/**
 * Restricts a route to specific roles.
 * Usage: router.post('/jobs', protect, authorize('recruiter'), createJob)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401)
      throw new Error('Not authorized')
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403)
      throw new Error(`Role '${req.user.role}' is not allowed to access this resource`)
    }
    next()
  }
}

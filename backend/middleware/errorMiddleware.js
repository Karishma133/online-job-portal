/**
 * Catches requests to undefined routes.
 */
export const notFound = (req, res, next) => {
  res.status(404)
  next(new Error(`Route not found - ${req.originalUrl}`))
}

/**
 * Centralized error handler. Any error thrown (or passed to next(err))
 * anywhere in the app ends up here.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Resource not found'
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0]
    message = field ? `${field} already exists` : 'Duplicate field value'
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = 'File too large (max 5MB)'
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const notFound = (req, res, next) => {
  const error = new AppError(`Resource Not Found - ${req.originalUrl}`, 404)
  next(error)
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)
  let message = err.message || 'Internal Server Error'

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Requested entity or record could not be found'
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `An entry with this ${field} already exists.`
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  // If error has a known operational validation pattern but no explicit status code, treat as 400
  const validationKeywords = [
    'verification',
    'code',
    'sold out',
    'unavailable',
    'required',
    'invalid',
    'expired',
    'too many',
    'mobile number',
    'quantity',
    'cart is empty',
    'please select'
  ]

  if (statusCode === 500 && validationKeywords.some((kw) => message.toLowerCase().includes(kw))) {
    statusCode = 400
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
}

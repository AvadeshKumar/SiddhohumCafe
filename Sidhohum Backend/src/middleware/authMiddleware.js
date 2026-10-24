import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AdminAccount from '../models/AdminAccount.js'

export const protectCustomer = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'siddhohum_cafe_dev_jwt_secret_key_2026_super_secure'
      )

      const user = await User.findById(decoded.id).select('-password')
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account not found' })
      }

      req.user = user
      return next()
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authorization token' })
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization required to access this resource' })
  }
}

export const optionalCustomer = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'siddhohum_cafe_dev_jwt_secret_key_2026_super_secure'
      )
      const user = await User.findById(decoded.id).select('-password')
      if (user) {
        req.user = user
      }
    } catch (err) {
      // Ignore token failure for optional endpoints
    }
  }
  next()
}

export const protectAdmin = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'siddhohum_cafe_dev_jwt_secret_key_2026_super_secure'
      )

      if (decoded.role === 'admin' || decoded.role === 'owner' || decoded.role === 'manager' || decoded.role === 'kitchen') {
        const admin = await AdminAccount.findById(decoded.id)
        if (admin && admin.isActive) {
          req.admin = admin
          return next()
        }

        // Fallback: check if standard user has admin role
        const user = await User.findById(decoded.id)
        if (user && user.role === 'admin') {
          req.admin = user
          return next()
        }
      }

      return res.status(403).json({ success: false, message: 'Access forbidden: Administrator privileges required' })
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired admin session token' })
    }
  }

  return res.status(401).json({ success: false, message: 'Admin authentication required' })
}

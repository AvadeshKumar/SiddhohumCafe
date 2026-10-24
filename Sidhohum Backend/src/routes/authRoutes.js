import express from 'express'
import {
  sendOtp,
  verifyOtp,
  getCustomerProfile,
  updateCustomerProfile,
  addDeliveryAddress,
  deleteDeliveryAddress,
  adminLogin,
  getAdminMe
} from '../controllers/authController.js'
import { protectCustomer, protectAdmin } from '../middleware/authMiddleware.js'
import { otpLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Customer OTP & Auth
router.post('/otp/send', otpLimiter, sendOtp)
router.post('/otp/verify', otpLimiter, verifyOtp)

// Customer Profile (Protected)
router.get('/profile', protectCustomer, getCustomerProfile)
router.put('/profile', protectCustomer, updateCustomerProfile)
router.post('/profile/addresses', protectCustomer, addDeliveryAddress)
router.delete('/profile/addresses/:addressId', protectCustomer, deleteDeliveryAddress)

// Admin Authentication
router.post('/admin/login', adminLogin)
router.get('/admin/me', protectAdmin, getAdminMe)

export default router

import express from 'express'
import {
  validateCart,
  createOrder,
  getOrderById,
  getMyOrders,
  checkRepeatOrder,
  verifyDeliveryByQrToken
} from '../controllers/orderController.js'
import { protectCustomer, optionalCustomer, protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Pre-checkout validation
router.post('/validate-cart', validateCart)

// Place order (optional customer token, supports guests or registered users)
router.post('/', optionalCustomer, createOrder)

// Customer order history
router.get('/my-orders', protectCustomer, getMyOrders)

// Repeat order availability check
router.get('/:orderId/repeat-check', checkRepeatOrder)

// Order tracking / confirmation
router.get('/:id', optionalCustomer, getOrderById)

// Delivery QR verification by staff or admin
router.post('/verify-delivery', protectAdmin, verifyDeliveryByQrToken)

export default router

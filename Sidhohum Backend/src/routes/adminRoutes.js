import express from 'express'
import {
  getDashboardMetrics,
  getLiveOrders,
  updateOrderStatus
} from '../controllers/adminController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protectAdmin)

router.get('/metrics', getDashboardMetrics)
router.get('/orders', getLiveOrders)
router.patch('/orders/:id/status', updateOrderStatus)

export default router

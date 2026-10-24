import Order from '../models/Order.js'
import PaymentRecord from '../models/PaymentRecord.js'
import { emitOrderStatusUpdate } from '../services/socketService.js'
import { processOrderDeliveredRewards } from '../services/orderService.js'

// Admin: Get Kitchen & Sales Dashboard Metrics
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      todayOrders,
      activeOrders,
      preparingOrders,
      outForDelivery,
      deliveredToday,
      cancelledOrders,
      salesData
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ['PLACED', 'ACCEPTED'] } }),
      Order.countDocuments({ status: { $in: ['PREPARING', 'READY'] } }),
      Order.countDocuments({ status: 'OUT_FOR_DELIVERY' }),
      Order.countDocuments({ status: 'DELIVERED', createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ['CANCELLED', 'REJECTED'] }, createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { status: 'DELIVERED', createdAt: { $gte: today } } },
        { $group: { _id: null, totalSales: { $sum: '$finalTotal' } } }
      ])
    ])

    const totalRevenueToday = salesData.length > 0 ? salesData[0].totalSales : 0

    res.status(200).json({
      success: true,
      metrics: {
        todayOrders,
        activeOrders,
        preparingOrders,
        outForDelivery,
        deliveredToday,
        cancelledOrders,
        totalRevenueToday
      }
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Get live orders feed with filtering
export const getLiveOrders = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query
    const filter = {}

    if (status && status !== 'all') {
      if (status === 'active') {
        filter.status = { $in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] }
      } else {
        filter.status = status.toUpperCase()
      }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.status(200).json({ success: true, count: orders.length, orders })
  } catch (error) {
    next(error)
  }
}

// Admin: Update Order Lifecycle Status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, reason, staffName } = req.body

    const validStatuses = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'REJECTED',
      'CANCELLED'
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` })
    }

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const previousStatus = order.status
    order.status = status

    if (status === 'ACCEPTED') {
      order.acceptedAt = new Date()
    } else if (status === 'PREPARING') {
      order.preparingAt = new Date()
    } else if (status === 'READY') {
      order.readyAt = new Date()
    } else if (status === 'OUT_FOR_DELIVERY') {
      order.outForDeliveryAt = new Date()
    } else if (status === 'DELIVERED') {
      order.deliveredAt = new Date()
      order.paymentStatus = 'COLLECTED'
      order.deliveryVerification = {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: staffName || req.admin?.name || 'Kitchen Staff',
        verificationMethod: 'MANUAL_OVERRIDE'
      }

      await PaymentRecord.findOneAndUpdate(
        { order: order._id },
        { status: 'COLLECTED', collectedAt: new Date(), collectedBy: staffName || req.admin?.name || 'Staff' }
      )

      await processOrderDeliveredRewards(order)
    } else if (status === 'REJECTED') {
      order.rejectionReason = reason || 'Kitchen is currently over capacity'
    } else if (status === 'CANCELLED') {
      order.cancellationReason = reason || 'Cancelled by staff'
      order.cancelledAt = new Date()
    }

    await order.save()

    // Emit live real-time update
    emitOrderStatusUpdate(order)

    res.status(200).json({
      success: true,
      message: `Order status moved from ${previousStatus} to ${status}`,
      order
    })
  } catch (error) {
    next(error)
  }
}

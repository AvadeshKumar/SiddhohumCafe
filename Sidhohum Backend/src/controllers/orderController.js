import Order from '../models/Order.js'
import PaymentRecord from '../models/PaymentRecord.js'
import MenuItem from '../models/MenuItem.js'
import {
  calculateOrderTotals,
  allocateNextQueueToken,
  generateOrderNumber,
  createDeliveryQrToken,
  processOrderDeliveredRewards
} from '../services/orderService.js'
import { emitNewOrder, emitOrderStatusUpdate } from '../services/socketService.js'
import { verifyOtpCode } from '../services/otpService.js'
import CafeSettings from '../models/CafeSettings.js'
import { computeIsOpen } from './settingsController.js'

// Customer: Preview and validate cart pricing & discounts before checkout
export const validateCart = async (req, res, next) => {
  try {
    const { items } = req.body
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' })
    }

    const calculated = await calculateOrderTotals(items)
    res.status(200).json({ success: true, ...calculated })
  } catch (error) {
    next(error)
  }
}

// Customer: Place a new order with Pay on Delivery (Cash or UPI at Delivery)
export const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, deliveryAddress, items, paymentMethod, otpCode } = req.body
    // Prevent new orders when the cafe is closed
const cafeSettings = await CafeSettings.findOne()

if (!cafeSettings) {
  return res.status(503).json({
    success: false,
    message: 'Cafe settings are temporarily unavailable. Please try again.'
  })
}

const isOpen = computeIsOpen(cafeSettings)

if (!isOpen) {
  return res.status(403).json({
    success: false,
    message: 'Sorry, Siddhohum Cafe is currently closed. Please order when we reopen.'
  })
}

    if (!customerName || !customerPhone || !deliveryAddress?.addressLine) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact phone number, and delivery address are required.'
      })
    }

    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.'
      })
    }

    // If OTP code is submitted, verify it
    if (otpCode) {
      await verifyOtpCode(cleanPhone, otpCode, 'order_verification')
    }

    // Always recalculate all prices, discounts, and delivery fee on server
    const totals = await calculateOrderTotals(items)

    const orderNumber = await generateOrderNumber()
    const queueToken = await allocateNextQueueToken()
    const deliveryQrToken = createDeliveryQrToken()

    const order = await Order.create({
      orderNumber,
      queueToken,
      customerId: req.user ? req.user._id : null,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      deliveryAddress: {
        addressLine: deliveryAddress.addressLine.trim(),
        landmark: (deliveryAddress.landmark || '').trim(),
        instructions: (deliveryAddress.instructions || '').trim()
      },
      items: totals.items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      discountDetails: totals.discountDetails,
      deliveryFee: totals.deliveryFee,
      finalTotal: totals.finalTotal,
      paymentMethod: paymentMethod === 'UPI_ON_DELIVERY' ? 'UPI_ON_DELIVERY' : 'COD',
      paymentStatus: 'PENDING',
      status: 'PLACED',
      estimatedDeliveryMinutes: totals.estimatedDeliveryMinutes || 10,
      deliveryQrToken,
      placedAt: new Date()
    })

    // Create corresponding payment ledger record
    await PaymentRecord.create({
      order: order._id,
      orderNumber: order.orderNumber,
      amount: order.finalTotal,
      paymentMethod: order.paymentMethod,
      status: 'PENDING'
    })

    // Emit live notification to kitchen/admin
    emitNewOrder(order)

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        queueToken: order.queueToken,
        status: order.status,
        finalTotal: order.finalTotal,
        paymentMethod: order.paymentMethod,
        estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
        deliveryQrToken: order.deliveryQrToken,
        placedAt: order.placedAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// Customer & Admin: Get single order details
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    // Customer security: if logged in as customer, ensure customer owns this order
    if (req.user && order.customerId && order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this order' })
    }

    res.status(200).json({ success: true, order })
  } catch (error) {
    next(error)
  }
}

// Customer: Get order history
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: orders.length, orders })
  } catch (error) {
    next(error)
  }
}

// Customer: Repeat order check (checks availability & fresh prices)
export const checkRepeatOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const previousOrder = await Order.findById(orderId)

    if (!previousOrder) {
      return res.status(404).json({ success: false, message: 'Previous order not found' })
    }

    const availableItems = []
    const unavailableItems = []

    for (const item of previousOrder.items) {
      const currentDish = await MenuItem.findById(item.menuItem)
      if (currentDish && currentDish.isAvailable) {
        availableItems.push({
          menuItemId: currentDish._id,
          name: currentDish.name,
          creativeName: currentDish.creativeName,
          price: currentDish.price, // Fresh current price
          quantity: item.quantity,
          isVeg: currentDish.isVeg,
          imageUrl: currentDish.imageUrl
        })
      } else {
        unavailableItems.push({
          name: item.name,
          reason: !currentDish ? 'No longer on menu' : 'Currently sold out'
        })
      }
    }

    res.status(200).json({
      success: true,
      availableItems,
      unavailableItems,
      canReorder: availableItems.length > 0
    })
  } catch (error) {
    next(error)
  }
}

// Staff / Admin: Verify Delivery via QR code or manual token entry
export const verifyDeliveryByQrToken = async (req, res, next) => {
  try {
    const { qrToken, staffName } = req.body
    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR verification token is required' })
    }

    const order = await Order.findOne({ deliveryQrToken: qrToken.trim() })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid delivery QR token. Order could not be verified.'
      })
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'This delivery QR token has already been verified and completed.'
      })
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete delivery for ${order.status.toLowerCase()} order.`
      })
    }

    // Advance order to DELIVERED
    order.status = 'DELIVERED'
    order.deliveredAt = new Date()
    order.paymentStatus = 'COLLECTED'
    order.deliveryVerification = {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: staffName || req.admin?.name || 'Staff Member',
      verificationMethod: 'QR_SCAN'
    }

    await order.save()

    // Update payment record
    await PaymentRecord.findOneAndUpdate(
      { order: order._id },
      {
        status: 'COLLECTED',
        collectedAt: new Date(),
        collectedBy: staffName || req.admin?.name || 'Delivery Partner'
      }
    )

    // Process customer reward points
    await processOrderDeliveredRewards(order)

    // Emit live update
    emitOrderStatusUpdate(order)

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} successfully verified and completed!`,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        queueToken: order.queueToken,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveredAt: order.deliveredAt
      }
    })
  } catch (error) {
    next(error)
  }
}

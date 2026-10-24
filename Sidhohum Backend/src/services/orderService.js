import crypto from 'crypto'
import MenuItem from '../models/MenuItem.js'
import Order from '../models/Order.js'
import CafeSettings from '../models/CafeSettings.js'
import User from '../models/User.js'
import RewardLedger from '../models/RewardLedger.js'

// Helper: Get today's date formatted as YYYYMMDD in Cafe Timezone
const getCafeDateString = () => {
  const tz = process.env.CAFE_TIMEZONE || 'Asia/Kolkata'
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(now).replace(/-/g, '')
}

// Helper: Get day of week (0=Sun, 1=Mon, ..., 6=Sat) in Cafe Timezone
const getCafeDayOfWeek = () => {
  const tz = process.env.CAFE_TIMEZONE || 'Asia/Kolkata'
  const now = new Date()
  const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days.indexOf(dayStr)
}

// Atomic Queue Token Allocator (1-100 rolling counter)
export const allocateNextQueueToken = async () => {
  // Find the highest queue token issued today
  const todayStr = getCafeDateString()
  const regex = new RegExp(`^SID-${todayStr}-`)

  const lastOrderToday = await Order.findOne({ orderNumber: regex })
    .sort({ createdAt: -1 })
    .select('queueToken')

  if (!lastOrderToday || !lastOrderToday.queueToken) {
    return 1
  }

  const next = lastOrderToday.queueToken + 1
  return next > 100 ? 1 : next
}

// Generate unique order number (e.g. SID-20261023-1492)
export const generateOrderNumber = async () => {
  const dateStr = getCafeDateString()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
  return `SID-${dateStr}-${randomSuffix}`
}

// Recalculate and validate prices completely server-side
export const calculateOrderTotals = async (rawItems) => {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Please select at least one item to place an order.')
  }

  const settings = (await CafeSettings.findOne()) || new CafeSettings()

  let subtotal = 0
  const validatedItems = []

  for (const item of rawItems) {
    const menuItemId = item.menuItemId || item._id || item.id
    const quantity = parseInt(item.quantity || item.qty, 10)

    if (!quantity || quantity <= 0) {
      throw new Error(`Invalid quantity for item ${item.name || menuItemId}`)
    }

    const dbDish = await MenuItem.findById(menuItemId)
    if (!dbDish) {
      throw new Error(`Item ${item.name || menuItemId} is not on the menu.`)
    }

    if (!dbDish.isAvailable) {
      throw new Error(`"${dbDish.name}" is currently sold out and unavailable.`)
    }

    const itemTotal = dbDish.price * quantity
    subtotal += itemTotal

    validatedItems.push({
      menuItem: dbDish._id,
      name: dbDish.name,
      creativeName: dbDish.creativeName || '',
      price: dbDish.price,
      quantity,
      itemTotal,
      isVeg: dbDish.isVeg
    })
  }

  // Weekday discount calculation
  let discount = 0
  let discountDetails = { description: '', percentage: 0, amount: 0 }

  const todayDay = getCafeDayOfWeek()
  const offer = settings.weekdayOffer

  if (
    offer &&
    offer.isActive &&
    offer.applicableDays.includes(todayDay) &&
    subtotal >= (offer.minOrderAmount || 0)
  ) {
    const calculatedDiscount = Math.round((subtotal * offer.discountPercent) / 100)
    discount = Math.min(calculatedDiscount, offer.maxDiscountAmount || 100)
    discountDetails = {
      description: `${offer.title || 'Weekday Special'} (${offer.discountPercent}% Off)`,
      percentage: offer.discountPercent,
      amount: discount
    }
  }

  // Delivery fee calculation
  let deliveryFee = settings.deliveryFee || 0
  if (subtotal >= (settings.freeDeliveryThreshold || 199)) {
    deliveryFee = 0
  }

  const finalTotal = Math.max(0, subtotal - discount + deliveryFee)

  return {
    items: validatedItems,
    subtotal,
    discount,
    discountDetails,
    deliveryFee,
    finalTotal,
    estimatedDeliveryMinutes: settings.deliveryEstimateMinutes || 10
  }
}

// Generate unguessable crypto delivery QR token
export const createDeliveryQrToken = () => {
  return crypto.randomBytes(20).toString('hex')
}

// Process loyalty rewards when order is marked DELIVERED
export const processOrderDeliveredRewards = async (order) => {
  if (order.rewardPointsProcessed || !order.customerId) {
    return null
  }

  const user = await User.findById(order.customerId)
  if (!user) return null

  const settings = (await CafeSettings.findOne()) || new CafeSettings()
  const rewardRule = settings.rewardConfig || {
    isActive: true,
    ordersRequired: 5,
    pointsAwarded: 30
  }

  if (!rewardRule.isActive) {
    order.rewardPointsProcessed = true
    await order.save()
    return null
  }

  // Count delivered qualifying orders for this customer
  const deliveredCount = await Order.countDocuments({
    customerId: user._id,
    status: 'DELIVERED'
  })

  user.completedOrdersCount = deliveredCount

  // Check if milestone was reached (e.g. every 5 orders)
  if (deliveredCount > 0 && deliveredCount % rewardRule.ordersRequired === 0) {
    // Check if points were already issued for this milestone order
    const existingAward = await RewardLedger.findOne({
      user: user._id,
      order: order._id
    })

    if (!existingAward) {
      const pointsToAdd = rewardRule.pointsAwarded || 30
      user.rewardPoints = (user.rewardPoints || 0) + pointsToAdd

      await RewardLedger.create({
        user: user._id,
        order: order._id,
        pointsChange: pointsToAdd,
        balanceAfter: user.rewardPoints,
        reason: `Milestone Reward: Completed ${deliveredCount} Orders (+${pointsToAdd} pts)`
      })

      console.log(`🎁 Awarded ${pointsToAdd} points to ${user.name} for 5-order milestone!`)
    }
  }

  await user.save()
  order.rewardPointsProcessed = true
  await order.save()

  return user.rewardPoints
}

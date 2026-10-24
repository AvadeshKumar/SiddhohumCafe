import CafeSettings from '../models/CafeSettings.js'
import { emitCafeSettingsUpdate } from '../services/socketService.js'

// Helper: Calculate whether cafe is currently open
const computeIsOpen = (settings) => {
  if (settings.isOpenOverride !== null && settings.isOpenOverride !== undefined) {
    return settings.isOpenOverride
  }

  const tz = process.env.CAFE_TIMEZONE || 'Asia/Kolkata'
  const now = new Date()

  // Format current time as HH:mm in cafe timezone
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const currentTime = timeFormatter.format(now) // e.g. "14:30"
  const openTime = settings.openingTime || '10:00'
  const closeTime = settings.closingTime || '21:00'

  return currentTime >= openTime && currentTime <= closeTime
}

// Public: Get cafe settings and live open status
export const getSettings = async (req, res, next) => {
  try {
    let settings = await CafeSettings.findOne()
    if (!settings) {
      settings = await CafeSettings.create({})
    }

    const isOpen = computeIsOpen(settings)

    res.status(200).json({
      success: true,
      settings: {
        cafeName: settings.cafeName,
        tagline: settings.tagline,
        ownerName: settings.ownerName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        mapLink: settings.mapLink,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        isOpen,
        isOpenOverride: settings.isOpenOverride,
        deliveryEstimateMinutes: settings.deliveryEstimateMinutes,
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        minOrderAmount: settings.minOrderAmount,
        weekdayOffer: settings.weekdayOffer,
        rewardConfig: settings.rewardConfig,
        upiDetails: settings.upiDetails,
        heroImages: settings.heroImages
      }
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Update cafe settings
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await CafeSettings.findOne()
    if (!settings) {
      settings = new CafeSettings()
    }

    Object.assign(settings, req.body)
    await settings.save()

    const isOpen = computeIsOpen(settings)
    const updatedPayload = { ...settings.toObject(), isOpen }

    // Emit live update to all browsers
    emitCafeSettingsUpdate(updatedPayload)

    res.status(200).json({
      success: true,
      message: 'Cafe settings updated successfully',
      settings: updatedPayload
    })
  } catch (error) {
    next(error)
  }
}

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'

import api from '../services/api'
import { getSocket } from '../services/socket.js'

const CafeContext = createContext(null)

export const CafeProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    cafeName: 'Siddhohum Cafe',
    tagline: 'Artisan Coffee & Express Street Gourmet',
    ownerName: 'Ashish & Rahul',
    phone: '+91 8868977399',
    email: 'contact@siddhohumcafe.com',
    address:
      'opp. Mega county, near The bend restaurant, Salan Gaon, Bhagwant Pur, Dehradun, Kirsali Gaon, Uttarakhand 248009',
    mapLink: 'https://maps.google.com/?q=Siddhohum+Cafe',
    openingTime: '10:00',
    closingTime: '21:00',
    isOpen: true,
    deliveryEstimateMinutes: 10,
    deliveryFee: 0,
    freeDeliveryThreshold: 199,
    minOrderAmount: 40,
    weekdayOffer: {
      isActive: true,
      title: 'Weekday Special 10% Off',
      discountPercent: 10,
      applicableDays: [1, 2, 3, 4, 5],
      minOrderAmount: 99,
      maxDiscountAmount: 100
    },
    rewardConfig: {
      isActive: true,
      ordersRequired: 5,
      pointsAwarded: 30
    },
    upiDetails: {
      upiId: 'siddhohumcafe@okhdfcbank',
      payeeName: 'Siddhohum Cafe',
      instructions: 'Pay via UPI QR at delivery or direct transfer'
    },
    heroImages: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
    ]
  })

  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get('/settings')

      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings
        }))
      }
    } catch (err) {
      console.warn(
        'Using default cafe configuration:',
        err.message
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle the kitchen's open/closed status
  const toggleKitchenStatus = useCallback(async () => {
    const nextOverride = !settings.isOpen

    try {
      const data = await api.put('/settings', {
        isOpenOverride: nextOverride
      })

      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings
        }))
      }

      return data
    } catch (err) {
      console.error('Failed to update kitchen status:', err)
      throw err
    }
  }, [settings.isOpen])

  useEffect(() => {
    fetchSettings()

    const socket = getSocket()

    const handleCafeUpdate = (updatedSettings) => {
      console.log(
        '⚡ Real-time cafe settings update received:',
        updatedSettings
      )

      setSettings((prev) => ({
        ...prev,
        ...updatedSettings
      }))
    }

    socket.on('cafe:updated', handleCafeUpdate)

    return () => {
      socket.off('cafe:updated', handleCafeUpdate)
    }
  }, [fetchSettings])

  return (
    <CafeContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        toggleKitchenStatus
      }}
    >
      {children}
    </CafeContext.Provider>
  )
}

export const useCafe = () => {
  const context = useContext(CafeContext)

  if (!context) {
    throw new Error(
      'useCafe must be used within a CafeProvider'
    )
  }

  return context
}
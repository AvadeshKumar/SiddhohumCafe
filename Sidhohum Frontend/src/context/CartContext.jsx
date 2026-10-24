import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useToast } from './ToastContext'
import { useCafe } from './CafeContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sidhohum_cart')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { showToast } = useToast()
  const { settings } = useCafe()

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidhohum_cart', JSON.stringify(cart))
    } catch (err) {
      console.warn('Failed to persist cart in local storage:', err)
    }
  }, [cart])

  // Subtotal & item counts
  const { subtotal, totalItemsCount, itemsList } = useMemo(() => {
    const list = Object.values(cart)
    let total = 0
    let count = 0
    list.forEach((item) => {
      total += item.price * item.quantity
      count += item.quantity
    })
    return { subtotal: total, totalItemsCount: count, itemsList: list }
  }, [cart])

  // Weekday discount calculation preview
  const estimatedDiscount = useMemo(() => {
    const offer = settings?.weekdayOffer
    if (!offer || !offer.isActive) return 0

    const todayDay = new Date().getDay()
    if (offer.applicableDays?.includes(todayDay) && subtotal >= (offer.minOrderAmount || 0)) {
      const discount = Math.round((subtotal * offer.discountPercent) / 100)
      return Math.min(discount, offer.maxDiscountAmount || 100)
    }
    return 0
  }, [settings, subtotal])

  // Delivery fee preview
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0
    if (subtotal >= (settings?.freeDeliveryThreshold || 199)) return 0
    return settings?.deliveryFee || 0
  }, [settings, subtotal])

  const payableTotal = useMemo(() => {
    return Math.max(0, subtotal - estimatedDiscount + deliveryFee)
  }, [subtotal, estimatedDiscount, deliveryFee])

  // Add Item to cart
  const addToCart = (dish) => {
    const id = dish._id || dish.id
    setCart((prev) => {
      const existing = prev[id]
      const newQty = existing ? existing.quantity + 1 : 1
      return {
        ...prev,
        [id]: {
          menuItemId: id,
          name: dish.name,
          creativeName: dish.creativeName || '',
          price: dish.price,
          quantity: newQty,
          isVeg: dish.isVeg !== undefined ? dish.isVeg : true,
          imageUrl: dish.imageUrl || ''
        }
      }
    })
    showToast(`Added "${dish.name}" to cart`, 'info', 2000)
  }

  // Update quantity (+1 or -1)
  const updateQuantity = (dishId, delta) => {
    setCart((prev) => {
      const existing = prev[dishId]
      if (!existing) return prev

      const nextQty = existing.quantity + delta
      if (nextQty <= 0) {
        const copy = { ...prev }
        delete copy[dishId]
        return copy
      }

      return {
        ...prev,
        [dishId]: {
          ...existing,
          quantity: nextQty
        }
      }
    })
  }

  // Remove Item
  const removeFromCart = (dishId) => {
    setCart((prev) => {
      const copy = { ...prev }
      delete copy[dishId]
      return copy
    })
  }

  // Clear Cart
  const clearCart = () => {
    setCart({})
  }

  // Load items from repeat order
  const loadFromPreviousOrder = (orderItems) => {
    const newCart = {}
    orderItems.forEach((item) => {
      const id = item.menuItemId || item._id
      newCart[id] = {
        menuItemId: id,
        name: item.name,
        creativeName: item.creativeName || '',
        price: item.price,
        quantity: item.quantity,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl || ''
      }
    })
    setCart(newCart)
    showToast('Loaded previous order into your cart!', 'success')
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        itemsList,
        subtotal,
        totalItemsCount,
        estimatedDiscount,
        deliveryFee,
        payableTotal,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadFromPreviousOrder
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

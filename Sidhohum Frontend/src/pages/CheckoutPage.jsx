import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Banknote,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCafe } from '../context/CafeContext'
import { useToast } from '../context/ToastContext'

export const CheckoutPage = () => {
  const { itemsList, clearCart } = useCart()
  const { user } = useAuth()
  const { settings } = useCafe()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Start checkout at the top of the page
useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}, [])

  // Form fields
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [addressLine, setAddressLine] = useState('')
  const [landmark, setLandmark] = useState('')
  const [instructions, setInstructions] = useState('')

  // One payment option: cash or UPI on delivery
  const paymentMethod = 'COD'

  // Server-validated pricing
  const [pricing, setPricing] = useState(null)
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Prefill authenticated user data
  useEffect(() => {
    if (!user) return

    if (!customerName && user.name) {
      setCustomerName(user.name)
    }

    if (!customerPhone && user.phone) {
      setCustomerPhone(user.phone)
    }

    if (user.addresses?.length > 0 && !addressLine) {
      const defaultAddr =
        user.addresses.find((address) => address.isDefault) ||
        user.addresses[0]

      setAddressLine(defaultAddr.addressLine || '')
      setLandmark(defaultAddr.landmark || '')
      setInstructions(defaultAddr.instructions || '')
    }
  }, [user])

  // Validate cart prices with backend
  useEffect(() => {
    if (itemsList.length === 0) {
      navigate('/menu')
      return
    }

    let cancelled = false

    const validatePricesWithServer = async () => {
      setValidating(true)
      setValidationError('')

      try {
        const res = await api.post('/orders/validate-cart', {
          items: itemsList,
        })

        if (!cancelled) {
          setPricing(res)
        }
      } catch (err) {
        if (!cancelled) {
          setValidationError(
            err.message ||
              'Cart validation failed. Some dishes may be unavailable.'
          )
        }
      } finally {
        if (!cancelled) {
          setValidating(false)
        }
      }
    }

    validatePricesWithServer()

    return () => {
      cancelled = true
    }
  }, [itemsList, navigate])

  const handleSelectSavedAddress = (address) => {
    setAddressLine(address.addressLine || '')
    setLandmark(address.landmark || '')
    setInstructions(address.instructions || '')
    showToast('Loaded saved address', 'info', 1500)
  }

  // Place order directly without OTP verification
  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'error')
      return
    }

    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10)

    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error')
      return
    }

    if (!addressLine.trim()) {
      showToast('Please enter your delivery address', 'error')
      return
    }

    if (validating) {
      showToast('Please wait while your cart is being validated', 'info')
      return
    }

    if (validationError || !pricing) {
      showToast(
        validationError || 'Unable to validate your cart. Please try again.',
        'error'
      )
      return
    }

    setSubmitting(true)

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: {
          addressLine: addressLine.trim(),
          landmark: landmark.trim(),
          instructions: instructions.trim(),
        },
        items: itemsList,
        paymentMethod,
      }

      
const res = await api.post('/orders', orderPayload)

console.log('Order API response:', res)

const orderId = res?.order?._id || res?.order?.id

if (!orderId) {
  console.error('Order ID missing from API response:', res)
  showToast('Order placed, but the order ID was not returned.', 'error')
  return
}

clearCart()
showToast('Order placed successfully!', 'success')
window.location.href = `/orders/${orderId}`

    } catch (err) {
      showToast(
        err.message || 'Failed to place your order. Please try again.',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/menu"
          className="text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 p-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <h1 className="text-xl font-display font-extrabold text-stone-900 ml-2">
          Checkout &amp; Delivery
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Delivery Form */}
        <div className="md:col-span-3 space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Delivery Details</span>
            </h2>

            {/* Saved Addresses */}
            {user?.addresses?.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-stone-100">
                <span className="text-xs text-stone-500 font-medium">
                  Use Saved Address:
                </span>

                <div className="flex flex-wrap gap-2">
                  {user.addresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(address)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-amber-700" />
                      <span>{address.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Your Full Name *
                </label>

                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  10-Digit Mobile Number *
                </label>

                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, ''))
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Delivery Address *
                </label>

                <textarea
                  rows={2}
                  required
                  placeholder="Flat/House number, building name, street address..."
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
                />
              </div>

              {/* Landmark and Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nearby Landmark
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Opposite City Park"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Kitchen / Driver Notes
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Less spicy, ring bell"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Single Payment Option */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-700" />
              <span>Payment Method</span>
            </h2>

            <div className="p-3.5 rounded-2xl border border-amber-600 bg-amber-50/80 ring-1 ring-amber-600 flex items-start gap-3">
              <Banknote className="w-5 h-5 text-amber-700 shrink-0" />

              <div>
                <span className="font-bold text-xs text-stone-900 block">
                  Pay on Delivery
                </span>

                <p className="text-[11px] text-stone-500 mt-1">
                  Pay by cash or UPI when your order arrives.
                </p>
              </div>

              <ShieldCheck className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Bill Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 sticky top-20">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              Bill Summary
            </h2>

            {/* Validation Error */}
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Items Summary */}
            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
              {itemsList.map((item) => (
                <div
                  key={item.menuItemId}
                  className="py-2 flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />

                    <span className="font-semibold text-stone-800 truncate">
                      {item.name}{' '}
                      <span className="text-stone-400 font-normal">
                        x{item.quantity}
                      </span>
                    </span>
                  </div>

                  <span className="font-bold text-stone-900 ml-2">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800">
                  ₹{pricing ? pricing.subtotal : '...'}
                </span>
              </div>

              {pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Weekday Offer (10%)</span>
                  <span>- ₹{pricing.discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>
                  {pricing?.deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold text-[10px] uppercase">
                      FREE
                    </span>
                  ) : (
                    `₹${pricing?.deliveryFee ?? '...'}`
                  )}
                </span>
              </div>

              <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between items-baseline font-bold text-stone-900">
                <span className="font-display text-base">Final Amount</span>
                <span className="text-xl font-extrabold font-display text-amber-900">
                  ₹{pricing ? pricing.finalTotal : '...'}
                </span>
              </div>
            </div>

            {/* Place Order */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || validating || !!validationError}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-3.5 rounded-2xl shadow-lg text-xs transition transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Banknote className="w-4 h-4 text-stone-950" />
              <span>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

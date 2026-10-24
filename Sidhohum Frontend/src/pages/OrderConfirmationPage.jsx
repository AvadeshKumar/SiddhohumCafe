import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { Sparkles } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  PackageCheck,
  AlertTriangle,
  QrCode,
  ArrowLeft
} from 'lucide-react'
import api from '../services/api'
import { getSocket } from '../services/socket.js'

const statusOrder = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
]

const statusLabels = {
  PLACED: { label: 'Order Placed', desc: 'Received by Siddhohum kitchen', icon: CheckCircle2 },
  ACCEPTED: { label: 'Accepted', desc: 'Kitchen confirmed ticket', icon: ChefHat },
  PREPARING: { label: 'Preparing Fresh', desc: 'Artisan cooking in progress', icon: Sparkles },
  READY: { label: 'Ready for Pickup', desc: 'Packed & steam-sealed', icon: PackageCheck },
  OUT_FOR_DELIVERY: { label: 'Out for Express Delivery', desc: 'Delivery partner on the way', icon: Bike },
  DELIVERED: { label: 'Delivered', desc: 'Order verified & handed over', icon: CheckCircle2 }
}

export const OrderConfirmationPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(600) // 10 mins

  // Fetch initial order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.order)

        // Calculate countdown based on placedAt and estimatedDeliveryMinutes
        if (res.order.placedAt && res.order.status !== 'DELIVERED') {
          const placedTime = new Date(res.order.placedAt).getTime()
          const totalDuration = (res.order.estimatedDeliveryMinutes || 10) * 60 * 1000
          const elapsed = Date.now() - placedTime
          const remaining = Math.max(0, Math.floor((totalDuration - elapsed) / 1000))
          setRemainingSeconds(remaining)
        }

        // Fire celebratory confetti if newly placed
        if (res.order.status === 'PLACED') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      } catch (err) {
        setError(err.message || 'Could not find this order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  // Live Socket Updates
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join:order', id)

    socket.on('order:updated', (payload) => {
      console.log('⚡ Live order update received:', payload)
      setOrder((prev) => (prev ? { ...prev, ...payload } : prev))

      if (payload.status === 'DELIVERED') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        })
      }
    })

    return () => {
      socket.emit('leave:order', id)
      socket.off('order:updated')
    }
  }, [id])

  // Countdown timer interval
  useEffect(() => {
    if (!order || order.status === 'DELIVERED' || order.status === 'CANCELLED' || remainingSeconds <= 0) return
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [order, remainingSeconds])

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-bold">Connecting to live order tracker...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-6 rounded-3xl border border-stone-200 space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-display font-bold text-base text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500">{error || 'Unable to retrieve tracking details.'}</p>
        <Link to="/menu" className="inline-block bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
          Back to Menu
        </Link>
      </div>
    )
  }

  const currentStatusIndex = statusOrder.indexOf(order.status)
  const isTerminated = order.status === 'CANCELLED' || order.status === 'REJECTED'

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs} mins`
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">

      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/menu"
          className="text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
        <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
          Order #{order.orderNumber}
        </span>
      </div>

      {/* Main Order Status Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-md text-center space-y-5">

        {/* Token Badge */}
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
            Kitchen Queue Token
          </span>
          <h2 className="text-5xl font-extrabold font-display text-amber-900 mt-2">
            #{order.queueToken}
          </h2>
          <p className="text-xs text-stone-500">
            {isTerminated
              ? `Order ${order.status.toLowerCase()}`
              : order.status === 'DELIVERED'
                ? 'Order successfully delivered & verified!'
                : 'Your ticket is in the Siddhohum kitchen queue.'}
          </p>
        </div>

        {/* Cancellation or Rejection Banner */}
        {isTerminated && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs space-y-1">
            <p className="font-bold">
              Order {order.status === 'REJECTED' ? 'Rejected by Kitchen' : 'Cancelled'}
            </p>
            <p className="text-[11px] text-rose-700">
              {order.rejectionReason || order.cancellationReason || 'Please contact cafe for assistance.'}
            </p>
          </div>
        )}

        {/* 10-Minute Express Countdown Bar (If Active) */}
        {!isTerminated && order.status !== 'DELIVERED' && (
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                Estimated Express Arrival
              </span>
              <span className="font-mono text-sm">{formatTimer(remainingSeconds)}</span>
            </div>

            <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{
                  width: `${Math.max(
                    5,
                    Math.min(100, (1 - remainingSeconds / ((order.estimatedDeliveryMinutes || 10) * 60)) * 100)
                  )}%`
                }}
              />
            </div>
            <p className="text-[10px] text-amber-800/80 italic">
              Estimated local delivery target window based on neighborhood proximity.
            </p>
          </div>
        )}

        {/* Status Lifecycle Timeline */}
        {!isTerminated && (
          <div className="text-left space-y-3 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
              Preparation Progress
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {statusOrder.map((statusKey, idx) => {
                const info = statusLabels[statusKey]
                const Icon = info.icon
                const isPassed = currentStatusIndex >= idx
                const isCurrent = currentStatusIndex === idx

                return (
                  <div key={statusKey} className="relative flex items-start gap-3 pl-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${isCurrent
                          ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow'
                          : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-400'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${isCurrent
                            ? 'text-amber-900 font-extrabold'
                            : isPassed
                              ? 'text-stone-900'
                              : 'text-stone-400'
                          }`}
                      >
                        {info.label}
                      </h4>
                      <p className="text-[11px] text-stone-500">{info.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Secure Delivery Verification QR */}
        {!isTerminated && order.status !== 'DELIVERED' && (
          <div className="border-t border-stone-100 pt-5 space-y-2">
            <p className="text-xs font-extrabold text-stone-800 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-700" />
              <span>Contactless Delivery Verification QR</span>
            </p>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              Present this unpredictable QR token to the delivery partner upon arrival for verification:
            </p>

            <div className="p-3 bg-white border border-stone-200 inline-block rounded-2xl shadow-sm mx-auto">
              <QRCodeSVG
                value={JSON.stringify({
                  token: order.deliveryQrToken,
                  orderNumber: order.orderNumber
                })}
                size={140}
                level="M"
              />
            </div>

            <div className="text-[10px] font-mono text-stone-400">
              Verification Token: {order.deliveryQrToken?.slice(0, 8)}...
            </div>
          </div>
        )}

      </div>

      {/* Order Item & Payment Details Card */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-3 text-xs">
        <h3 className="font-extrabold uppercase tracking-wider text-stone-500">
          Order Items & Receipt
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-2 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900">{item.name}</span>
                <span className="text-stone-400 font-medium ml-1">x{item.quantity}</span>
              </div>
              <span className="font-bold text-stone-900">₹{item.itemTotal}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-2 space-y-1.5 text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-800">₹{order.subtotal}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Weekday Discount</span>
              <span>- ₹{order.discount}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>

          <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-dashed border-stone-200 text-sm">
            <span>Total Payable</span>
            <span className="text-base font-extrabold text-amber-900 font-display">
              ₹{order.finalTotal}
            </span>
          </div>

          <div className="flex justify-between text-[11px] pt-1 text-stone-500">
            <span>Payment Mode:</span>
            <span className="font-bold text-stone-800">
              {order.paymentMethod === 'UPI_ON_DELIVERY' ? 'UPI QR at Delivery' : 'Cash on Delivery'} (
              {order.paymentStatus})
            </span>
          </div>

          <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100">
            <span className="font-bold text-stone-700 block">Deliver To:</span>
            <p>{order.deliveryAddress?.addressLine}</p>
            {order.deliveryAddress?.landmark && <p>Near: {order.deliveryAddress.landmark}</p>}
          </div>
        </div>
      </div>

    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BellOff,
  ChefHat,
  PackageCheck,
  Bike,
  Phone,
  QrCode,
  Utensils,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react'
import api from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useCafe } from '../../context/CafeContext'

// Web Audio API notification chime generator
const playKitchenChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch (e) {
    // Audio context may be restricted by browser until user gesture
  }
}

export const AdminDashboard = () => {
  const { admin, adminLogout, isAdminAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { settings, toggleKitchenStatus } = useCafe()
 

  const [metrics, setMetrics] = useState({
    todayOrders: 0,
    activeOrders: 0,
    preparingOrders: 0,
    outForDelivery: 0,
    deliveredToday: 0,
    cancelledOrders: 0,
    totalRevenueToday: 0
  })

  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('active') // active, preparing, out, delivered, all
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Rejection Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Delivery QR Verification Modal State
  const [qrModalOrder, setQrModalOrder] = useState(null)
  const [inputQrToken, setInputQrToken] = useState('')
  const [verifyingQr, setVerifyingQr] = useState(false)

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login')
    }
  }, [isAdminAuthenticated, navigate])

  // Fetch Dashboard Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await api.get('/admin/metrics')
      if (res.metrics) setMetrics(res.metrics)
    } catch (err) {
      console.warn('Failed to load metrics:', err.message)
    }
  }, [])

  // Fetch Orders Feed
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get(`/admin/orders?status=${activeTab}`)
      setOrders(res.orders || [])
    } catch (err) {
      showToast(err.message || 'Failed to load live orders', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeTab, showToast])

  useEffect(() => {
    fetchMetrics()
    fetchOrders()
  }, [fetchMetrics, fetchOrders])

  // Real-time Socket Listener
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join:admin')

    socket.on('order:new', (newOrder) => {
      showToast(`⚡ New Order Received: #${newOrder.orderNumber} (Token #${newOrder.queueToken})`, 'info')
      if (soundEnabled) {
        playKitchenChime()
      }
      fetchMetrics()
      fetchOrders()
    })

    socket.on('order:status_changed', () => {
      fetchMetrics()
      fetchOrders()
    })

    return () => {
      socket.off('order:new')
      socket.off('order:status_changed')
    }
  }, [soundEnabled, fetchMetrics, fetchOrders, showToast])

  // Update Order Status Handler
  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        reason,
        staffName: admin?.name || 'Kitchen Staff'
      })
      showToast(`Order status updated to ${newStatus}`, 'success')
      fetchMetrics()
      fetchOrders()
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error')
    }
  }

  // Handle Delivery Verification by QR Token
  const handleVerifyDelivery = async (e) => {
    e.preventDefault()
    if (!inputQrToken.trim()) return

    setVerifyingQr(true)
    try {
      const res = await api.post('/orders/verify-delivery', {
        qrToken: inputQrToken.trim(),
        staffName: admin?.name || 'Staff'
      })
      showToast(res.message || 'Delivery successfully verified!', 'success')
      setQrModalOrder(null)
      setInputQrToken('')
      fetchMetrics()
      fetchOrders()
    } catch (err) {
      showToast(err.message || 'Invalid delivery verification token', 'error')
    } finally {
      setVerifyingQr(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">

      {/* Top Admin Bar */}
      <div className="bg-[#2D180A] text-white p-4 md:p-6 rounded-3xl shadow-lg border border-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-xl text-white">
              Vendor Control Panel
            </h1>
            
<button
  type="button"
  onClick={async () => {
    try {
      await toggleKitchenStatus()
    } catch {
      alert('Unable to update kitchen status. Please try again.')
    }
  }}
  className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full transition ${
    settings?.isOpen
      ? 'bg-emerald-500 text-white'
      : 'bg-rose-500 text-white'
  }`}
>
  {settings?.isOpen ? 'Kitchen Live' : 'Kitchen Closed'}
</button>

          </div>
          <p className="text-xs text-amber-200/80 mt-0.5">
            Logged in as <strong>{admin?.name || 'Admin'}</strong>
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Notification Chime Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playKitchenChime()
            }}
            className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white/10 hover:bg-white/20 text-stone-300'
            }`}
            title="Toggle audio alert on new orders"
          >
            {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Chime OFF'}</span>
          </button>

          <Link
            to="/admin/menu"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Menu</span>
          </Link>

          <Link
            to="/admin/settings"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </Link>

          <button
            onClick={adminLogout}
            className="text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-stone-400 block">Today's Sales</span>
          <p className="text-xl font-extrabold text-amber-900 font-display mt-0.5">
            ₹{metrics.totalRevenueToday}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-stone-400 block">Today's Orders</span>
          <p className="text-xl font-extrabold text-stone-900 font-display mt-0.5">
            {metrics.todayOrders}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">In Queue</span>
          <p className="text-xl font-extrabold text-amber-600 font-display mt-0.5">
            {metrics.activeOrders}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-orange-600 block">Cooking / Ready</span>
          <p className="text-xl font-extrabold text-orange-600 font-display mt-0.5">
            {metrics.preparingOrders}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-blue-600 block">Out for Delivery</span>
          <p className="text-xl font-extrabold text-blue-600 font-display mt-0.5">
            {metrics.outForDelivery}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block">Delivered Today</span>
          <p className="text-xl font-extrabold text-emerald-600 font-display mt-0.5">
            {metrics.deliveredToday}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Quick QR Scanner Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'active', label: 'Active Queue' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'all', label: 'All Orders' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Delivery QR Verifier Button */}
          <button
            onClick={() => setQrModalOrder({})}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 justify-center transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Verify Handover QR</span>
          </button>

          <button
            onClick={() => {
              fetchMetrics()
              fetchOrders()
            }}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
            title="Refresh order feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Orders Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-stone-200 h-44 skeleton-shimmer" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-2 max-w-md mx-auto">
          <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-display font-bold text-base text-stone-800">
            No orders in this category
          </h3>
          <p className="text-xs text-stone-500">
            New orders placed by customers will automatically alert and display here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => {
            const isPlaced = order.status === 'PLACED'
            const isAccepted = order.status === 'ACCEPTED'
            const isPreparing = order.status === 'PREPARING'
            const isReady = order.status === 'READY'
            const isOut = order.status === 'OUT_FOR_DELIVERY'
            const isDelivered = order.status === 'DELIVERED'
            const isTerminated = order.status === 'CANCELLED' || order.status === 'REJECTED'

            return (
              <div
                key={order._id}
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all space-y-4 flex flex-col justify-between ${
                  isPlaced
                    ? 'border-amber-500 ring-2 ring-amber-400/40'
                    : 'border-stone-200/90'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Queue Token, Order ID & Status */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold font-display text-amber-900">
                          #{order.queueToken}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Placed: {new Date(order.placedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isTerminated
                          ? 'bg-rose-100 text-rose-800'
                          : isPlaced
                          ? 'bg-amber-500 text-stone-950 animate-pulse'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{order.customerName}</span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>+91 {order.customerPhone}</span>
                      </a>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-snug">
                      📍 {order.deliveryAddress?.addressLine}
                      {order.deliveryAddress?.landmark && ` (Near: ${order.deliveryAddress.landmark})`}
                    </p>
                    {order.deliveryAddress?.instructions && (
                      <p className="text-amber-800 text-[11px] font-medium italic">
                        📝 Note: {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>

                  {/* Order Items Snapshot */}
                  <div className="space-y-1.5 text-xs">
                    <p className="font-extrabold uppercase text-[10px] text-stone-400">
                      Items Ordered
                    </p>
                    <div className="space-y-1 divide-y divide-stone-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="pt-1 flex justify-between items-center text-stone-800 font-medium">
                          <span>
                            {item.name} <strong className="text-amber-900">x{item.quantity}</strong>
                          </span>
                          <span className="font-bold">₹{item.itemTotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Payment details */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Total Amount</span>
                      <span className="font-extrabold text-base text-amber-900 font-display">
                        ₹{order.finalTotal}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-stone-500 block text-[10px]">Payment</span>
                      <span className="font-bold text-stone-800">
                        {order.paymentMethod === 'UPI_ON_DELIVERY' ? 'UPI QR at Doorstep' : 'Cash on Delivery'}{' '}
                        ({order.paymentStatus})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Status Action Buttons */}
                {!isTerminated && !isDelivered && (
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                    {/* Placed -> Accept or Reject */}
                    {isPlaced && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs py-2 rounded-xl transition"
                        >
                          Accept Ticket
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalOrder(order)
                            setRejectionReason('')
                          }}
                          className="bg-stone-100 hover:bg-rose-50 text-rose-600 font-bold text-xs px-3 py-2 rounded-xl transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Accepted -> Preparing */}
                    {isAccepted && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {/* Preparing -> Ready */}
                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'READY')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Mark Order Ready</span>
                      </button>
                    )}

                    {/* Ready -> Out for Delivery */}
                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'OUT_FOR_DELIVERY')}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Dispatch (Out for Delivery)</span>
                      </button>
                    )}

                    {/* Out for Delivery -> Quick QR Verifier */}
                    {isOut && (
                      <button
                        onClick={() => {
                          setQrModalOrder(order)
                          setInputQrToken(order.deliveryQrToken || '')
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Verify Delivery QR & Complete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-base text-stone-900">
              Reject Order #{rejectModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-500">
              Please specify the reason for rejecting this order:
            </p>
            <input
              type="text"
              placeholder="e.g. Kitchen at full capacity, item sold out"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800 outline-none focus:border-amber-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(rejectModalOrder._id, 'REJECTED', rejectionReason)
                  setRejectModalOrder(null)
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Token Verification Modal */}
      {qrModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-base text-stone-900">
                Verify Handover QR Token
              </h3>
              <p className="text-xs text-stone-500">
                Scan or enter the customer's delivery verification code:
              </p>
            </div>
            <form onSubmit={handleVerifyDelivery} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Enter 40-character QR token"
                value={inputQrToken}
                onChange={(e) => setInputQrToken(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-mono text-stone-800 outline-none focus:border-emerald-600"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQrModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingQr || !inputQrToken.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
                >
                  {verifyingQr ? 'Verifying...' : 'Verify & Mark Delivered'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

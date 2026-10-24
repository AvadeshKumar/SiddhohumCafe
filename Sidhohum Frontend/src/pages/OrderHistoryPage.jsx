import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth()
  const { loadFromPreviousOrder, setIsDrawerOpen } = useCart()
  const { showToast } = useToast()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reorderingId, setReorderingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders')
        setOrders(res.orders || [])
      } catch (err) {
        showToast(err.message || 'Failed to load order history', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, showToast])

  const handleRepeatOrder = async (orderId) => {
    setReorderingId(orderId)
    try {
      const res = await api.get(`/orders/${orderId}/repeat-check`)
      if (res.availableItems?.length > 0) {
        loadFromPreviousOrder(res.availableItems)
        setIsDrawerOpen(true)
        if (res.unavailableItems?.length > 0) {
          showToast(
            `Notice: ${res.unavailableItems.map((u) => u.name).join(', ')} currently sold out.`,
            'info',
            4000
          )
        }
      } else {
        showToast('All items from this order are currently unavailable.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Could not reorder', 'error')
    } finally {
      setReorderingId(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white p-8 rounded-3xl border border-stone-200 space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-lg text-stone-900">
          Sign In to View Orders
        </h2>
        <p className="text-xs text-stone-500">
          Access your past orders, delivery tracking, and 1-click repeat reordering.
        </p>
        <Link
          to="/profile"
          className="inline-block bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
        >
          Sign In with Phone
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-stone-900">
          Order History & Reorder
        </h1>
        <p className="text-xs text-stone-500">
          View your past orders, active tickets, and repeat your favorites in one click.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 border border-stone-200 h-36 skeleton-shimmer space-y-3">
              <div className="bg-stone-200 h-4 w-1/3 rounded" />
              <div className="bg-stone-200 h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-base text-stone-900">
            No past orders yet
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Your placed orders and delivery tracking will appear right here.
          </p>
          <Link
            to="/menu"
            className="inline-block bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow mt-2"
          >
            Explore Menu & Place Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.status === 'DELIVERED'
            const isTerminated = order.status === 'CANCELLED' || order.status === 'REJECTED'

            return (
              <div
                key={order._id}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Token #{order.queueToken}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isTerminated
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900 animate-pulse'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Items snapshot */}
                <div className="space-y-1 text-xs">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700">
                      <span>
                        {item.name} <span className="text-stone-400">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-stone-900">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>

                {/* Card Footer: Amount and Actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Total Paid</span>
                    <span className="text-base font-extrabold text-amber-900 font-display">
                      ₹{order.finalTotal}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders/${order._id}`}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                    >
                      <span>Track / Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleRepeatOrder(order._id)}
                      disabled={reorderingId === order._id}
                      className="bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{reorderingId === order._id ? 'Checking...' : 'Reorder'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

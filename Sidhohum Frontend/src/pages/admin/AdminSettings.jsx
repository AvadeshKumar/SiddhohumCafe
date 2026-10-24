import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  Clock,
  Zap,
  Tag,
  Award,
  CreditCard,
  Save,
  CheckCircle2
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCafe } from '../../context/CafeContext'
import { useToast } from '../../context/ToastContext'

export const AdminSettings = () => {
  const { isAdminAuthenticated } = useAuth()
  const { settings, refreshSettings } = useCafe()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    cafeName: '',
    tagline: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    openingTime: '08:00',
    closingTime: '23:00',
    deliveryEstimateMinutes: 10,
    deliveryFee: 0,
    freeDeliveryThreshold: 199,
    minOrderAmount: 40,
    weekdayOffer: {
      isActive: true,
      title: 'Weekday Special 10% Off',
      discountPercent: 10,
      minOrderAmount: 99,
      maxDiscountAmount: 100,
      applicableDays: [1, 2, 3, 4, 5]
    },
    rewardConfig: {
      isActive: true,
      ordersRequired: 5,
      pointsAwarded: 30
    },
    upiDetails: {
      upiId: 'siddhohumcafe@okhdfcbank',
      payeeName: 'Siddhohum Cafe',
      instructions: 'Pay via UPI QR at delivery'
    }
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminAuthenticated) navigate('/admin/login')
  }, [isAdminAuthenticated, navigate])

  useEffect(() => {
    if (settings) {
      setForm({
        cafeName: settings.cafeName || 'Siddhohum Cafe',
        tagline: settings.tagline || '',
        ownerName: settings.ownerName || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        openingTime: settings.openingTime || '08:00',
        closingTime: settings.closingTime || '23:00',
        deliveryEstimateMinutes: settings.deliveryEstimateMinutes || 10,
        deliveryFee: settings.deliveryFee || 0,
        freeDeliveryThreshold: settings.freeDeliveryThreshold || 199,
        minOrderAmount: settings.minOrderAmount || 40,
        weekdayOffer: {
          isActive: settings.weekdayOffer?.isActive ?? true,
          title: settings.weekdayOffer?.title || 'Weekday Special 10% Off',
          discountPercent: settings.weekdayOffer?.discountPercent || 10,
          minOrderAmount: settings.weekdayOffer?.minOrderAmount || 99,
          maxDiscountAmount: settings.weekdayOffer?.maxDiscountAmount || 100,
          applicableDays: settings.weekdayOffer?.applicableDays || [1, 2, 3, 4, 5]
        },
        rewardConfig: {
          isActive: settings.rewardConfig?.isActive ?? true,
          ordersRequired: settings.rewardConfig?.ordersRequired || 5,
          pointsAwarded: settings.rewardConfig?.pointsAwarded || 30
        },
        upiDetails: {
          upiId: settings.upiDetails?.upiId || '',
          payeeName: settings.upiDetails?.payeeName || '',
          instructions: settings.upiDetails?.instructions || ''
        }
      })
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/settings', form)
      showToast('Cafe settings updated & broadcast to all live apps!', 'success')
      refreshSettings()
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <Link
            to="/admin"
            className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-display font-extrabold text-stone-900">
            Cafe Configuration & Policy
          </h1>
          <p className="text-xs text-stone-500">
            Real-time settings take effect immediately across all client browsers without redeployment.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Brand & Contact Info */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-700" />
            <span>Store Profile & Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Cafe Name</label>
              <input
                type="text"
                value={form.cafeName}
                onChange={(e) => setForm({ ...form, cafeName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Owner Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Public Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Store Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Kitchen Operating Hours & Delivery Speed */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Opening Hours & Express Target</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Daily Opening Time</label>
              <input
                type="time"
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Daily Closing Time</label>
              <input
                type="time"
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Express Delivery Target (Mins)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={form.deliveryEstimateMinutes}
                onChange={(e) =>
                  setForm({ ...form, deliveryEstimateMinutes: Number(e.target.value) })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Configurable Weekday Discount Rules */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-700" />
              <span>Weekday Discount Offer Rules</span>
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.weekdayOffer.isActive}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weekdayOffer: { ...form.weekdayOffer, isActive: e.target.checked }
                  })
                }
                className="rounded text-amber-600"
              />
              <span>Offer Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Discount (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.weekdayOffer.discountPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weekdayOffer: {
                      ...form.weekdayOffer,
                      discountPercent: Number(e.target.value)
                    }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                min={0}
                value={form.weekdayOffer.minOrderAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weekdayOffer: {
                      ...form.weekdayOffer,
                      minOrderAmount: Number(e.target.value)
                    }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                min={0}
                value={form.weekdayOffer.maxDiscountAmount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weekdayOffer: {
                      ...form.weekdayOffer,
                      maxDiscountAmount: Number(e.target.value)
                    }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Loyalty Programme Rules */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Loyalty Points Policy</span>
            </h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.rewardConfig.isActive}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardConfig: { ...form.rewardConfig, isActive: e.target.checked }
                  })
                }
                className="rounded text-amber-600"
              />
              <span>Loyalty Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Orders Required per Reward</label>
              <input
                type="number"
                min={1}
                value={form.rewardConfig.ordersRequired}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardConfig: {
                      ...form.rewardConfig,
                      ordersRequired: Number(e.target.value)
                    }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Points Awarded</label>
              <input
                type="number"
                min={1}
                value={form.rewardConfig.pointsAwarded}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardConfig: {
                      ...form.rewardConfig,
                      pointsAwarded: Number(e.target.value)
                    }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Verified UPI QR Details */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-700" />
            <span>UPI Payment Details (Verified by Cafe Owner)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Cafe UPI ID</label>
              <input
                type="text"
                placeholder="e.g. siddhohumcafe@okhdfcbank"
                value={form.upiDetails.upiId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    upiDetails: { ...form.upiDetails, upiId: e.target.value }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Payee Business Name</label>
              <input
                type="text"
                value={form.upiDetails.payeeName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    upiDetails: { ...form.upiDetails, payeeName: e.target.value }
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Broadcasting Updates...' : 'Save & Broadcast Cafe Settings'}</span>
        </button>

      </form>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Award,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import api from '../services/api'
import { HeroCarousel } from '../components/HeroCarousel'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { MenuItemCard } from '../components/MenuItemCard'
import { CategoryNav } from '../components/CategoryNav'
import { useCafe } from '../context/CafeContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export const HomePage = () => {
  const { settings } = useCafe()
  const { user, isAuthenticated } = useAuth()
  const { loadFromPreviousOrder, setIsDrawerOpen } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [featuredDishes, setFeaturedDishes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [recentOrder, setRecentOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, dishRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/items?featured=true')
        ])
        setCategories(catRes.categories || [])
        setFeaturedDishes(dishRes.items || [])
      } catch (err) {
        console.warn('Menu fetch failed:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch customer's most recent order for 1-Click Repeat Order
  useEffect(() => {
    if (!isAuthenticated) return
    const fetchLastOrder = async () => {
      try {
        const res = await api.get('/orders/my-orders')
        if (res.orders && res.orders.length > 0) {
          setRecentOrder(res.orders[0])
        }
      } catch (err) {
        // Silently handle if no history
      }
    }
    fetchLastOrder()
  }, [isAuthenticated])

  // Handle Repeat Order
  const handleRepeatRecentOrder = async () => {
    if (!recentOrder) return
    try {
      const res = await api.get(`/orders/${recentOrder._id}/repeat-check`)
      if (res.availableItems?.length > 0) {
        loadFromPreviousOrder(res.availableItems)
        setIsDrawerOpen(true)
        if (res.unavailableItems?.length > 0) {
          showToast(
            `Note: ${res.unavailableItems.map((u) => u.name).join(', ')} currently unavailable.`,
            'info',
            4500
          )
        }
      } else {
        showToast('All dishes from previous order are currently out of stock.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Could not repeat order', 'error')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Section with Cafe Photography */}
      <HeroCarousel />

      {/* 2. Owner & Contact Card (Preserving original prototype details) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Owners
          </p>
          <p className="font-display font-bold text-base text-stone-900">
            {settings?.ownerName || 'Ashish & Rahul'} ({settings?.phone || '+91 8868977399'})
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{settings?.address || 'opp. Mega county, near The bend restaurant, Salan Gaon, Bhagwant Pur, Dehradun, Kirsali Gaon, Uttarakhand 248009'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <a
            href={`tel:${(settings?.phone || '8868977399').replace(/\D/g, '')}`}
            className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Call Kitchen</span>
          </a>
          <Link
            to="/menu"
            className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. Loyalty Tracker Widget */}
      <LoyaltyWidget />

      {/* 4. Repeat Order Quick Feature (If recent order exists) */}
      {recentOrder && (
        <div className="bg-stone-950 text-white p-4 rounded-2xl shadow-md border border-amber-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500 text-stone-950 font-extrabold uppercase px-2 py-0.5 rounded">
                Quick Reorder
              </span>
              <span className="text-xs text-stone-400">
                Order #{recentOrder.orderNumber}
              </span>
            </div>
            <p className="text-xs font-semibold text-stone-200 mt-1 line-clamp-1">
              Last Order:{' '}
              {recentOrder.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
            </p>
          </div>

          <button
            onClick={handleRepeatRecentOrder}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 self-stretch sm:self-auto justify-center transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repeat in 1-Click</span>
          </button>
        </div>
      )}

      {/* 5. Active Promotions & Weekday Discount Callout */}
      {settings?.weekdayOffer?.isActive && (
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full inline-block">
              Limited Time Special
            </span>
            <h3 className="text-xl font-display font-extrabold">
              {settings.weekdayOffer.title || 'Weekday 10% Off on All Orders'}
            </h3>
            <p className="text-xs text-amber-200 max-w-lg">
              Enjoy handcrafted teas, snacks, and burgers. Automatic discount calculated at checkout on orders above ₹{settings.weekdayOffer.minOrderAmount || 99}.
            </p>
          </div>

          <Link
            to="/menu"
            className="bg-white hover:bg-amber-100 text-amber-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow transition shrink-0"
          >
            Claim Offer & Order →
          </Link>
        </div>
      )}

      {/* 6. Food Categories Navigation Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-extrabold text-stone-900">
              Explore Our Kitchen
            </h2>
            <p className="text-xs text-stone-500">Select a category to browse delicacies</p>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug)
            navigate(slug === 'all' ? '/menu' : `/menu?category=${slug}`)
          }}
        />
      </div>

      {/* 7. Featured & Popular Dishes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-extrabold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Chef Specials & Bestsellers</span>
            </h2>
            <p className="text-xs text-stone-500">Most loved artisan items by our regulars</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredDishes.slice(0, 6).map((dish) => (
            <MenuItemCard key={dish._id} item={dish} />
          ))}
        </div>
      </div>

      {/* 8. Siddhohum Quality Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200/80">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-stone-900">Quick & Convenient Local Delivery</h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Rapid cooking & dispatch for local neighborhood cravings.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-stone-900">Secure Delivery </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Pay conveniently with Cash or UPI when your order arrives at your doorstep.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-stone-900">30 Pts Milestone</h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Automatically earn 30 points after every 5 completed orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

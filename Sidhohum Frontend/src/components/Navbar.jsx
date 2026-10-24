import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, User, Shield, Menu as MenuIcon, X, Zap, Award, Clock, Coffee } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCafe } from '../context/CafeContext'

import logo from '../assets/images/siddhohum-logo.png'

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItemsCount, setIsDrawerOpen } = useCart()
  const { user, isAuthenticated, isAdminAuthenticated } = useAuth()
  const { settings } = useCafe()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 bg-[#381E0D]/95 backdrop-blur-md text-white border-b border-amber-900/50 shadow-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">

        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
<img
  src={logo}
  alt="Siddhohum Cafe"
  className="w-10 h-10 object-contain drop-shadow transition-transform group-hover:scale-105"
/>          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
                {settings?.cafeName || 'Siddhohum Cafe'}
              </span>
              {/* Dynamic Open / Closed badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  settings?.isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {settings?.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium">
              <Coffee className="w-3 h-3 text-amber-400" />
              <span>Sukoon Ka Permanent Address</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/') ? 'text-amber-400 font-semibold' : 'text-stone-200'
            }`}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/menu') ? 'text-amber-400 font-semibold' : 'text-stone-200'
            }`}
          >
            Menu
          </Link>
          <Link
            to="/orders"
            className={`transition-colors hover:text-amber-300 ${
              isActive('/orders') ? 'text-amber-400 font-semibold' : 'text-stone-200'
            }`}
          >
            My Orders
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-1 transition-colors hover:text-amber-300 ${
              isActive('/profile') ? 'text-amber-400 font-semibold' : 'text-stone-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Rewards</span>
            {user?.rewardPoints > 0 && (
              <span className="bg-amber-500 text-stone-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {user.rewardPoints}p
              </span>
            )}
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* { Admin Switch Link }
          <Link
            to={isAdminAuthenticated ? '/admin' : '/admin/login'}
            className="text-xs bg-amber-950 hover:bg-stone-900 text-amber-300 px-2.5 py-1.5 rounded-lg border border-amber-800/80 flex items-center gap-1.5 transition-colors"
            title="Cafe Staff & Kitchen Management"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </Link> */}

          {/* User Account / Profile */}
          <Link
            to="/profile"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white transition-colors relative"
            title={isAuthenticated ? user.name : 'Sign In'}
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Cart Icon & Trigger Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span className="hidden sm:inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="bg-stone-950 text-amber-400 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full leading-none">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2D180A] border-t border-amber-900/60 px-4 py-3 space-y-2.5 text-sm animate-in fade-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-stone-200 hover:text-amber-300"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-stone-200 hover:text-amber-300"
          >
            Menu & Categories
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-stone-200 hover:text-amber-300"
          >
            Order Tracking & History
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-1.5 text-stone-200 hover:text-amber-300"
          >
            <span>Loyalty & Rewards</span>
            {user?.rewardPoints > 0 && (
              <span className="bg-amber-500 text-stone-950 text-xs px-2 py-0.5 rounded-full font-bold">
                {user.rewardPoints} pts
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  )
}

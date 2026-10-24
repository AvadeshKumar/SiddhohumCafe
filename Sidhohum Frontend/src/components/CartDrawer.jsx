import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Trash2,
  Bike
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCafe } from '../context/CafeContext'

export const CartDrawer = () => {
  const {
    itemsList,
    totalItemsCount,
    subtotal,
    estimatedDiscount,
    deliveryFee,
    payableTotal,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart()
  const { settings } = useCafe()
  const navigate = useNavigate()

  if (totalItemsCount === 0 && !isDrawerOpen) return null

  const handleCheckoutClick = () => {
    setIsDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {/* Sticky Bottom Mini Bar (Mobile & Quick Action) */}
      {!isDrawerOpen && totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-stone-900/95 backdrop-blur-md border-t border-amber-900/50 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold shadow">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-amber-200 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in Cart
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-white font-display">
                    ₹{payableTotal}
                  </span>
                  {estimatedDiscount > 0 && (
                    <span className="text-[11px] text-emerald-400 font-semibold line-through">
                      ₹{subtotal}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95"
            >
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Cart Drawer Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-stone-200">

              {/* Drawer Header */}
              <div className="p-4 bg-[#381E0D] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="font-display font-bold text-base">Your Cart</h2>
                  <span className="text-xs bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {totalItemsCount} items
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body / Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {itemsList.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-display font-bold text-base text-stone-800">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Explore fresh brews, street burgers, and Himalayan chai to add to your order.
                    </p>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="mt-2 bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Selected Dishes
                      </span>
                      <button
                        onClick={clearCart}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> Clear Cart
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {itemsList.map((item) => (
                        <div
                          key={item.menuItemId}
                          className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-stone-900 truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs font-extrabold text-amber-900 mt-0.5">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Item Quantity Controller */}
                          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
                            <button
                              onClick={() => updateQuantity(item.menuItemId, -1)}
                              className="w-6 h-6 rounded bg-white text-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-extrabold text-stone-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItemId, 1)}
                              className="w-6 h-6 rounded bg-amber-700 text-white flex items-center justify-center font-bold text-xs hover:bg-amber-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Weekday Offer Banner in Drawer */}
                    {estimatedDiscount > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Weekday 10% Special Applied!</strong> You saved ₹{estimatedDiscount}.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer / Bill Breakdown */}
              {itemsList.length > 0 && (
                <div className="p-4 bg-white border-t border-stone-200 space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-semibold text-stone-800">₹{subtotal}</span>
                    </div>

                    {estimatedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Weekday Discount (10%)</span>
                        <span>- ₹{estimatedDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-stone-400" />
                        Delivery Partner Fee
                      </span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between items-baseline font-bold text-stone-900 text-sm">
                      <span className="font-display text-base">To Pay</span>
                      <span className="text-lg font-extrabold font-display text-amber-900">
                        ₹{payableTotal}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition transform active:scale-98"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

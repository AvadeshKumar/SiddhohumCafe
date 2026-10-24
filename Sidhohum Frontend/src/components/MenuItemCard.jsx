import React from 'react'
import { Plus, Minus, Clock, Sparkles } from 'lucide-react'
import { useCart } from '../context/CartContext'

export const MenuItemCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart[item._id || item.id]
  const quantity = cartItem ? cartItem.quantity : 0

  const isAvailable = item.isAvailable !== false

  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group ${
        !isAvailable ? 'opacity-70 bg-stone-50' : ''
      }`}
    >
      <div>
        {/* Top Image & Badges */}
        <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 mb-3">
          <img
            src={
              item.imageUrl ||
              'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80'
            }
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Veg / Non-veg dot icon */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow border border-stone-200 flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>

          {/* Badge: Bestseller / Chef Choice / 10-Min Rush */}
          {item.badge && (
            <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{item.badge}</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-600 text-white font-extrabold text-xs uppercase px-3 py-1 rounded-lg tracking-wider shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="space-y-1">
          {item.creativeName && (
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              {item.creativeName}
            </span>
          )}

          <h3 className="font-display font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
            {item.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer: Price and Quantity Actions */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-400 block font-medium">Price</span>
          <span className="text-base font-extrabold text-stone-900 font-display">
            ₹{item.price}
          </span>
        </div>

        {/* Quantity Controls / Add Button */}
        <div>
          {!isAvailable ? (
            <span className="text-xs text-stone-400 font-medium italic">Unavailable</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-300 shadow-inner">
              <button
                onClick={() => updateQuantity(item._id || item.id, -1)}
                className="w-7 h-7 rounded-lg bg-white text-stone-700 font-extrabold flex items-center justify-center shadow-sm hover:bg-rose-50 hover:text-rose-600 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold text-stone-900 w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item._id || item.id, 1)}
                className="w-7 h-7 rounded-lg bg-amber-700 text-white font-extrabold flex items-center justify-center shadow-sm hover:bg-amber-800 transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

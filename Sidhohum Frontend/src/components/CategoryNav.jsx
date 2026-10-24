import React from 'react'
import {
  Coffee,
  Flame,
  Utensils,
  Soup,
  ChefHat,
  Disc,
  Sparkles,
  Cake,
  Star,
  Layers
} from 'lucide-react'

const iconMap = {
  Coffee: Coffee,
  Flame: Flame,
  Utensils: Utensils,
  Soup: Soup,
  ChefHat: ChefHat,
  Disc: Disc,
  Sparkles: Sparkles,
  Cake: Cake,
  Star: Star
}

export const CategoryNav = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {/* All Items Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-stone-950 shadow-amber-600/20 shadow-md ring-2 ring-amber-500/50'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Items</span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.iconName] || Coffee
          const isSelected = selectedCategory === cat.slug

          return (
            <button
              key={cat._id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                isSelected
                  ? 'bg-amber-600 text-stone-950 shadow-amber-600/20 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-stone-950' : 'text-amber-800'}`} />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

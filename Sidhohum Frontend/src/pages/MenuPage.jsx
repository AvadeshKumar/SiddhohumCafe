import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Sparkles, X, UtensilsCrossed } from 'lucide-react'
import api from '../services/api'
import { MenuItemCard } from '../components/MenuItemCard'
import { CategoryNav } from '../components/CategoryNav'

export const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'

  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sync category param
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setSelectedCategory(cat)
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/menu/categories')
        setCategories(res.categories || [])
      } catch (err) {
        console.warn('Failed to load categories:', err.message)
      }
    }
    fetchCategories()
  }, [])

  // Fetch menu items based on filters
  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }
        if (vegOnly) {
          params.append('isVeg', 'true')
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        const res = await api.get(`/menu/items?${params.toString()}`)
        setDishes(res.items || [])
      } catch (err) {
        console.warn('Failed to load dishes:', err.message)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchDishes, 250)
    return () => clearTimeout(timer)
  }, [selectedCategory, vegOnly, searchQuery])

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug)
    if (slug === 'all') {
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ category: slug })
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Page Title */}
      <div className="bg-gradient-to-r from-[#4A2E18] to-[#2D180A] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-amber-950 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full inline-block">
          Siddhohum Culinary Catalog
        </span>
        <h1 className="text-2xl md:text-4xl font-display font-extrabold">
          Fresh Menu
        </h1>
        <p className="text-xs md:text-sm text-stone-300 max-w-xl">
          Prepared fresh to order in our local kitchen.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Chai, Paratha, Poha, Noodles, Honey Chilli Potato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Veg Filter Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border w-full sm:w-auto justify-center ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border ${
                vegOnly ? 'bg-white border-white' : 'bg-emerald-600 border-emerald-700'
              }`}
            />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Category Carousel Pills */}
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-stone-200 h-64 skeleton-shimmer space-y-3">
              <div className="bg-stone-200 rounded-xl h-36 w-full" />
              <div className="bg-stone-200 h-4 rounded w-3/4" />
              <div className="bg-stone-200 h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3 max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-stone-900">
            No dishes found
          </h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search query, turning off filters, or selecting another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setVegOnly(false)
            }}
            className="text-xs bg-amber-700 text-white font-bold px-4 py-2 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-500">
            Showing {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <MenuItemCard key={dish._id} item={dish} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

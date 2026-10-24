import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AdminMenuManagement = () => {
  const { isAdminAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [dishForm, setDishForm] = useState({
    name: '',
    creativeName: '',
    description: '',
    price: '',
    categoryId: '',
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    imageUrl: '',
    badge: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminAuthenticated) navigate('/admin/login')
  }, [isAdminAuthenticated, navigate])

  const fetchData = useCallback(async () => {
    try {
      const [dishRes, catRes] = await Promise.all([
        api.get('/menu/items?includeUnavailable=true'),
        api.get('/menu/categories')
      ])
      setDishes(dishRes.items || [])
      setCategories(catRes.categories || [])
    } catch (err) {
      showToast(err.message || 'Failed to load menu catalog', 'error')
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Toggle dish in-stock / out-of-stock
  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/menu/items/${id}/toggle-availability`)
      showToast(res.message, 'info')
      setDishes((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isAvailable: !d.isAvailable } : d))
      )
    } catch (err) {
      showToast(err.message || 'Failed to update dish availability', 'error')
    }
  }

  // Open Dish Modal (Create or Edit)
  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish)
      setDishForm({
        name: dish.name,
        creativeName: dish.creativeName || '',
        description: dish.description || '',
        price: dish.price,
        categoryId: dish.category?._id || dish.category,
        isVeg: dish.isVeg !== false,
        isAvailable: dish.isAvailable !== false,
        isFeatured: Boolean(dish.isFeatured),
        imageUrl: dish.imageUrl || '',
        badge: dish.badge || ''
      })
    } else {
      setEditingDish(null)
      setDishForm({
        name: '',
        creativeName: '',
        description: '',
        price: '',
        categoryId: categories[0]?._id || '',
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        imageUrl: '',
        badge: ''
      })
    }
    setIsModalOpen(true)
  }

  // Save Dish
  const handleSaveDish = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingDish) {
        await api.put(`/menu/items/${editingDish._id}`, dishForm)
        showToast('Dish updated successfully', 'success')
      } else {
        await api.post('/menu/items', dishForm)
        showToast('New dish created successfully', 'success')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to save dish', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Safe Delete
  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to remove or archive this dish?')) return
    try {
      const res = await api.delete(`/menu/items/${id}`)
      showToast(res.message || 'Dish removed', 'info')
      fetchData()
    } catch (err) {
      showToast(err.message || 'Failed to delete dish', 'error')
    }
  }

  const filteredDishes = dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.creativeName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Live Dashboard
          </Link>
          <h1 className="text-xl font-display font-extrabold text-stone-900">
            Menu Catalog Management
          </h1>
          <p className="text-xs text-stone-500">
            Manage dishes, toggle instantaneous stock availability, and update prices.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Filter dishes by name or creative title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-stone-800 outline-none"
        />
      </div>

      {/* Dishes Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700 divide-y divide-stone-100">
            <thead className="bg-stone-50 font-bold text-stone-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Dish</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">Availability (1-Click)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDishes.map((dish) => (
                <tr key={dish._id} className="hover:bg-stone-50/70 transition">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={dish.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=100&q=80'}
                      alt={dish.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block">{dish.name}</span>
                      {dish.creativeName && (
                        <span className="text-[10px] text-amber-800 font-medium">
                          {dish.creativeName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-stone-600">
                    {dish.category?.name || 'Beverages'}
                  </td>
                  <td className="p-3.5 font-extrabold text-stone-900">
                    ₹{dish.price}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dish.isVeg
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dish.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleAvailability(dish._id)}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition ${
                        dish.isAvailable
                          ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      }`}
                      title="Click to toggle available / out-of-stock"
                    >
                      {dish.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => openModal(dish)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                      title="Edit dish"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish._id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-stone-900">
              {editingDish ? 'Edit Dish' : 'Create New Dish'}
            </h3>

            <form onSubmit={handleSaveDish} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Himalayan Chai"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Creative Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Soul Warmer Elixir"
                  value={dishForm.creativeName}
                  onChange={(e) => setDishForm({ ...dishForm, creativeName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="40"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={dishForm.categoryId}
                    onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Appetizing description of ingredients and spices..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={dishForm.imageUrl}
                  onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isVeg}
                    onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isFeatured}
                    onChange={(e) => setDishForm({ ...dishForm, isFeatured: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span>Feature on Home</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-2 rounded-xl shadow"
                >
                  {saving ? 'Saving...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

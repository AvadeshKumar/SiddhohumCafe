import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Phone, ArrowLeft, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const AdminLoginPage = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const { adminLogin, isAdminAuthenticated, loading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}, [])

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin')
    }
  }, [isAdminAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone || !password) {
      showToast('Please enter both phone and password', 'error')
      return
    }

    try {
      await adminLogin(phone, password)
      navigate('/admin')
    } catch (err) {
      // Toast already shown in context
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <Link
        to="/"
        className="text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Website
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-stone-200/90 shadow-xl space-y-6">
        <div className="w-14 h-14 bg-amber-950 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-800">
          <Shield className="w-7 h-7" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-xl font-display font-extrabold text-stone-900">
            Vendor & Kitchen Portal
          </h1>
          <p className="text-xs text-stone-500">
            Authorized cafe owner & kitchen staff access only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Admin Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Secure Password / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-stone-900 disabled:opacity-50 text-amber-300 font-bold py-3 rounded-xl text-xs shadow-md border border-amber-800 transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-500 text-center">
          Default seed credentials configured in backend <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-800">.env</code>.
        </div>
      </div>
    </div>
  )
}

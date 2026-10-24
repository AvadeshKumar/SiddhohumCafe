import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sidhohum_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(
    () => localStorage.getItem('sidhohum_auth_token') || null
  )

  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('sidhohum_admin')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem('sidhohum_admin_token') || null
  )

  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // Save or remove customer session
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('sidhohum_user', JSON.stringify(user))
      localStorage.setItem('sidhohum_auth_token', token)
    } else {
      localStorage.removeItem('sidhohum_user')
      localStorage.removeItem('sidhohum_auth_token')
    }
  }, [user, token])

  // Save or remove admin session
  useEffect(() => {
    if (admin && adminToken) {
      localStorage.setItem('sidhohum_admin', JSON.stringify(admin))
      localStorage.setItem('sidhohum_admin_token', adminToken)
    } else {
      localStorage.removeItem('sidhohum_admin')
      localStorage.removeItem('sidhohum_admin_token')
    }
  }, [admin, adminToken])

  // Customer: Send OTP
  const sendOtp = async (phone, purpose = 'login') => {
    setLoading(true)
    try {
      const data = await api.post('/auth/otp/send', { phone, purpose })
      showToast(data.message || 'Verification code sent', 'success')
      return data
    } catch (err) {
      showToast(err.message || 'Failed to send verification code', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Customer: Verify OTP and log in
  const verifyOtp = async (phone, otp, name) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/otp/verify', {
        phone,
        otp,
        name
      })

      if (!data.token || !data.user) {
        throw new Error('Invalid authentication response from server')
      }

      setToken(data.token)
      setUser(data.user)

      showToast('Welcome to Siddhohum Cafe!', 'success')
      return data
    } catch (err) {
      showToast(err.message || 'OTP verification failed', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Refresh customer profile
  const refreshProfile = useCallback(async () => {
    if (!token) return

    try {
      const data = await api.get('/auth/profile')
      if (data.user) {
        setUser(data.user)
      }
    } catch (err) {
      console.warn('Could not refresh user profile:', err.message)
    }
  }, [token])

  // Customer logout
  const logout = () => {
    setUser(null)
    setToken(null)
    showToast('Logged out successfully', 'info')
  }

  // Add saved address
  const addAddress = async (addressData) => {
    try {
      const data = await api.post('/auth/profile/addresses', addressData)

      if (data.addresses) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }))
      }

      showToast('Address saved', 'success')
      return data
    } catch (err) {
      showToast(err.message || 'Could not save address', 'error')
      throw err
    }
  }

  // Delete saved address
  const deleteAddress = async (addressId) => {
    try {
      const data = await api.delete(`/auth/profile/addresses/${addressId}`)

      if (data.addresses) {
        setUser((prev) => ({ ...prev, addresses: data.addresses }))
      }

      showToast('Address removed', 'info')
      return data
    } catch (err) {
      showToast(err.message || 'Could not remove address', 'error')
      throw err
    }
  }

  // Admin login
  const adminLogin = async (phone, password) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/admin/login', {
        phone,
        password
      })

      setAdminToken(data.token)
      setAdmin(data.admin)

      showToast('Admin authorization verified', 'success')
      return data
    } catch (err) {
      showToast(err.message || 'Admin login failed', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Admin logout
  const adminLogout = () => {
    setAdmin(null)
    setAdminToken(null)
    showToast('Admin logged out', 'info')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        admin,
        adminToken,
        loading,
        isAuthenticated: !!user && !!token,
        isAdminAuthenticated: !!admin && !!adminToken,
        sendOtp,
        verifyOtp,
        refreshProfile,
        logout,
        addAddress,
        deleteAddress,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
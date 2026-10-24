import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { CafeProvider } from './context/CafeContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'

import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderHistoryPage } from './pages/OrderHistoryPage'
import { ProfilePage } from './pages/ProfilePage'

import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminMenuManagement } from './pages/admin/AdminMenuManagement'
import { AdminSettings } from './pages/admin/AdminSettings'

export function App() {
  return (
    <ToastProvider>
      <CafeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800 antialiased selection:bg-amber-200 selection:text-amber-900">
                <Navbar />

                <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4">
                  <Routes>
                    {/* Customer Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/orders/:id" element={<OrderConfirmationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Admin Portal Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/menu" element={<AdminMenuManagement />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <CartDrawer />
                <Footer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </CafeProvider>
    </ToastProvider>
  )
}

export default App

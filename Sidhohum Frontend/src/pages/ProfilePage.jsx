import React, { useState } from 'react'
import {
  User,
  Phone,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { OtpModal } from '../components/OtpModal'

export const ProfilePage = () => {
  const {
    user,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    loading,
    logout,
    addAddress,
    deleteAddress
  } = useAuth()

  const { showToast } = useToast()

  // Login state
  const [phoneInput, setPhoneInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [devCodeHint, setDevCodeHint] = useState(null)
  const [sendingOtp, setSendingOtp] = useState(false)

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressLabel, setAddressLabel] = useState('Home')
  const [addressLine, setAddressLine] = useState('')
  const [addressLandmark, setAddressLandmark] = useState('')
  const [addressInstructions, setAddressInstructions] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)

  // Send OTP

const handleInitiateLogin = async (e) => {
  e.preventDefault()

  const cleanName = nameInput.trim()
  const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10)

  if (!cleanName) {
    showToast('Please enter your full name', 'error')
    return
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    showToast('Please enter a valid 10-digit mobile number', 'error')
    return
  }

  setSendingOtp(true)

  try {
    const result = await sendOtp(cleanPhone, 'login')

    const devCode =
  result?.devOtp ??
  result?.devCode ??
  result?.otp ??
  result?.data?.devOtp ??
  result?.data?.devCode ??
  result?.data?.otp ??
  null

setDevCodeHint(devCode)
    setOtpModalOpen(true)
  } catch (err) {
    console.error('OTP request failed:', err)
  } finally {
    setSendingOtp(false)
  }
}


  // Verify OTP and log in
  const handleVerifyOtp = async (code) => {
    const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10)

    try {
      await verifyOtp(cleanPhone, code, nameInput.trim())
      setOtpModalOpen(false)
      setDevCodeHint(null)
    } catch (err) {
      // AuthContext displays the error toast.
      throw err
    }
  }

  // Save delivery address
  const handleSaveAddress = async (e) => {
    e.preventDefault()

    if (!addressLine.trim()) {
      showToast('Please enter an address line', 'error')
      return
    }

    setSavingAddress(true)

    try {
      await addAddress({
        label: addressLabel,
        addressLine: addressLine.trim(),
        landmark: addressLandmark.trim(),
        instructions: addressInstructions.trim()
      })

      setShowAddressForm(false)
      setAddressLine('')
      setAddressLandmark('')
      setAddressInstructions('')
    } catch (err) {
      // AuthContext displays the error toast.
    } finally {
      setSavingAddress(false)
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-md mx-auto py-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-md space-y-5">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <User className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-display font-extrabold text-stone-900">
                Customer Login
              </h1>
              <p className="text-xs text-stone-500">
                Enter your name and mobile number. We'll send you a verification code.
              </p>
            </div>

            <form onSubmit={handleInitiateLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Aman Verma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  10-Digit Mobile Number *
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                    +91
                  </span>

                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneInput}
                    onChange={(e) =>
                      setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none transition font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  sendingOtp ||
                  !nameInput.trim() ||
                  phoneInput.length !== 10
                }
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
              >
                {sendingOtp || loading
                  ? 'Sending Verification Code...'
                  : 'Send Verification Code'}
              </button>
            </form>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Verify your mobile number to access your account.</span>
            </div>
          </div>
        </div>



{otpModalOpen && (
  <OtpModal
    isOpen={otpModalOpen}
    phone={phoneInput}
    devCodeHint={devCodeHint}
    onVerify={handleVerifyOtp}
    onClose={() => {
      setOtpModalOpen(false)
      setDevCodeHint(null)
    }}
    onResend={async () => {
      const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10)
      const result = await sendOtp(cleanPhone, 'login')

      const devCode =
        result?.devCode ??
        result?.otp ??
        result?.data?.devCode ??
        result?.data?.otp ??
        null

      setDevCodeHint(devCode)
      return result
    }}
  />
)}


      </>
    )
  }

  // Authenticated profile
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-stone-950 font-display font-extrabold text-xl flex items-center justify-center shadow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h1 className="text-lg font-display font-bold text-stone-900">
              {user?.name || 'Siddhohum Member'}
            </h1>

            <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Phone className="w-3 h-3 text-stone-400" />
              +91 {user?.phone}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Loyalty */}
      <LoyaltyWidget />

      {/* Saved Delivery Addresses */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-display font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Saved Delivery Addresses</span>
          </h2>

          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {showAddressForm && (
          <form
            onSubmit={handleSaveAddress}
            className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in text-xs"
          >
            <div className="flex items-center gap-2">
              {['Home', 'Work', 'Other'].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setAddressLabel(label)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    addressLabel === label
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Address Details *
              </label>
              <textarea
                rows={2}
                required
                placeholder="House no, Building, Street..."
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-2.5 outline-none focus:border-amber-600 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={addressLandmark}
                onChange={(e) => setAddressLandmark(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-amber-600 transition"
              />

              <input
                type="text"
                placeholder="Delivery instructions"
                value={addressInstructions}
                onChange={(e) => setAddressInstructions(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-amber-600 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingAddress}
                className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-xl shadow transition"
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}

        {user?.addresses?.length === 0 && !showAddressForm ? (
          <p className="text-xs text-stone-400 italic">
            No saved addresses yet.
          </p>
        ) : user?.addresses?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-bold text-xs text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {addr.label}
                    </span>

                    <button
                      onClick={() => deleteAddress(addr._id)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-700 mt-1 font-medium">
                    {addr.addressLine}
                  </p>

                  {addr.landmark && (
                    <p className="text-[11px] text-stone-400">
                      Near: {addr.landmark}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

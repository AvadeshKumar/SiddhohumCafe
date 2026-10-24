import React, { useState, useEffect, useRef } from 'react'
import { MessageSquareCode, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

export const OtpModal = ({
  isOpen,
  onClose,
  phone,
  onVerify,
  onResend,
  devCodeHint
}) => {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(45)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', ''])
      setError('')
      setTimer(45)
      setTimeout(() => inputRefs[0].current?.focus(), 150)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || timer <= 0) return
    const interval = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [isOpen, timer])

  // Handle digit change and auto-advance
  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = val
    setDigits(newDigits)
    setError('')

    if (val && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const code = digits.join('')
    if (code.length !== 4) {
      setError('Please enter the 4-digit code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onVerify(code)
    } catch (err) {
      setError(err.message || 'Verification failed. Please check code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return
    setError('')
    try {
      await onResend()
      setTimer(45)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative text-center">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <MessageSquareCode className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-display font-bold text-lg text-stone-900">
            Verify Your Phone Number
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Enter the 4-digit verification code below to continue. <br />
            {/* <strong className="text-stone-800">+91 {phone}</strong> */}
          </p>
        </div>

        {/* Development Helper Hint (Local testing only) */}
        {devCodeHint && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2 rounded-xl flex items-center justify-center gap-1.5 font-medium">
            <span>🔑 Verification Code:</span>
            <code className="bg-amber-200 px-1.5 py-0.5 rounded font-mono font-bold text-stone-900">
              {devCodeHint}
            </code>
          </div>
        )}

        {/* 4-digit Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2.5 my-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-stone-50 border-2 border-stone-200 focus:border-amber-600 focus:bg-white outline-none transition shadow-sm"
              />
            ))}
          </div>

          {error && (
            <div className="text-rose-600 text-xs font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || digits.join('').length !== 4}
            className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-md transition transform active:scale-98"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        {/* Resend Cooldown */}
        <div className="text-xs text-stone-500 pt-1">
          {timer > 0 ? (
            <span>Resend code in {timer}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

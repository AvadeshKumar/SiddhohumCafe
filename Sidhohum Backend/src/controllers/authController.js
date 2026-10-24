import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AdminAccount from '../models/AdminAccount.js'
import { generateAndSendOtp, verifyOtpCode } from '../services/otpService.js'

const generateToken = (id, role = 'customer') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'siddhohum_cafe_dev_jwt_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Request OTP for login or order verification
export const sendOtp = async (req, res, next) => {
  try {
    const { phone, purpose } = req.body
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' })
    }

    const result = await generateAndSendOtp(phone, purpose || 'login')
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

// Verify OTP and issue JWT session token
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code are required' })
    }

    const verification = await verifyOtpCode(phone, otp, 'login')

    // Find or create customer
    let user = await User.findOne({ phone: verification.phone })

    if (!user) {
      user = await User.create({
        name: name || `Customer ${verification.phone.slice(-4)}`,
        phone: verification.phone,
        isPhoneVerified: true
      })
    } else {
      user.isPhoneVerified = true
      if (name && user.name.startsWith('Customer ')) {
        user.name = name
      }
      await user.save()
    }

    const token = generateToken(user._id, user.role)

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints,
        completedOrdersCount: user.completedOrdersCount,
        addresses: user.addresses
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get current customer profile
export const getCustomerProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints,
        completedOrdersCount: user.completedOrdersCount,
        addresses: user.addresses
      }
    })
  } catch (error) {
    next(error)
  }
}

// Update profile details
export const updateCustomerProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body
    const user = await User.findById(req.user._id)

    if (name) user.name = name.trim()
    if (email !== undefined) user.email = email.trim().toLowerCase()

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        rewardPoints: user.rewardPoints,
        completedOrdersCount: user.completedOrdersCount,
        addresses: user.addresses
      }
    })
  } catch (error) {
    next(error)
  }
}

// Add or save a delivery address
export const addDeliveryAddress = async (req, res, next) => {
  try {
    const { label, addressLine, landmark, instructions, isDefault } = req.body
    if (!addressLine) {
      return res.status(400).json({ success: false, message: 'Address line is required' })
    }

    const user = await User.findById(req.user._id)

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    user.addresses.push({
      label: label || 'Home',
      addressLine,
      landmark: landmark || '',
      instructions: instructions || '',
      isDefault: isDefault || user.addresses.length === 0
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      addresses: user.addresses
    })
  } catch (error) {
    next(error)
  }
}

// Delete a saved delivery address
export const deleteDeliveryAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params
    const user = await User.findById(req.user._id)

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
      addresses: user.addresses
    })
  } catch (error) {
    next(error)
  }
}

// Admin / Cafe Owner Login
export const adminLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' })
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    let admin = await AdminAccount.findOne({ phone: cleanPhone })

    // Check if matching admin exists
    if (!admin) {
      // Fallback check user collection for admin role
      const userAdmin = await User.findOne({ phone: cleanPhone, role: 'admin' }).select('+password')
      if (userAdmin && (await userAdmin.comparePassword(password))) {
        const token = generateToken(userAdmin._id, 'admin')
        return res.status(200).json({
          success: true,
          token,
          admin: {
            id: userAdmin._id,
            name: userAdmin.name,
            phone: userAdmin.phone,
            role: 'owner'
          }
        })
      }

      return res.status(401).json({ success: false, message: 'Invalid admin credentials' })
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account has been deactivated' })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' })
    }

    const token = generateToken(admin._id, admin.role)

    res.status(200).json({
      success: true,
      message: 'Admin authorization successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        phone: admin.phone,
        role: admin.role
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get current admin info
export const getAdminMe = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      phone: req.admin.phone,
      role: req.admin.role || 'admin'
    }
  })
}

import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import app from '../src/app.js'
import MenuItem from '../src/models/MenuItem.js'
import MenuCategory from '../src/models/MenuCategory.js'
import CafeSettings from '../src/models/CafeSettings.js'
import AdminAccount from '../src/models/AdminAccount.js'
import Order from '../src/models/Order.js'
import OtpVerification from '../src/models/OtpVerification.js'
import PaymentRecord from '../src/models/PaymentRecord.js'
import User from '../src/models/User.js'

const mockAdminId = '654321654321654321654321'
const mockDishId = '123456123456123456123456'
const mockCategoryId = 'abcdefabcdefabcdefabcdef'
const mockOrderId = '789012789012789012789012'

const adminToken = jwt.sign(
  { id: mockAdminId, role: 'owner' },
  process.env.JWT_SECRET || 'siddhohum_cafe_dev_jwt_secret_key_2026_super_secure'
)

describe('1. Health & Configuration', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toContain('Siddhohum Cafe')
  })

  it('GET /api/settings should return cafe settings with live open status', async () => {
    vi.spyOn(CafeSettings, 'findOne').mockResolvedValue({
      cafeName: 'Siddhohum Cafe',
      openingTime: '00:00',
      closingTime: '23:59',
      deliveryEstimateMinutes: 10,
      deliveryFee: 0,
      freeDeliveryThreshold: 199,
      weekdayOffer: {
        isActive: true,
        title: 'Weekday Special 10%',
        discountPercent: 10,
        applicableDays: [0, 1, 2, 3, 4, 5, 6],
        minOrderAmount: 50,
        maxDiscountAmount: 100
      },
      rewardConfig: {
        isActive: true,
        ordersRequired: 5,
        pointsAwarded: 30
      },
      upiDetails: {
        upiId: 'siddhohumcafe@okhdfcbank',
        payeeName: 'Siddhohum Cafe',
        instructions: 'Pay via UPI QR at delivery'
      }
    })

    const res = await request(app).get('/api/settings')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.settings.cafeName).toBe('Siddhohum Cafe')
    expect(res.body.settings.deliveryEstimateMinutes).toBe(10)
    expect(res.body.settings.isOpen).toBe(true)
  })
})

describe('2. Menu & Categories', () => {
  it('GET /api/menu/categories should return available categories', async () => {
    vi.spyOn(MenuCategory, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        { _id: mockCategoryId, name: 'Beverages and Chai', slug: 'beverages-and-chai', displayOrder: 1 }
      ])
    })

    const res = await request(app).get('/api/menu/categories')
    expect(res.status).toBe(200)
    expect(res.body.categories.length).toBe(1)
    expect(res.body.categories[0].slug).toBe('beverages-and-chai')
  })

  it('GET /api/menu/items should return available dishes', async () => {
    vi.spyOn(MenuItem, 'find').mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([
          {
            _id: mockDishId,
            name: 'Midnight Himalayan Chai',
            creativeName: 'Soul Warmer Elixir',
            price: 40,
            isVeg: true,
            isAvailable: true
          }
        ])
      })
    })

    const res = await request(app).get('/api/menu/items')
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBe(1)
    expect(res.body.items[0].name).toBe('Midnight Himalayan Chai')
  })

  it('POST /api/menu/items without admin token should be rejected (401)', async () => {
    const res = await request(app)
      .post('/api/menu/items')
      .send({ name: 'Unauthorized Dish', price: 100 })
    expect(res.status).toBe(401)
  })

  it('POST /api/menu/items with admin token should succeed', async () => {
    vi.spyOn(AdminAccount, 'findById').mockResolvedValue({
      _id: mockAdminId,
      name: 'Rohan Singh',
      role: 'owner',
      isActive: true
    })

    vi.spyOn(MenuCategory, 'findById').mockResolvedValue({
      _id: mockCategoryId,
      name: 'Beverages and Chai',
      slug: 'beverages-and-chai'
    })

    vi.spyOn(MenuItem, 'create').mockResolvedValue({
      _id: mockDishId,
      name: 'Tandoori Paneer Wrap',
      creativeName: 'Charcoal Roll',
      price: 140,
      category: mockCategoryId,
      isVeg: true,
      isAvailable: true
    })

    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tandoori Paneer Wrap',
        creativeName: 'Charcoal Roll',
        price: 140,
        categoryId: mockCategoryId,
        isVeg: true,
        isAvailable: true
      })

    expect(res.status).toBe(201)
    expect(res.body.item.name).toBe('Tandoori Paneer Wrap')
  })
})

describe('3. Customer Auth & OTP Verification', () => {
  it('POST /api/auth/otp/send should generate and dispatch an OTP', async () => {
    vi.spyOn(OtpVerification, 'countDocuments').mockResolvedValue(0)
    vi.spyOn(OtpVerification, 'deleteMany').mockResolvedValue({ deletedCount: 0 })
    vi.spyOn(OtpVerification, 'create').mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/otp/send')
      .send({ phone: '9876543210', purpose: 'login' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.devOtp).toBeDefined()
  })

  it('POST /api/auth/otp/verify with invalid code should increment attempts and reject', async () => {
    const fakeRecord = {
      _id: 'otprecord123',
      otpHash: crypto.createHash('sha256').update('9999').digest('hex'),
      attempts: 0,
      maxAttempts: 3,
      save: vi.fn()
    }

    vi.spyOn(OtpVerification, 'findOne').mockResolvedValue(fakeRecord)

    const res = await request(app)
      .post('/api/auth/otp/verify')
      .send({ phone: '9876543210', otp: '1111' })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Incorrect verification code')
    expect(fakeRecord.attempts).toBe(1)
  })

  it('POST /api/auth/otp/verify with correct code should return JWT and user', async () => {
    const validOtp = '5555'
    const validHash = crypto.createHash('sha256').update(validOtp).digest('hex')

    const fakeRecord = {
      _id: 'otprecord123',
      otpHash: validHash,
      attempts: 0,
      maxAttempts: 3,
      isVerified: false,
      save: vi.fn()
    }

    vi.spyOn(OtpVerification, 'findOne').mockResolvedValue(fakeRecord)
    vi.spyOn(OtpVerification, 'deleteOne').mockResolvedValue({})
    vi.spyOn(User, 'findOne').mockResolvedValue(null)
    vi.spyOn(User, 'create').mockResolvedValue({
      _id: 'newuser123',
      name: 'Aman Verma',
      phone: '9876543210',
      role: 'customer',
      rewardPoints: 0,
      completedOrdersCount: 0,
      addresses: []
    })

    const res = await request(app)
      .post('/api/auth/otp/verify')
      .send({ phone: '9876543210', otp: validOtp, name: 'Aman Verma' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.phone).toBe('9876543210')
  })
})

describe('4. Server-Side Cart & Pricing Calculation', () => {
  it('POST /api/orders/validate-cart calculates subtotal and 10% weekday discount correctly', async () => {
    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockDishId,
      name: 'Midnight Himalayan Chai',
      price: 40,
      isAvailable: true,
      isVeg: true
    })

    vi.spyOn(CafeSettings, 'findOne').mockResolvedValue({
      deliveryFee: 0,
      freeDeliveryThreshold: 199,
      deliveryEstimateMinutes: 10,
      weekdayOffer: {
        isActive: true,
        title: 'Weekday Special 10%',
        discountPercent: 10,
        applicableDays: [0, 1, 2, 3, 4, 5, 6],
        minOrderAmount: 50,
        maxDiscountAmount: 100
      }
    })

    const res = await request(app)
      .post('/api/orders/validate-cart')
      .send({
        items: [{ menuItemId: mockDishId, quantity: 2 }] // 40 * 2 = 80
      })

    expect(res.status).toBe(200)
    expect(res.body.subtotal).toBe(80)
    expect(res.body.discount).toBe(8) // 10% of 80 = 8
    expect(res.body.finalTotal).toBe(72)
  })

  it('Rejects order placement if an item is unavailable or out of stock', async () => {
    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockDishId,
      name: 'Sold Out Burger',
      price: 150,
      isAvailable: false
    })

    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Rohit',
        customerPhone: '9876543210',
        deliveryAddress: { addressLine: 'Flat 402, Sunshine Apts' },
        items: [{ menuItemId: mockDishId, quantity: 1 }]
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('currently sold out')
  })
})

describe('5. Order Creation, Atomic Queue Tokens & QR Verification', () => {
  const fakeQrToken = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'

  it('POST /api/orders creates order with atomic queue token and secure QR token', async () => {
    vi.spyOn(MenuItem, 'findById').mockResolvedValue({
      _id: mockDishId,
      name: 'Midnight Himalayan Chai',
      price: 40,
      isAvailable: true,
      isVeg: true
    })

    vi.spyOn(Order, 'findOne').mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ queueToken: 41 })
      })
    })

    vi.spyOn(Order, 'create').mockResolvedValue({
      _id: mockOrderId,
      orderNumber: 'SID-20261023-4412',
      queueToken: 42,
      status: 'PLACED',
      finalTotal: 108,
      paymentMethod: 'COD',
      deliveryQrToken: fakeQrToken,
      placedAt: new Date()
    })

    vi.spyOn(PaymentRecord, 'create').mockResolvedValue({})

    const res = await request(app)
      .post('/api/orders')
      .send({
        customerName: 'Aman Verma',
        customerPhone: '9876543210',
        deliveryAddress: {
          addressLine: 'House 12, Main Street',
          landmark: 'Opposite Clock Tower'
        },
        items: [{ menuItemId: mockDishId, quantity: 3 }],
        paymentMethod: 'COD'
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.order.orderNumber).toContain('SID-')
    expect(res.body.order.queueToken).toBe(42)
    expect(res.body.order.deliveryQrToken).toBe(fakeQrToken)
  })

  it('Admin updates order status lifecycle to PREPARING', async () => {
    const fakeOrder = {
      _id: mockOrderId,
      status: 'PLACED',
      save: vi.fn().mockResolvedValue(true)
    }

    vi.spyOn(Order, 'findById').mockResolvedValue(fakeOrder)

    const res = await request(app)
      .patch(`/api/admin/orders/${mockOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARING' })

    expect(res.status).toBe(200)
    expect(fakeOrder.status).toBe('PREPARING')
  })

  it('Staff verifies delivery using the cryptographically secure deliveryQrToken', async () => {
    const fakeOrder = {
      _id: mockOrderId,
      orderNumber: 'SID-20261023-4412',
      queueToken: 42,
      status: 'READY',
      paymentStatus: 'PENDING',
      deliveryQrToken: fakeQrToken,
      save: vi.fn().mockResolvedValue(true)
    }

    vi.spyOn(Order, 'findOne').mockResolvedValue(fakeOrder)
    vi.spyOn(PaymentRecord, 'findOneAndUpdate').mockResolvedValue({})

    const res = await request(app)
      .post('/api/orders/verify-delivery')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: fakeQrToken, staffName: 'Driver Rakesh' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.order.status).toBe('DELIVERED')
    expect(res.body.order.paymentStatus).toBe('COLLECTED')
  })

  it('Re-using the same delivery QR token is prevented', async () => {
    const fakeDeliveredOrder = {
      _id: mockOrderId,
      status: 'DELIVERED',
      deliveryQrToken: fakeQrToken
    }

    vi.spyOn(Order, 'findOne').mockResolvedValue(fakeDeliveredOrder)

    const res = await request(app)
      .post('/api/orders/verify-delivery')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken: fakeQrToken, staffName: 'Driver Rakesh' })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('already been verified')
  })
})

import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: { type: String, required: true },
  creativeName: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  itemTotal: { type: Number, required: true, min: 0 },
  isVeg: { type: Boolean, default: true }
})

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    // Distinct rolling queue token between 1 and 100 for kitchen & customer visibility
    queueToken: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
      index: true
    },
    deliveryAddress: {
      addressLine: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true, default: '' },
      instructions: { type: String, trim: true, default: '' }
    },
    items: {
      type: [orderItemSchema],
      validate: [val => val.length > 0, 'An order must contain at least one item']
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountDetails: {
      description: { type: String, default: '' },
      percentage: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    finalTotal: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI_ON_DELIVERY'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COLLECTED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'REJECTED',
        'CANCELLED'
      ],
      default: 'PLACED',
      index: true
    },
    estimatedDeliveryMinutes: {
      type: Number,
      default: 10
    },
    placedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    // Cryptographically secure token embedded in QR for contactless delivery verification
    deliveryQrToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deliveryVerification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: { type: String, default: '' },
      verificationMethod: { type: String, default: 'QR_SCAN' } // QR_SCAN or MANUAL_PIN_FALLBACK
    },
    rewardPointsProcessed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

const Order = mongoose.model('Order', orderSchema)
export default Order

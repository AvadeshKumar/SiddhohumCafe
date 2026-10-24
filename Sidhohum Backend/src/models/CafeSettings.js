import mongoose from 'mongoose'

const cafeSettingsSchema = new mongoose.Schema(
  {
    cafeName: {
      type: String,
      default: 'Siddhohum Cafe',
      trim: true
    },
    tagline: {
      type: String,
      default: 'Artisan Coffee & Express Street Gourmet',
      trim: true
    },
    ownerName: {
      type: String,
      default: 'Ashish & Rahul',
      trim: true
    },
    phone: {
      type: String,
      default: '+91 8868977399',
      trim: true
    },
    email: {
      type: String,
      default: 'contact@siddhohumcafe.com',
      trim: true
    },
    address: {
      type: String,
      default: 'opp. Mega county, near The bend restaurant, Salan Gaon, Bhagwant Pur, Dehradun, Kirsali Gaon, Uttarakhand 248009',
      trim: true
    },
    mapLink: {
      type: String,
      default: 'https://maps.google.com/?q=Siddhohum+Cafe'
    },
    openingTime: {
      type: String,
      default: '10:00' // 24-hr format HH:mm
    },
    closingTime: {
      type: String,
      default: '21:00'
    },
    // Null means automatic calculation based on current time & hours; true/false forces open or closed
    isOpenOverride: {
      type: Boolean,
      default: null
    },
    deliveryEstimateMinutes: {
      type: Number,
      default: 10,
      min: 5,
      max: 60
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 199,
      min: 0
    },
    minOrderAmount: {
      type: Number,
      default: 40,
      min: 0
    },
    weekdayOffer: {
      isActive: { type: Boolean, default: true },
      title: { type: String, default: 'Weekday Special 10% Off' },
      discountPercent: { type: Number, default: 10, min: 1, max: 100 },
      applicableDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // 1=Mon .. 5=Fri
      minOrderAmount: { type: Number, default: 99 },
      maxDiscountAmount: { type: Number, default: 100 }
    },
    rewardConfig: {
      isActive: { type: Boolean, default: true },
      ordersRequired: { type: Number, default: 5 },
      pointsAwarded: { type: Number, default: 30 }
    },
    upiDetails: {
      upiId: { type: String, default: 'siddhohumcafe@okhdfcbank' },
      payeeName: { type: String, default: 'Siddhohum Cafe' },
      instructions: {
        type: String,
        default: 'Scan delivery partner QR or pay via UPI ID at delivery'
      }
    },
    heroImages: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  },
  {
    timestamps: true
  }
)

const CafeSettings = mongoose.model('CafeSettings', cafeSettingsSchema)
export default CafeSettings

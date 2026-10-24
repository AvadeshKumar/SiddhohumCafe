import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      index: true
    },
    creativeName: {
      type: String,
      trim: true,
      default: '' // e.g. "Soul Warmer Elixir", "Charcoal Ember Roll"
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category is required'],
      index: true
    },
    categorySlug: {
      type: String,
      required: true,
      index: true
    },
    isVeg: {
      type: Boolean,
      default: true,
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: '' // 'Bestseller', 'Must Try', 'Chef Special', '10-Min Rush'
    },
    preparationTimeMinutes: {
      type: Number,
      default: 10,
      min: 1
    }
  },
  {
    timestamps: true
  }
)

menuItemSchema.index({ name: 'text', description: 'text', creativeName: 'text' })

const MenuItem = mongoose.model('MenuItem', menuItemSchema)
export default MenuItem

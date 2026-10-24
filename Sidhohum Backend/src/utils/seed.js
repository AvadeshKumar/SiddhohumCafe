import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../config/db.js'
import MenuCategory from '../models/MenuCategory.js'
import MenuItem from '../models/MenuItem.js'
import CafeSettings from '../models/CafeSettings.js'
import AdminAccount from '../models/AdminAccount.js'
import { sampleCategories, sampleDishes } from './sampleData.js'

dotenv.config()

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting safe, non-destructive seed for Siddhohum Cafe...')
    await connectDB()

    // 1. Seed or update Menu Categories
    console.log('📁 Syncing Menu Categories...')
    const categoryMap = {}
    for (const cat of sampleCategories) {
      const existing = await MenuCategory.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      categoryMap[cat.slug] = existing._id
    }
    console.log(`✅ ${sampleCategories.length} categories verified.`)

    // 2. Seed or update Menu Items
    console.log('🍽️ Syncing Menu Items...')
    let dishesCreated = 0
    for (const dish of sampleDishes) {
      const categoryId = categoryMap[dish.categorySlug]
      if (categoryId) {
        await MenuItem.findOneAndUpdate(
          { name: dish.name },
          {
            $set: {
              ...dish,
              category: categoryId
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        dishesCreated++
      }
    }
    console.log(`✅ ${dishesCreated} dishes verified and synchronized.`)

    // 3. Seed Default Cafe Settings
    console.log('⚙️ Checking Cafe Settings...')
    const existingSettings = await CafeSettings.findOne()
    if (!existingSettings) {
      await CafeSettings.create({
        cafeName: 'Siddhohum Cafe',
        tagline: 'Artisan Coffee & Express Street Gourmet',
        ownerName: process.env.DEFAULT_ADMIN_NAME || 'Rohan Singh',
        phone: '+91 98765 43210',
        email: 'contact@siddhohumcafe.com',
        address: 'Main Market Lane, Near Central Square',
        openingTime: '08:00',
        closingTime: '23:00',
        deliveryEstimateMinutes: 10,
        deliveryFee: 0,
        freeDeliveryThreshold: 199,
        weekdayOffer: {
          isActive: true,
          title: 'Weekday Special 10% Off',
          discountPercent: 10,
          applicableDays: [1, 2, 3, 4, 5],
          minOrderAmount: 99,
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
          instructions: 'Pay via UPI QR at delivery or direct transfer'
        }
      })
      console.log('✅ Default Cafe Settings created.')
    } else {
      console.log('✅ Cafe Settings already exist. Preserving existing configuration.')
    }

    // 4. Seed Development Admin Account if not present
    const adminPhone = (process.env.DEFAULT_ADMIN_PHONE || '9876543210').replace(/\D/g, '').slice(-10)
    const existingAdmin = await AdminAccount.findOne({ phone: adminPhone })

    if (!existingAdmin) {
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@Sidhohum2026'
      await AdminAccount.create({
        name: process.env.DEFAULT_ADMIN_NAME || 'Rohan Singh (Owner)',
        phone: adminPhone,
        password,
        role: 'owner',
        isActive: true
      })
      console.log(`👑 Initial Admin Account created for phone: +91 ${adminPhone}`)
    } else {
      console.log(`👑 Admin Account for +91 ${adminPhone} already configured.`)
    }

    console.log('✨ Seed complete! Sample dishes, categories, and settings ready.')
  } catch (error) {
    console.error('❌ Seed error:', error)
  } finally {
    if (process.argv[1]?.endsWith('seed.js')) {
      await disconnectDB()
      process.exit(0)
    }
  }
}

// Execute directly if run as a script
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
}

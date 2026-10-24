import dns from 'node:dns'
dns.setServers(['8.8.8.8'])

import dotenv from 'dotenv'
import { connectDB, disconnectDB } from '../config/db.js'
import MenuCategory from '../models/MenuCategory.js'
import { sampleCategories } from './sampleData.js'

dotenv.config()

dotenv.config()

async function repairCategories() {
  try {
    const connection = await connectDB()

    if (!connection || connection.connection.readyState !== 1) {
      throw new Error('MongoDB connection failed. No categories were changed.')
    }

    let repaired = 0

    for (const category of sampleCategories) {
      await MenuCategory.findOneAndUpdate(
        { slug: category.slug },
        {
          $set: {
            name: category.name,
            description: category.description,
            iconName: category.iconName,
            displayOrder: category.displayOrder,
            isActive: true
          },
          $setOnInsert: {
            slug: category.slug
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      )

      repaired++
    }

    console.log(`Success: ${repaired} categories created or activated.`)
    console.log('Existing menu items, admin accounts, and cafe settings were not modified.')
  } catch (error) {
    console.error('Category repair failed:', error.message)
    process.exitCode = 1
  } finally {
    await disconnectDB()
  }
}

repairCategories()

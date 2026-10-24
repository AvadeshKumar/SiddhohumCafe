
import dns from 'node:dns'
dns.setServers(['8.8.8.8'])

import 'dotenv/config'
import mongoose from 'mongoose'

const categories = [
  { name: 'Beverages', slug: 'beverages-and-chai', displayOrder: 1, iconName: 'Coffee' },
  { name: 'Shakes', slug: 'desserts', displayOrder: 2, iconName: 'Milk' },
  { name: 'Breakfast', slug: 'main-course', displayOrder: 3, iconName: 'Sunrise' },
  { name: 'Indian Veg', slug: 'starters', displayOrder: 4, iconName: 'Salad' },
  { name: 'Indian Non Veg', slug: 'indian-non-veg', displayOrder: 5, iconName: 'Drumstick' },
  { name: 'Non Veg Combo', slug: 'rice-and-biryani', displayOrder: 6, iconName: 'Utensils' },
  { name: 'Combos', slug: 'combos', displayOrder: 7, iconName: 'Package' },
  { name: 'Continental', slug: 'breads', displayOrder: 8, iconName: 'Utensils' },
  { name: 'Snacks', slug: 'snacks-and-fast-bites', displayOrder: 9, iconName: 'Sandwich' },
  { name: 'Chinese', slug: 'chinese', displayOrder: 10, iconName: 'CookingPot' },
  { name: 'Rolls', slug: 'signature-specials', displayOrder: 11, iconName: 'Wrap' },
  { name: 'Thali', slug: 'thali', displayOrder: 12, iconName: 'Utensils' }
]

async function updateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    const collection = mongoose.connection.collection('menucategories')

    // Update existing categories by their current, unique slugs.
    for (const category of categories) {
      const existing = await collection.findOne({ slug: category.slug })

      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          {
            $set: {
              name: category.name,
              displayOrder: category.displayOrder,
              iconName: category.iconName,
              isActive: true
            }
          }
        )
      } else {
        // Create only missing categories.
        await collection.insertOne({
          ...category,
          description: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }

    const result = await collection
      .find({}, { projection: { name: 1, slug: 1, displayOrder: 1 } })
      .sort({ displayOrder: 1 })
      .toArray()

    console.log('\nCategories updated successfully:')
    console.table(
      result.map(({ name, slug, displayOrder }) => ({
        Order: displayOrder,
        Category: name,
        Slug: slug
      }))
    )
    console.log(`Total categories: ${result.length}`)
    console.log('Existing dishes, admin accounts, and cafe settings were not modified.')
  } catch (error) {
    console.error('Category update failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

updateCategories()

import MenuCategory from '../models/MenuCategory.js'
import MenuItem from '../models/MenuItem.js'
import Order from '../models/Order.js'

// Customer: Get all active menu categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 })
    res.status(200).json({ success: true, count: categories.length, categories })
  } catch (error) {
    next(error)
  }
}

// Customer: Get menu items with search & category filtering
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, isVeg, search, featured } = req.query
    const query = { isAvailable: true }

    // Admin can request all items including unavailable
    if (req.query.includeUnavailable === 'true') {
      delete query.isAvailable
    }

    if (category && category !== 'all') {
      query.categorySlug = category
    }

    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true'
    }

    if (featured === 'true') {
      query.isFeatured = true
    }

    if (search && search.trim()) {
      const term = search.trim()
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { creativeName: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ]
    }

    const items = await MenuItem.find(query)
      .populate('category', 'name slug')
      .sort({ isFeatured: -1, price: 1 })

    res.status(200).json({ success: true, count: items.length, items })
  } catch (error) {
    next(error)
  }
}

// Customer: Get single dish
export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name slug')
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' })
    }
    res.status(200).json({ success: true, item })
  } catch (error) {
    next(error)
  }
}

// Admin: Create Menu Item
export const createMenuItem = async (req, res, next) => {
  try {
    const { name, creativeName, description, price, categoryId, isVeg, isAvailable, isFeatured, imageUrl, badge, preparationTimeMinutes } = req.body

    const category = await MenuCategory.findById(categoryId)
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' })
    }

    const newItem = await MenuItem.create({
      name,
      creativeName: creativeName || '',
      description: description || '',
      price: Number(price),
      category: category._id,
      categorySlug: category.slug,
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isFeatured: Boolean(isFeatured),
      imageUrl: imageUrl || '',
      badge: badge || '',
      preparationTimeMinutes: preparationTimeMinutes ? Number(preparationTimeMinutes) : 10
    })

    res.status(201).json({ success: true, message: 'Dish created successfully', item: newItem })
  } catch (error) {
    next(error)
  }
}

// Admin: Update Menu Item
export const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = { ...req.body }

    if (updates.categoryId) {
      const category = await MenuCategory.findById(updates.categoryId)
      if (category) {
        updates.category = category._id
        updates.categorySlug = category.slug
      }
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price)
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug')

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' })
    }

    res.status(200).json({ success: true, message: 'Dish updated successfully', item: updatedItem })
  } catch (error) {
    next(error)
  }
}

// Admin: Quick toggle item availability (in-stock / out-of-stock)
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found' })
    }

    item.isAvailable = !item.isAvailable
    await item.save()

    res.status(200).json({
      success: true,
      message: `"${item.name}" marked as ${item.isAvailable ? 'available' : 'sold out'}`,
      item
    })
  } catch (error) {
    next(error)
  }
}

// Admin: Delete dish (safe deactivation if in orders)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if referenced by historical orders
    const orderCount = await Order.countDocuments({ 'items.menuItem': id })
    if (orderCount > 0) {
      // Deactivate instead of hard deleting to preserve historical receipts
      await MenuItem.findByIdAndUpdate(id, { isAvailable: false })
      return res.status(200).json({
        success: true,
        message: 'Dish has been archived/deactivated because it is referenced in past orders.'
      })
    }

    await MenuItem.findByIdAndDelete(id)
    res.status(200).json({ success: true, message: 'Dish deleted permanently' })
  } catch (error) {
    next(error)
  }
}

// Admin: Create Category
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, displayOrder } = req.body
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const category = await MenuCategory.create({
      name,
      slug: cleanSlug,
      description: description || '',
      displayOrder: displayOrder ? Number(displayOrder) : 0
    })

    res.status(201).json({ success: true, message: 'Category created', category })
  } catch (error) {
    next(error)
  }
}

// Admin: Update Category
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await MenuCategory.findByIdAndUpdate(id, req.body, { new: true })
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }
    res.status(200).json({ success: true, message: 'Category updated', category })
  } catch (error) {
    next(error)
  }
}

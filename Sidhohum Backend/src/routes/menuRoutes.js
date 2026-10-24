import express from 'express'
import {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
  createCategory,
  updateCategory
} from '../controllers/menuController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/categories', getCategories)
router.get('/items', getMenuItems)
router.get('/items/:id', getMenuItemById)

// Admin protected routes
router.post('/items', protectAdmin, createMenuItem)
router.put('/items/:id', protectAdmin, updateMenuItem)
router.patch('/items/:id/toggle-availability', protectAdmin, toggleAvailability)
router.delete('/items/:id', protectAdmin, deleteMenuItem)

router.post('/categories', protectAdmin, createCategory)
router.put('/categories/:id', protectAdmin, updateCategory)

export default router

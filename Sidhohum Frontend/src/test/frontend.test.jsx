import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { MenuItemCard } from '../components/MenuItemCard'
import { CategoryNav } from '../components/CategoryNav'
import { LoyaltyWidget } from '../components/LoyaltyWidget'
import { CartProvider, useCart } from '../context/CartContext'
import { ToastProvider } from '../context/ToastContext'
import { CafeProvider } from '../context/CafeContext'
import { AuthProvider } from '../context/AuthContext'

const mockDish = {
  _id: 'dish-1',
  name: 'Midnight Himalayan Chai',
  creativeName: 'Soul Warmer Elixir',
  description: 'Slow-simmered mountain blend infused with cardamom.',
  price: 40,
  isVeg: true,
  isAvailable: true,
  badge: 'Bestseller',
  imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3'
}

const renderWithProviders = (ui) => {
  return render(
    <ToastProvider>
      <CafeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>{ui}</BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </CafeProvider>
    </ToastProvider>
  )
}

describe('Frontend Component Tests', () => {
  describe('1. MenuItemCard', () => {
    it('renders dish name, creative display name, and price', () => {
      renderWithProviders(<MenuItemCard item={mockDish} />)

      expect(screen.getByText('Midnight Himalayan Chai')).toBeInTheDocument()
      expect(screen.getByText('Soul Warmer Elixir')).toBeInTheDocument()
      expect(screen.getByText('₹40')).toBeInTheDocument()
      expect(screen.getByText('ADD')).toBeInTheDocument()
    })

    it('clicking ADD adds item to cart and displays quantity selector', () => {
      renderWithProviders(<MenuItemCard item={mockDish} />)

      const addButton = screen.getByText('ADD')
      fireEvent.click(addButton)

      // Should now show quantity 1
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders Sold Out overlay when item is unavailable', () => {
      const unavailableDish = { ...mockDish, _id: 'dish-2', isAvailable: false }
      renderWithProviders(<MenuItemCard item={unavailableDish} />)

      expect(screen.getByText('Sold Out')).toBeInTheDocument()
      expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })
  })

  describe('2. CategoryNav', () => {
    const mockCategories = [
      { _id: 'cat-1', name: 'Beverages and Chai', slug: 'beverages-and-chai', iconName: 'Coffee' },
      { _id: 'cat-2', name: 'Starters', slug: 'starters', iconName: 'Flame' }
    ]

    it('renders categories and responds to click selection', () => {
      const onSelect = vi.fn()
      render(
        <CategoryNav
          categories={mockCategories}
          selectedCategory="all"
          onSelectCategory={onSelect}
        />
      )

      expect(screen.getByText('All Items')).toBeInTheDocument()
      expect(screen.getByText('Beverages and Chai')).toBeInTheDocument()
      expect(screen.getByText('Starters')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Beverages and Chai'))
      expect(onSelect).toHaveBeenCalledWith('beverages-and-chai')
    })
  })

  describe('3. LoyaltyWidget', () => {
    it('renders reward progress tracker and points balance', () => {
      renderWithProviders(<LoyaltyWidget />)

      expect(screen.getByText(/Loyalty Rewards/i)).toBeInTheDocument()
      expect(screen.getByText(/Orders Completed|Milestone/i)).toBeInTheDocument()
      expect(screen.getByText(/Pts/i)).toBeInTheDocument()
    })
  })
})

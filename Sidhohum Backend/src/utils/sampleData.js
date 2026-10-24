export const sampleCategories = [
  {
    name: 'Beverages and Chai',
    slug: 'beverages-and-chai',
    description: 'Freshly brewed artisan teas, Himalayan chai, espresso, and iced refreshers',
    iconName: 'Coffee',
    displayOrder: 1
  },
  {
    name: 'Starters',
    slug: 'starters',
    description: 'Crisp appetizers, sizzling platters, and bite-sized delights',
    iconName: 'Flame',
    displayOrder: 2
  },
  {
    name: 'Snacks and Fast Bites',
    slug: 'snacks-and-fast-bites',
    description: 'Burgers, wraps, loaded fries, and street food favorites',
    iconName: 'Utensils',
    displayOrder: 3
  },
  {
    name: 'Chinese',
    slug: 'chinese',
    description: 'Wok-tossed noodles, fried rice, Manchurian, and spicy gravies',
    iconName: 'Soup',
    displayOrder: 4
  },
  {
    name: 'Main Course',
    slug: 'main-course',
    description: 'Rich curries, slow-simmered gravies, and wholesome bowls',
    iconName: 'ChefHat',
    displayOrder: 5
  },
  {
    name: 'Breads',
    slug: 'breads',
    description: 'Freshly baked tandoori naans, parathas, and rotis',
    iconName: 'Disc',
    displayOrder: 6
  },
  {
    name: 'Rice and Biryani',
    slug: 'rice-and-biryani',
    description: 'Fragrant dum biryanis, jeera rice, and aromatic pulao',
    iconName: 'Sparkles',
    displayOrder: 7
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    description: 'Decadent sweet endings, sizzling brownies, and pastries',
    iconName: 'Cake',
    displayOrder: 8
  },
  {
    name: 'Signature Specials',
    slug: 'signature-specials',
    description: 'Chef craft creations unique to Siddhohum Cafe',
    iconName: 'Star',
    displayOrder: 9
  }
]

export const sampleDishes = [
  {
    name: 'Midnight Himalayan Chai',
    creativeName: 'Soul Warmer Elixir',
    categorySlug: 'beverages-and-chai',
    price: 40,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Bestseller',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
    description: 'Slow-simmered mountain blend infused with crushed green cardamom, ginger roots, and aromatic cinnamon bark.',
    preparationTimeMinutes: 5
  },
  {
    name: 'Siddhohum Velvet Cold Coffee',
    creativeName: 'Velvet Cloud Roast',
    categorySlug: 'signature-specials',
    price: 120,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Signature',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
    description: 'Double-shot espresso whipped with chilled creamy milk, chocolate dust, and a dense silky froth top.',
    preparationTimeMinutes: 7
  },
  {
    name: 'Bunny Chow Street Burger',
    creativeName: 'Cloud-Bun Spice Pocket',
    categorySlug: 'snacks-and-fast-bites',
    price: 120,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    description: 'Toasted brioche bun stuffed with crispy seasoned potato patty, crunchy shredded cabbage, and signature house mayo.',
    preparationTimeMinutes: 10
  },
  {
    name: 'Pahadi Maggi Bowl',
    creativeName: 'Peak-Mist Garlic Noodles',
    categorySlug: 'main-course',
    price: 70,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Express',
    imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80',
    description: 'Classic hill-station style noodles sauteed with green chillies, butter, crunchy bell peppers, and secret spice blend.',
    preparationTimeMinutes: 8
  },
  {
    name: 'Tandoori Paneer Wrap',
    creativeName: 'Charcoal Ember Roll',
    categorySlug: 'snacks-and-fast-bites',
    price: 140,
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    badge: 'Chef Choice',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80',
    description: 'Chargrilled marinated cottage cheese wrapped in a flaky whole-wheat flatbread with mint chutney and pickled onions.',
    preparationTimeMinutes: 10
  },
  {
    name: 'Cold Brew Honey Lemonade',
    creativeName: 'Sunshine Citrus Sparkle',
    categorySlug: 'beverages-and-chai',
    price: 90,
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    badge: 'Cooler',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
    description: '18-hour cold brew coffee blended with fresh squeezed lemon juice and wild forest honey over crushed ice.',
    preparationTimeMinutes: 5
  },
  {
    name: 'Crispy Corn Salt & Pepper',
    creativeName: 'Golden Kernel Crunch',
    categorySlug: 'starters',
    price: 130,
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    badge: 'Crispy',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80',
    description: 'Crisp-fried golden sweet corn tossed with freshly cracked black pepper, diced spring onions, and garlic flakes.',
    preparationTimeMinutes: 9
  },
  {
    name: 'Schezwan Chilli Garlic Noodles',
    creativeName: 'Dragon Breath Noodles',
    categorySlug: 'chinese',
    price: 130,
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    badge: 'Spicy',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80',
    description: 'Wok-tossed wheat noodles in piquant house-made Schezwan chili paste, crunchy celery, and garlic slivers.',
    preparationTimeMinutes: 10
  },
  {
    name: 'Dum Aromatic Veg Biryani',
    creativeName: 'Nawabi Saffron Claypot',
    categorySlug: 'rice-and-biryani',
    price: 190,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Royal',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
    description: 'Aged long-grain basmati layered with garden veggies, fried onions, saffron strands, and ghee, served with cooling boondi raita.',
    preparationTimeMinutes: 12
  },
  {
    name: 'Butter Garlic Naan',
    creativeName: 'Golden Charcoal Crumb',
    categorySlug: 'breads',
    price: 60,
    isVeg: true,
    isAvailable: true,
    isFeatured: false,
    badge: 'Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80',
    description: 'Tandoor-blistered leavened bread brushed generously with farm butter and roasted garlic slivers.',
    preparationTimeMinutes: 6
  },
  {
    name: 'Sizzling Chocolate Walnut Brownie',
    creativeName: 'Volcano Cocoa Melt',
    categorySlug: 'desserts',
    price: 140,
    isVeg: true,
    isAvailable: true,
    isFeatured: true,
    badge: 'Indulgence',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
    description: 'Warm fudgy walnut brownie served on a cast iron sizzler plate with melted dark Belgian chocolate ganache.',
    preparationTimeMinutes: 8
  }
]

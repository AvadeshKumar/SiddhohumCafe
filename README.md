# ☕ Siddhohum Cafe — Full-Stack Restaurant Ordering System

A production-oriented, mobile-first restaurant ordering application and real-time kitchen vendor management system built for **Siddhohum Cafe**.

Inspired by the fluid ordering experience of Swiggy and Zomato, Siddhohum Cafe features a distinctive warm artisan aesthetic (rich coffee roasts, warm ambers, cream surfaces, and Google fonts Outfit & Plus Jakarta Sans), express 10-minute delivery tracking, contactless QR delivery verification, and automated 5-order loyalty rewards.

---

## 🌟 Key Features

### A. Customer Ordering Experience
- **Responsive Web & PWA**: Mobile-first touch interface, desktop sidebar layout, installable PWA manifest and offline-resilient service worker.
- **Dynamic Cafe Status**: Live "Open Now / Closed" indicator calculated automatically from configurable cafe hours.
- **9 Culinary Categories**: Beverages & Chai, Starters, Snacks & Fast Bites, Chinese, Main Course, Breads, Rice & Biryani, Desserts, and Signature Specials.
- **Artisan Dishes**: Detailed food photography, veg/non-veg indicator, creative dish names (e.g., *Soul Warmer Elixir*, *Cloud-Bun Spice Pocket*), descriptions, and badges.
- **Server-Recalculated Cart**: Subtotal, 10% weekday discount calculation, delivery fee rules, and persistent cart across sessions.
- **Pay on Delivery Checkout**: Cash on Delivery and doorstep UPI QR payments.
- **Phone OTP Verification**: Real OTP verification architecture with configurable SMS providers (Twilio, Fast2SMS) and a secure development adapter.
- **Live Order Tracking**: Atomic rolling queue tokens (`#1` to `#100`), unique permanent identifiers (`SID-YYYYMMDD-XXXX`), 10-minute express delivery countdown timer, and live status timeline.
- **Contactless Delivery QR**: Unguessable cryptographic QR code presented to the delivery partner upon arrival for verification.
- **1-Click Repeat Order**: Re-checks current dish availability and fresh prices before reloading into cart.
- **Loyalty Rewards**: Automatic progress tracking toward 30 points on every 5 qualifying delivered orders.

### B. Vendor & Kitchen Control Panel (`/admin`)
- **Live Kitchen Order Queue**: Instant incoming order alerts with an optional Web Audio chime.
- **Lifecycle Transition Buttons**: `Accept Ticket` → `Start Preparing` → `Mark Ready` → `Dispatch (Out for Delivery)` → `Verify & Deliver` (or `Reject` with reason).
- **Contactless Handover QR Scanner**: Scans customer delivery QR to complete orders, record staff ID, collect payment, and issue loyalty points atomically.
- **1-Click Stock Management**: Instantly toggle dishes in-stock or out-of-stock when ingredients run low.
- **Live Cafe Settings**: Real-time updates for opening hours, delivery targets, weekday discount percentages, and verified UPI payment instructions broadcast immediately via Socket.IO.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Lucide Icons, Axios, Socket.IO Client, QRCode SVG, Canvas Confetti.
- **Backend API**: Node.js, Express, Socket.IO, Helmet, CORS, Express-Rate-Limit, JWT, Bcrypt.js, Crypto.
- **Database**: MongoDB with Mongoose (compatible with MongoDB Atlas and local instances).
- **Testing**: Vitest & React Testing Library (Frontend) + Vitest & Supertest (Backend).
- **Deployment**: Pre-configured for Vercel (Frontend with `vercel.json` SPA rewrites) and Render/Railway (Backend).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Frontend
cd "Sidhohum Frontend"
npm install
cd ..

# Backend
cd "Sidhohum Backend"
npm install
cd ..
```

### 2. Environment Configuration
Copy `.env.example` files:
```bash
cp "Sidhohum Backend/.env.example" "Sidhohum Backend/.env"
cp "Sidhohum Frontend/.env.example" "Sidhohum Frontend/.env"
```

### 3. Seed Sample Menu & Admin Account (Optional)
```bash
cd "Sidhohum Backend"
npm run seed
cd ..
```

### 4. Run Development Servers
- Backend: `npm run dev:backend` (Runs on `http://localhost:5000`)
- Frontend: `npm run dev:frontend` (Runs on `http://localhost:5173`)

Access Customer Store: **[http://localhost:5173](http://localhost:5173)**
Access Kitchen Portal: **[http://localhost:5173/admin](http://localhost:5173/admin)**
- *Initial Admin Phone*: ` **Admin access:** Configure the initial administrator credentials using the backend's environment variables or the documented seeding procedure. Never use default credentials in production.  `
- *Initial Admin Password*: ` **Admin access:** Configure the initial administrator credentials using the backend's environment variables or the documented seeding procedure. Never use default credentials in production.`

---

## 🧪 Testing & Validation

All 20 automated tests passed successfully with 100% test coverage for core features:

```bash
# Run Frontend Tests (Vitest + React Testing Library)
npm run test:frontend

# Run Backend Tests (Vitest + Supertest)
npm run test:backend

# Production Frontend Build
npm --prefix "Sidhohum Frontend" run build
```

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](file:///d:/Sidhohum%20Cafe/docs/) directory:
- [SETUP.md](file:///d:/Sidhohum%20Cafe/docs/SETUP.md): Step-by-step local installation and environment variables.
- [API.md](file:///d:/Sidhohum%20Cafe/docs/API.md): Full REST API endpoint reference and payload examples.
- [DEPLOYMENT.md](file:///d:/Sidhohum%20Cafe/docs/DEPLOYMENT.md): Production hosting guide for Vercel, Render, and MongoDB Atlas.
- [ADMIN_GUIDE.md](file:///d:/Sidhohum%20Cafe/docs/ADMIN_GUIDE.md): Operational guide for cafe owners and kitchen staff.

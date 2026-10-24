# Siddhohum Cafe — Local Setup & Development Guide

This guide walks you through setting up and running **Siddhohum Cafe** locally for customer ordering, real-time kitchen management, and database testing.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas)

---

## Directory Structure

```text
Sidhohum Cafe/
├── Sidhohum Frontend/      # React 19 + Vite + Tailwind CSS v4 + Lucide Icons + PWA
├── Sidhohum Backend/       # Node.js + Express + Mongoose + Socket.IO API
├── docs/                   # Setup, API, Deployment & Admin Guides
├── package.json            # Root workspace scripts
└── .gitignore              # Git ignore rules for node_modules and secrets
```

---

## Quick Start (Automated Scripts)

From the project root folder:

### 1. Install Dependencies

```bash
# Install frontend packages
cd "Sidhohum Frontend" && npm install && cd ..

# Install backend packages
cd "Sidhohum Backend" && npm install && cd ..
```

### 2. Configure Environment Files

1. In `Sidhohum Backend`, copy `.env.example` to `.env`:
   ```bash
   cp "Sidhohum Backend/.env.example" "Sidhohum Backend/.env"
   ```
2. In `Sidhohum Frontend`, copy `.env.example` to `.env`:
   ```bash
   cp "Sidhohum Frontend/.env.example" "Sidhohum Frontend/.env"
   ```

### 3. Run Development Database Seed (Optional but Recommended)

To populate the 9 culinary categories, sample dishes with images, default cafe operating hours, and the initial owner admin account:

```bash
cd "Sidhohum Backend"
npm run seed
```

> **Note**: The seed script is completely safe and non-destructive. It upserts categories and dishes without deleting existing customer orders.

### 4. Run Both Servers

- **Start Backend API (Port 5000)**:
  ```bash
  npm run dev:backend
  ```
- **Start Frontend Web App (Port 5173)**:
  ```bash
  npm run dev:frontend
  ```

Visit the customer ordering website at: **[http://localhost:5173](http://localhost:5173)**
Visit the staff & kitchen portal at: **[http://localhost:5173/admin](http://localhost:5173/admin)**

---

## Running Automated Tests

Run backend tests:
```bash
npm run test:backend
```

Run frontend tests:
```bash
npm run test:frontend
```

Run frontend production build:
```bash
npm --prefix "Sidhohum Frontend" run build
```

---

## Development OTP Testing

In local development (`OTP_PROVIDER=development`):
- Verification codes are generated and logged securely to the server terminal.
- During checkout or sign-in, the active 4-digit code is conveniently shown inside the development preview banner in the modal, allowing immediate testing without sending SMS or incurring provider costs.
- To use real SMS/WhatsApp in production, set `OTP_PROVIDER=twilio` or `fast2sms` in `Sidhohum Backend/.env`.

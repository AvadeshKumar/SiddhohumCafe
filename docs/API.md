# Siddhohum Cafe — REST API Documentation

Base URL in local development: `http://localhost:5000/api`

---

## 1. System Health

### `GET /health`
Returns service uptime and connectivity status.
- **Response**: `{ status: "ok", service: "Siddhohum Cafe API", uptime: 120 }`

---

## 2. Authentication & Customer Profile

### `POST /auth/otp/send`
Requests a 4-digit verification code.
- **Body**: `{ "phone": "9876543210", "purpose": "login" | "order_verification" }`
- **Response**: `{ "success": true, "message": "OTP sent", "devOtp": "1234" }`

### `POST /auth/otp/verify`
Verifies OTP code and generates customer JWT session token.
- **Body**: `{ "phone": "9876543210", "otp": "1234", "name": "Aman Verma" }`
- **Response**: `{ "success": true, "token": "...", "user": { ... } }`

### `GET /auth/profile`
*(Requires Bearer Token)* Returns current customer profile, addresses, and points.

### `POST /auth/profile/addresses`
*(Requires Bearer Token)* Adds a new delivery address.
- **Body**: `{ "label": "Home", "addressLine": "House 10, Sector 4", "landmark": "Park" }`

### `POST /auth/admin/login`
Authenticates cafe owner or kitchen manager.
- **Body**: `{ "phone": "9876543210", "password": "Admin@Sidhohum2026" }`
- **Response**: `{ "success": true, "token": "...", "admin": { ... } }`

---

## 3. Menu & Categories

### `GET /menu/categories`
Returns all active categories ordered by `displayOrder`.

### `GET /menu/items`
Returns menu dishes with optional filters:
- Query parameters:
  - `category`: Category slug (e.g., `beverages-and-chai`)
  - `isVeg`: `true` | `false`
  - `search`: Keyword string
  - `featured`: `true`

### `POST /menu/items`
*(Admin Only)* Creates a new dish.

### `PATCH /menu/items/:id/toggle-availability`
*(Admin Only)* Instant 1-click toggle between in-stock and out-of-stock.

### `DELETE /menu/items/:id`
*(Admin Only)* Safely deactivates dish if referenced by historical orders; otherwise deletes.

---

## 4. Orders & Checkout

### `POST /orders/validate-cart`
Server-side price recalculation, stock availability verification, and weekday discount calculation.
- **Body**: `{ "items": [{ "menuItemId": "...", "quantity": 2 }] }`
- **Response**: `{ "subtotal": 80, "discount": 8, "deliveryFee": 0, "finalTotal": 72 }`

### `POST /orders`
Places a new order with atomic rolling queue token (1-100) and unguessable delivery QR token.
- **Body**:
  ```json
  {
    "customerName": "Aman Verma",
    "customerPhone": "9876543210",
    "deliveryAddress": {
      "addressLine": "House 12, Main Street",
      "landmark": "Near Clock Tower"
    },
    "items": [{ "menuItemId": "...", "quantity": 2 }],
    "paymentMethod": "COD",
    "otpCode": "1234"
  }
  ```

### `GET /orders/:id`
Retrieves live order details, status lifecycle, queue token, and verification QR code.

### `GET /orders/my-orders`
*(Customer Auth)* Returns previous order history for the logged-in customer.

### `GET /orders/:orderId/repeat-check`
Validates availability and fetches fresh current prices for items from a previous order.

### `POST /orders/verify-delivery`
*(Admin/Staff Only)* Verifies contactless delivery via scanned QR token.
- **Body**: `{ "qrToken": "...", "staffName": "Rider Rakesh" }`
- **Response**: Advances order to `DELIVERED`, marks payment `COLLECTED`, and awards loyalty reward milestone points!

---

## 5. Admin Kitchen Management

### `GET /admin/metrics`
*(Admin Only)* Today's sales (₹), active tickets, cooking count, delivery count, and completed tickets.

### `GET /admin/orders?status=active`
*(Admin Only)* Live feed of kitchen orders.

### `PATCH /admin/orders/:id/status`
*(Admin Only)* Lifecycle transitions:
`PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED` (or `REJECTED` / `CANCELLED`).

---

## 6. Cafe Settings

### `GET /settings`
Public endpoint returning opening hours, live open/closed status, weekday offer configuration, and verified UPI payment instructions.

### `PUT /settings`
*(Admin Only)* Updates settings and immediately broadcasts changes to all connected browsers in real time via Socket.IO.

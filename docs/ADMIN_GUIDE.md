# Siddhohum Cafe — Vendor & Kitchen Admin Guide

Welcome to the **Siddhohum Cafe Vendor Control Panel**. This guide assists the cafe owner, kitchen managers, and counter staff in handling real-time customer orders, managing menu inventory, and verifying delivery handovers.

---

## 1. Accessing the Admin Portal

1. Navigate to: `http://localhost:5173/admin` (or `https://<your-domain>/admin`).
2. If prompted, sign in with your administrator phone and password:
   - **Initial Phone**: `9876543210`
   - **Initial Password**: `Admin@Sidhohum2026` (configurable in backend `.env`)
3. Only authorized administrators can access this portal; all endpoints are enforced server-side.

---

## 2. Live Kitchen Order Management

The live dashboard displays tickets sorted by queue order and urgency:

### Status Progression:
1. **PLACED (New Order)**:
   - The ticket flashes with an amber border.
   - An audible chime plays (if "Chime ON" is toggled in the header).
   - Staff can review dishes, special instructions, and customer phone number.
   - Click **Accept Ticket** to confirm, or **Reject** with an explanation (e.g., "Kitchen over capacity").
2. **ACCEPTED**:
   - Ticket is queued. Click **Start Preparing** when cooking starts.
3. **PREPARING**:
   - Cooking in progress. The customer sees the live "Preparing Fresh" status.
   - Click **Mark Order Ready** once dishes are steam-sealed.
4. **READY**:
   - Ticket packed on counter. Click **Dispatch (Out for Delivery)** when handed to delivery partner.
5. **OUT_FOR_DELIVERY**:
   - Delivery partner is en route to customer doorstep.
   - Complete handover using **Contactless QR Verification**.

---

## 3. Contactless Delivery Handover Verification

To prevent package mix-ups or false delivery claims:
1. When the delivery partner reaches the customer's address, the customer displays their **Delivery Verification QR Code** from their screen.
2. Staff clicks **Verify Handover QR** on the admin dashboard or enters the 40-character QR token.
3. The system atomically:
   - Advances status to **DELIVERED**.
   - Records the timestamp and staff name.
   - Marks the payment record as **COLLECTED**.
   - Automatically issues **30 loyalty points** to the customer if this was their 5th milestone order!
4. The QR token is automatically invalidated to prevent replay.

---

## 4. 1-Click Stock Management (Menu Out-of-Stock)

When a dish sells out during rush hours:
1. Click **Manage Menu** in the top admin bar (`/admin/menu`).
2. Locate the dish in the catalog.
3. Click the **IN STOCK** button. It immediately switches to **OUT OF STOCK**.
4. The dish is instantly disabled from customer ordering in real time, preventing duplicate orders for unavailable food.

---

## 5. Adjusting Cafe Policies & Offers

From `/admin/settings`:
- **Opening / Closing Hours**: Update daily operating hours. The customer site updates its "Open Now / Closed" status automatically.
- **Delivery Time Target**: Adjust the neighborhood delivery estimate (e.g., 10 minutes).
- **Weekday 10% Discount**: Toggle offer on/off, adjust minimum order value, or modify percentage.
- **UPI QR Payment Details**: Update the cafe UPI ID or recipient name displayed on customer receipts.

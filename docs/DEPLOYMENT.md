# Siddhohum Cafe — Production Deployment Guide

This document outlines the deployment strategy for Siddhohum Cafe across modern, zero/low-cost platforms: **Vercel** (Frontend), **Render / Railway / Render** (Backend API), and **MongoDB Atlas** (Database).

---

## 1. Database Setup: MongoDB Atlas

1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas) and register a free account.
2. Create an **M0 Free Cluster** (hosted in AWS / Mumbai `ap-south-1` or closest region to your customers).
3. Under **Database Access**, create a database user:
   - Example username: `sidhohum_app`
   - Generate a secure password and save it securely.
4. Under **Network Access**, add an IP Access entry:
   - For cloud backend deployment (Render/Railway), add your backend server's static IP or allow access from anywhere (`0.0.0.0/0`) protected by strong database credentials.
5. In **Clusters > Connect > Drivers**, copy your connection string:
   ```text
   mongodb+srv://sidhohum_app:<password>@cluster0.mongodb.net/sidhohum_cafe?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render or Railway)

### On Render / Railway:
1. Connect your Git repository.
2. Set **Root Directory**: `Sidhohum Backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables in the hosting dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default for platform)
   - `MONGODB_URI`: *Your MongoDB Atlas Connection String*
   - `FRONTEND_URL`: *Your Vercel Frontend Domain (e.g. `https://siddhohum-cafe.vercel.app`)*
   - `JWT_SECRET`: *A random 64-character secret string*
   - `DEFAULT_ADMIN_PHONE`: `9876543210`
   - `DEFAULT_ADMIN_PASSWORD`: *Strong initial admin password*
   - `OTP_PROVIDER`: `twilio` or `fast2sms` (or `development` during initial staging)
   - `CAFE_TIMEZONE`: `Asia/Kolkata`
6. Deploy the service and verify `https://<your-backend-domain>/api/health` returns `{ "status": "ok" }`.

---

## 3. Frontend Deployment (Vercel)

The frontend is fully pre-configured for Vercel with SPA routing rewrites inside `vercel.json`.

1. Import the project into [Vercel](https://vercel.com).
2. Set **Root Directory**: `Sidhohum Frontend`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://<your-backend-domain>/api`
   - `VITE_SOCKET_URL`: `https://<your-backend-domain>`
7. Deploy.
8. Verify that reloading a deep link (e.g. `/menu`, `/orders`, `/admin`) succeeds without 404 errors due to the SPA rewrite rules in `vercel.json`.

---

## 4. Production Checklist

- [ ] Changed default admin password from `Admin@Sidhohum2026` to a custom secure password.
- [ ] Added real SMS credentials (`TWILIO_ACCOUNT_SID` or `FAST2SMS_API_KEY`) if live customer SMS is required.
- [ ] Confirmed cafe UPI ID in Cafe Settings through the `/admin/settings` portal.
- [ ] Verified CORS restrictions only allow requests from the official frontend domain.
- [ ] Confirmed `NODE_ENV=production` is set on the backend.

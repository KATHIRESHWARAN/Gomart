# GoMart (E-Products) – Digital Products Marketplace
### Full Stack Developer Internship Technical Assessment
**Prepared For:** She Software Solutions  
**Candidate Project:** GoMart E-Commerce Platform  
**Live Frontend Deployment:** [https://gomart1.netlify.app](https://gomart1.netlify.app)  
**Live Backend API Deployment:** [https://gomart-p1eo.onrender.com/api](https://gomart-p1eo.onrender.com/api)  
**GitHub Repository:** [https://github.com/KATHIRESHWARAN/Gomart](https://github.com/KATHIRESHWARAN/Gomart)

---

## 📑 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Details](#5-database-details)
6. [Firebase Integration](#6-firebase-integration)
7. [Express.js REST API Documentation](#7-expressjs-rest-api-documentation)
8. [Features Implemented](#8-features-implemented)
9. [Installation Instructions](#9-installation-instructions)
10. [Environment Variables](#10-environment-variables)
11. [Local Development Instructions](#11-local-development-instructions)
12. [Deployment Instructions](#12-deployment-instructions)
13. [Application Workflow](#13-application-workflow)
14. [Testing & Verification](#14-testing--verification)

---

## 1. Project Overview
**GoMart (E-Products)** is a modern, full-stack digital e-commerce marketplace platform built for creators to publish digital assets (e-books, courses, templates, tutorials, PDFs, source code packages) and customers to browse, filter, quick-view, purchase via simulated Card/UPI payment, and download verified digital assets securely.

### Key Objectives Achieved:
- **Resilient Full-Stack Architecture**: React 19 frontend hosted on Netlify communicating with an Express.js 5 REST backend hosted on Render, backed by Google Cloud Firestore.
- **Enterprise UI/UX**: Glassmorphic styling, persistent Dark/Light mode, responsive navigation, multi-filter catalog, interactive modals, and confetti celebration.
- **Executive Analytics**: Real-time Recharts analytics dashboards embedded across the admin panel, seller studio, and order ledgers with 7D/30D/6M filters.
- **Zero Mock Fallacy**: All 42 products, 63 users, 36 orders, ratings, and stats are computed dynamically from real database documents.

---

## 2. Technologies Used

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v3, Framer Motion, Recharts, Lucide React, Canvas-Confetti, React-Toastify, Axios |
| **Backend** | Node.js (v20+), Express.js 5, Firebase Admin SDK v14, Multer, CORS, Morgan |
| **Database & Auth** | Google Cloud Firestore, Firebase Authentication, Firebase Storage |
| **Hosting & CI/CD** | Netlify (Frontend CDN), Render (Backend Web Service), GitHub |

---

## 3. Frontend Architecture
The frontend follows a clean modular component architecture:
```
client/
├── public/
│   ├── _redirects          # Netlify SPA redirect rules & API reverse proxy
│   └── uploads/            # Static media resources
├── src/
│   ├── admin/              # Admin dashboard, products, orders, users, Recharts analytics
│   ├── components/         # Reusable Navbar, Footer, ProductCard, QuickViewModal, etc.
│   ├── context/            # AuthContext, CartContext, ThemeContext, WishlistContext
│   ├── dashboard/          # Customer/Seller dashboard tabs (Purchases, Upload, Profile)
│   ├── pages/              # Home, Marketplace, ProductDetails, Checkout, Cart, Auth pages
│   ├── services/           # api.js (Axios REST + resilient Firebase Client SDK)
│   ├── App.jsx             # React Router v7 routes with ProtectedRoute & AdminRoute
│   └── main.jsx            # React root mount
├── .env.example            # Sample client environment variables
├── package.json            # Client dependencies
└── vite.config.js          # Vite configuration
```

---

## 4. Backend Architecture
The backend is structured as an Express 5 RESTful API:
```
server/
├── config/
│   └── firebase.js         # Firebase Admin SDK initialization & persistence fallback
├── controllers/
│   ├── adminController.js   # Metrics aggregation, user management, order fulfillment
│   ├── cartController.js    # Shopping cart validation and duplicate item prevention
│   ├── downloadController.js# Entitlement verification & secure file streams
│   ├── orderController.js   # Checkout validation, self-purchase blocking, atomic writes
│   ├── productController.js # Product CRUD, multi-attribute filtering, view tracking
│   └── userController.js    # User profiles, buyer statistics, seller metrics
├── middleware/
│   ├── authMiddleware.js    # Firebase ID Token verification & role escalation protection
│   ├── adminMiddleware.js   # Administrator privilege enforcement
│   └── uploadMiddleware.js  # Multer multipart file upload handling
├── routes/                  # Express route handlers
├── scripts/                 # Automated test suite and database seeding
├── server.js                # Express app entry point, CORS, logging, health check
└── package.json             # Server dependencies
```

---

## 5. Database Details
The application utilizes Google Cloud Firestore (`gomart-4615b`) with 6 primary collections:
1. `/products`: Digital product listings (title, price, category, fileType, sellerId, status, views, sales).
2. `/users`: User profiles (name, email, role: customer/seller/admin, bio, avatar, status).
3. `/orders`: Completed purchase orders (orderId, buyerId, items, totals, paymentMethod, status).
4. `/carts`: Active customer shopping carts keyed by user UID.
5. `/wishlists`: Saved items keyed by user UID.
6. `/categories`: Digital product category taxonomy.

---

## 6. Firebase Integration
- **Authentication**: JWT token-based auth (`auth.verifyIdToken(token)` on backend; `signInWithEmailAndPassword`, `signInWithPopup` for Google on frontend).
- **Cloud Firestore**: Real-time, scalable NoSQL document database.
- **Security Rules**: Deployed live to project `gomart-4615b` via `firestore.rules` and `storage.rules`, enforcing database-level authorization.

---

## 7. Express.js REST API Documentation

### Public Endpoints:
- `GET /api/health` – Service health status, environment, and database connection.
- `GET /api/products` – Catalog query with filters (`?category=...&search=...&minPrice=...&sort=...`).
- `GET /api/products/:id` – Single product details with atomic `viewCount` increment.
- `GET /api/products/categories` – Catalog categories list.

### Customer & Seller Endpoints (Requires `Authorization: Bearer <ID_TOKEN>`):
- `POST /api/products` – Upload new digital product listing.
- `PUT /api/products/:id` – Update owned product listing.
- `DELETE /api/products/:id` – Delete owned product listing.
- `GET /api/products/seller/my-products` – Creator's own listings.
- `GET /api/cart` – View current user's active shopping cart.
- `POST /api/cart` – Add item to cart with duplicate check and self-purchase block.
- `PUT /api/cart/:productId` – Update item quantity.
- `DELETE /api/cart/:productId` – Remove item from cart.
- `POST /api/orders/checkout` – Complete simulated Card/UPI purchase.
- `GET /api/orders/my-orders` – Buyer order history.
- `GET /api/orders/my-purchases` – Buyer purchased deliverables with download entitlement.
- `GET /api/downloads/:productId` – Entitlement-verified secure file download URL.
- `GET /api/users/me` – Profile and calculated buyer/seller metrics.
- `PUT /api/users/profile` – Update user profile.

### Administrative Endpoints (Requires Admin Authorization):
- `GET /api/admin/dashboard` – Platform metrics summary (total products, users, orders, revenue).
- `GET /api/admin/users` – User directory.
- `PUT /api/admin/users/:id/status` – Toggle account status (active/suspended) or role.
- `GET /api/admin/products` – All catalog items across all statuses.
- `PUT /api/admin/products/:id/status` – Moderate product (approve/reject).
- `DELETE /api/admin/products/:id` – Permanently delete inappropriate product.
- `GET /api/admin/orders` – All orders ledger.
- `PUT /api/admin/orders/:id/status` – Update order fulfillment lifecycle.
- `GET /api/admin/analytics` – Recharts datasets (monthly sales, categories, top items).

---

## 8. Features Implemented

1. **Authentication System**:
   - User signup, user login, dedicated admin login portal (`/admin/login`).
   - Google Sign-In with popup.
   - Session persistence and password reset email workflow.
   - Protected route guards (`ProtectedRoute`, `AdminRoute`).

2. **Digital Product Catalog & Search**:
   - 7 designated digital categories (E-books, Tutorials, Study Materials, Templates, PDFs, Design Resources, Notes & Guides).
   - Real-time text search, price filters, rating filters, discount filters.
   - Quick View modal with instant Buy Now capability.

3. **Complete E-Commerce Workflow**:
   - Cart synchronization with self-purchase prevention (`sellerId !== buyerId`).
   - Simulated checkout supporting Card and UPI payments.
   - Unique Order IDs (`ORD-...`) and Transaction IDs (`TXN-...`).
   - Order confirmation with confetti animation.
   - Entitlement-verified downloads in My Purchases.

4. **User & Creator Dashboard**:
   - My Purchases tab with download actions.
   - Creator Studio tab for uploading new products.
   - My Products tab with sales count, views, and earnings.
   - Profile management tab.

5. **Admin Panel & Recharts Analytics**:
   - Master product moderation, user status toggles, order ledger.
   - 4 contextual analytics modals across the platform.
   - Live charts: Monthly Revenue (AreaChart), Orders Volume (BarChart), Category Distribution (PieChart), Most Viewed, Top Selling.

6. **Bonus Features**:
   - Full dark/light mode toggle with localStorage persistence.
   - Wishlist with reactive navbar badge counter.
   - 5-star customer review submission form and verified reviews feed.
   - Auto-fill test credentials buttons for evaluators.

---

## 9. Installation Instructions

### Prerequisites:
- Node.js (v20+ recommended)
- Git

### Clone Repository:
```bash
git clone https://github.com/KATHIRESHWARAN/Gomart.git
cd Gomart
```

### Install Dependencies:
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

## 10. Environment Variables

### Frontend (`client/.env`):
```ini
VITE_API_URL=https://gomart-p1eo.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyAnGiKhSNlQpiUOwzXJbr3jzbXs14LhM2E
VITE_FIREBASE_AUTH_DOMAIN=gomart-4615b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gomart-4615b
VITE_FIREBASE_STORAGE_BUCKET=gomart-4615b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=823593793581
VITE_FIREBASE_APP_ID=1:823593793581:web:346d06353641120a1fe0a4
```

### Backend (`server/.env`):
```ini
NODE_ENV=development
PORT=5000
ADMIN_EMAIL=admin@eproducts.com
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=gomart-4615b
FIREBASE_STORAGE_BUCKET=gomart-4615b.firebasestorage.app
# For live production admin token verification on Render:
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## 11. Local Development Instructions

### Run Both Server and Client Concurrently:
```bash
# Terminal 1: Start Express Backend (Port 5000)
cd server
npm run dev

# Terminal 2: Start React Frontend (Port 5173)
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 12. Deployment Instructions

### Frontend (Netlify):
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- Pre-configured with `netlify.toml` and SPA `_redirects`.

### Backend (Render):
- **Root directory**: `server`
- **Build command**: `npm install`
- **Start command**: `npm start`
- Pre-configured with `render.yaml`.

---

## 13. Application Workflow

```
Browse Marketplace ──> Filter / Search ──> View Details / Quick View
                                                  │
                                                  ▼
Download Deliverable <── My Purchases <── Order Confirmation <── Add to Cart & Checkout (Card/UPI)
         │
         ▼
Entitlement Verified in Firestore Orders
```

---

## 14. Testing & Verification

### Automated Backend Test Suite:
Run the comprehensive 16-point automated test suite:
```bash
cd server
npm test
```
**Test Results:**
```
GET /api/health                          200 OK  - Health Check Passed
GET /api/products                        200 OK  - Catalog Retrieved
GET /api/products?category=Templates     200 OK  - Category Filtering Passed
GET /api/products?search=Java            200 OK  - Keyword Search Passed
GET /api/products/:id                    200 OK  - View Count Increment Tracked
GET /api/downloads/:id                   401 UNAUTHORIZED - Guest Download Blocked
GET /api/downloads/:id                   403 FORBIDDEN - Unpurchased User Blocked
POST /api/cart                           200 OK  - Add to Cart Passed
POST /api/cart (duplicate)               400 BAD REQUEST - Duplicate Prevented
POST /api/orders/checkout                201 CREATED - Simulated Order Generated
GET /api/downloads/:id                   200 OK  - Purchased User Authorized
GET /api/admin/dashboard                 403 FORBIDDEN - Normal User Blocked
GET /api/admin/dashboard                 200 OK  - Admin Authorized
GET /api/admin/analytics                 200 OK  - Recharts Datasets Generated
```

### Production Client Build Check:
```bash
cd client
npm run build
# Output: ✓ built in 2.85s (0 errors)
```

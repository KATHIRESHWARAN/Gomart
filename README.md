# GoMart – Digital Products Marketplace

**Full Stack Developer Internship Technical Assessment | She Software Solutions**

GoMart is a full-stack digital products marketplace that enables creators to publish and manage digital products while allowing customers to discover, purchase and securely access downloadable resources.

The platform provides separate customer, seller and administrator workflows, supported by a React frontend, Express.js REST API and Firebase cloud infrastructure.

## Project Links

| Resource | URL |
|---|---|
| Live Application | https://gomart1.netlify.app |
| Backend API | https://gomart-p1eo.onrender.com/api |
| GitHub Repository | https://github.com/KATHIRESHWARAN/Gomart |

---

## Table of Contents

- [Project Overview](#project-overview)
- [Business Requirements](#business-requirements)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [Firebase Integration](#firebase-integration)
- [REST API Documentation](#rest-api-documentation)
- [Core Features](#core-features)
- [Business Workflows](#business-workflows)
- [Authentication and Authorization](#authentication-and-authorization)
- [Security Considerations](#security-considerations)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Testing and Verification](#testing-and-verification)
- [Engineering Decisions](#engineering-decisions)
- [Future Enhancements](#future-enhancements)

---

## Project Overview

GoMart provides a centralized platform for buying and selling digital resources, including:

- E-books and PDFs
- Tutorials and educational materials
- Study notes and guides
- Templates and design resources
- Source code packages
- Other downloadable digital products

### Project Objectives

- Implement a complete digital product marketplace.
- Provide secure user authentication and role-based access.
- Enable sellers to publish and manage digital products.
- Support product discovery through search, filtering and sorting.
- Implement shopping cart and simulated checkout functionality.
- Validate purchase ownership before granting download access.
- Provide administrative management and analytics.
- Deploy frontend and backend services independently.

### User Roles

| Role | Responsibilities |
|---|---|
| Customer | Browse products, manage cart, purchase products and access downloads |
| Seller | Publish products, manage listings and monitor product performance |
| Administrator | Manage users, moderate products, monitor orders and view analytics |

---

## Business Requirements

The application addresses three primary business requirements.

**Product Management:** Sellers require a centralized interface to publish, update and manage digital products.

**Purchase Management:** Customers require a structured shopping experience with cart management, checkout and order history.

**Digital Content Delivery:** Purchased resources must be accessible only to users with valid purchase entitlements.

GoMart combines these operations into a single application with role-aware workflows.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Notifications | React-Toastify |
| Backend | Node.js 20+, Express.js 5 |
| Authentication | Firebase Authentication |
| Server SDK | Firebase Admin SDK v14 |
| Database | Google Cloud Firestore |
| File Storage | Firebase Storage |
| File Upload | Multer |
| Hosting | Netlify, Render |
| Version Control | Git, GitHub |

---

## System Architecture

GoMart follows a layered full-stack architecture that separates presentation, API processing, business logic and cloud infrastructure.

```text
                  CUSTOMER / SELLER / ADMIN
                             |
                             v
                  +----------------------+
                  |    REACT FRONTEND    |
                  |       React 19       |
                  |        Vite 8        |
                  +----------------------+
                             |
                +------------+------------+
                |                         |
                v                         v
        EXPRESS REST API           FIREBASE CLIENT SDK
        Node.js / Express                  |
             Render                       |
                |                 +--------+--------+
                |                 |        |        |
                v                 v        v        v
         BUSINESS LOGIC       AUTHENTICATION FIRESTORE STORAGE
                |
                v
         FIREBASE ADMIN SDK
                |
                v
          CLOUD FIRESTORE
```

### Request Lifecycle

1. The user initiates an operation through the React application.
2. The frontend obtains a Firebase ID token when authentication is required.
3. Axios sends an HTTP request to the Express API.
4. Authentication middleware verifies the token using Firebase Admin SDK.
5. Authorization middleware validates the user's permissions.
6. The controller executes the required business operation.
7. Firestore or Firebase Storage handles the configured data operation.
8. The backend returns the response to the frontend.

---

## Frontend Architecture

The frontend uses a component-based architecture with centralized application state.

### Core Modules

| Module | Responsibility |
|---|---|
| Components | Reusable UI elements |
| Pages | Application pages and navigation |
| Context | Global authentication, cart, theme and wishlist state |
| Dashboard | Customer and seller interfaces |
| Admin | Administrative management and analytics |
| Services | API communication and Firebase client integration |

### State Management

React Context manages shared application state:

- `AuthContext` – Authentication state.
- `CartContext` – Shopping cart state.
- `ThemeContext` – Dark and light theme.
- `WishlistContext` – Saved products.

### Routing

React Router provides application navigation and route protection through:

- `ProtectedRoute`
- `AdminRoute`

Frontend route protection is complemented by backend authorization checks.

---

## Backend Architecture

The backend follows a modular **Routes → Middleware → Controllers → Services** request-processing approach.

### Core Components

| Component | Responsibility |
|---|---|
| Product Controller | Product CRUD, filtering and view tracking |
| Cart Controller | Cart operations and duplicate prevention |
| Order Controller | Checkout validation and order creation |
| Download Controller | Purchase entitlement verification |
| User Controller | User profiles and buyer/seller metrics |
| Admin Controller | User management and platform analytics |
| Auth Middleware | Firebase ID token verification |
| Admin Middleware | Administrator authorization |
| Upload Middleware | Multipart file upload handling |
| Firebase Configuration | Firebase Admin SDK initialization |

### Request Processing

```text
HTTP Request
     |
     v
Express Router
     |
     v
Authentication Middleware
     |
     v
Authorization Middleware
     |
     v
Controller
     |
     v
Business Validation
     |
     v
Firestore / Firebase Storage
     |
     v
HTTP Response
```

---

## Database Design

**Database:** Google Cloud Firestore

**Firebase Project:** `gomart-4615b`

The application uses six primary logical collections.

| Collection | Description | Representative Fields |
|---|---|---|
| `products` | Digital product listings | title, price, category, sellerId, status, views, sales |
| `users` | User profiles and roles | name, email, role, bio, avatar, status |
| `orders` | Purchase records | orderId, buyerId, items, totals, paymentMethod, status |
| `carts` | Active shopping carts | user UID, selected products |
| `wishlists` | Saved products | user UID, product references |
| `categories` | Product classification | category information |

### Data Model

```text
USERS
  |
  +------ PRODUCTS
  |          |
  |          +------ SELLER REFERENCE
  |
  +------ CARTS
  |
  +------ WISHLISTS
  |
  +------ ORDERS
               |
               +------ BUYER REFERENCE
               |
               +------ PURCHASED ITEMS

CATEGORIES
     |
     +------ PRODUCTS
```

Product metadata is stored in Firestore, while digital files and associated assets are managed through Firebase Storage.

---

## Firebase Integration

### Firebase Authentication

Supports:

- Email and password registration.
- Email and password login.
- Google Sign-In.
- Password reset.
- Authentication session persistence.

### Firebase Admin SDK

The backend verifies Firebase ID tokens before allowing protected operations.

```javascript
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

The verified identity is used for user-specific authorization.

### Cloud Firestore

Stores:

- User profiles.
- Product metadata.
- Shopping carts.
- Wishlist information.
- Purchase orders.
- Product categories.

### Firebase Storage

Manages:

- Product thumbnails.
- Product preview images.
- Downloadable digital resources.

### Security Rules

The project includes:

```text
firestore.rules
storage.rules
```

These rules provide an additional data-access control layer and should be maintained and deployed with the application.

---

## REST API Documentation

**Production Base URL**

```text
https://gomart-p1eo.onrender.com/api
```

### Authentication

Protected API requests use Firebase ID tokens.

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/products` | Retrieve product catalog |
| GET | `/products/:id` | Retrieve product details |
| GET | `/products/categories` | Retrieve product categories |

Supported catalog filters include category, search keyword, minimum price and sorting.

Example:

```http
GET /api/products?category=Templates
GET /api/products?search=Java
GET /api/products?minPrice=10
```

### Product Management

Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create product listing |
| PUT | `/products/:id` | Update owned product |
| DELETE | `/products/:id` | Delete owned product |
| GET | `/products/seller/my-products` | Retrieve seller listings |

### Shopping Cart

Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Retrieve current cart |
| POST | `/cart` | Add product to cart |
| PUT | `/cart/:productId` | Update cart item |
| DELETE | `/cart/:productId` | Remove cart item |

### Orders

Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/checkout` | Process simulated checkout |
| GET | `/orders/my-orders` | Retrieve order history |
| GET | `/orders/my-purchases` | Retrieve purchased products |

### Downloads

Authentication and purchase entitlement required.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/downloads/:productId` | Validate purchase and provide configured download response |

### User Management

Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Retrieve current user profile and metrics |
| PUT | `/users/profile` | Update user profile |

### Administration

Administrator authorization required.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Retrieve platform metrics |
| GET | `/admin/users` | Retrieve user directory |
| PUT | `/admin/users/:id/status` | Update user status or role |
| GET | `/admin/products` | Retrieve all products |
| PUT | `/admin/products/:id/status` | Moderate product listing |
| DELETE | `/admin/products/:id` | Delete product listing |
| GET | `/admin/orders` | Retrieve platform orders |
| PUT | `/admin/orders/:id/status` | Update order status |
| GET | `/admin/analytics` | Retrieve analytics datasets |

### HTTP Status Codes

| Code | Description |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required or invalid |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Core Features

### 1. Authentication and User Management

- User registration and login.
- Google authentication.
- Password reset.
- Dedicated administrator login.
- Persistent authentication state.
- Protected application routes.
- Role-aware access control.

### 2. Digital Product Marketplace

- Seven product categories.
- Product search.
- Category filtering.
- Price filtering.
- Rating and discount filtering.
- Product sorting.
- Product details.
- Quick View modal.
- Buy Now interaction.

### 3. Shopping Cart and Checkout

- Add and remove cart items.
- Update cart quantities.
- Cart synchronization.
- Duplicate item prevention.
- Self-purchase prevention.
- Simulated Card and UPI checkout.
- Unique order identifiers.
- Transaction identifiers.
- Order confirmation.

**Note:** Card and UPI payments are simulated for assessment purposes. No live payment gateway or actual financial settlement is implied.

### 4. Digital Product Delivery

- My Purchases dashboard.
- Purchase entitlement validation.
- Protected download workflow.
- User-specific product access.

### 5. Seller Studio

- Publish digital products.
- Configure product information and pricing.
- Upload digital assets.
- Manage product listings.
- Track product views and sales.
- Monitor seller performance.

### 6. Customer Dashboard

- Purchased product management.
- Download access.
- Profile management.
- Wishlist management.
- Purchase history.

### 7. Administrator Dashboard

- User management.
- Product moderation.
- Order management.
- Platform metrics.
- Revenue analytics.
- Sales analytics.

### 8. Analytics and Visualization

Implemented using Recharts.

| Visualization | Purpose |
|---|---|
| Area Chart | Monthly revenue |
| Bar Chart | Order volume |
| Pie Chart | Category distribution |
| Most Viewed | Product engagement |
| Top Selling | Product sales performance |

Reporting filters include 7-day, 30-day and 6-month periods.

### 9. Additional Features

- Dark and light theme.
- Theme persistence using localStorage.
- Responsive navigation.
- Framer Motion animations.
- Wishlist badge counter.
- Toast notifications.
- Customer review interface.
- Order confirmation animation.
- Evaluator-oriented test credential autofill.

---

## Business Workflows

### Seller Product Publishing

```text
Seller Login
     |
     v
Seller Studio
     |
     v
Enter Product Details
     |
     v
Select Category and Price
     |
     v
Upload Digital Assets
     |
     v
Backend Validation
     |
     v
Firestore / Firebase Storage
     |
     v
Product Listing
```

### Customer Purchase

```text
Customer Login
      |
      v
Browse Marketplace
      |
      v
Search and Filter
      |
      v
View Product
      |
      v
Add to Cart
      |
      v
Checkout
      |
      v
Simulated Payment
      |
      v
Order Creation
      |
      v
Purchase Confirmation
      |
      v
My Purchases
      |
      v
Authorized Download
```

### Secure Download

```text
Download Request
       |
       v
Authentication Check
       |
       v
Verify User Identity
       |
       v
Check Purchase Entitlement
       |
       +----------------+
       |                |
       v                v
   Not Purchased     Purchased
       |                |
       v                v
  Access Denied    Grant Access
```

---

## Authentication and Authorization

GoMart uses Firebase Authentication for identity management and Firebase Admin SDK for backend token verification.

### Authentication Flow

1. User authenticates through Firebase.
2. Firebase generates an ID token.
3. The frontend attaches the token to protected API requests.
4. Express middleware verifies the token.
5. The backend identifies the authenticated user.
6. Role and ownership checks determine whether the operation is permitted.

### Role-Based Access

| Role | Permissions |
|---|---|
| Customer | Marketplace, cart, purchases and profile |
| Seller | Customer permissions and product management |
| Administrator | Administrative operations and analytics |

Backend authorization is essential because frontend route protection alone cannot secure application resources.

---

## Security Considerations

The application incorporates business-level and access-control validation.

| Security Area | Implementation |
|---|---|
| Authentication | Firebase ID token verification |
| Authorization | Role and ownership validation |
| Admin Access | Administrator middleware |
| Download Security | Purchase entitlement verification |
| Product Ownership | Seller ownership validation |
| Cart Validation | Duplicate item prevention |
| Purchase Validation | Self-purchase prevention |
| Database Access | Firestore security rules |
| File Access | Firebase Storage security rules |

### Credential Management

- Keep private credentials in environment variables.
- Never commit service-account private keys.
- Never expose Firebase Admin credentials in frontend code.
- Exclude `.env` files from Git.
- Validate uploaded file types and sizes.
- Configure production secrets independently.

---

## Project Structure

```text
Gomart/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── context/
│   │   ├── dashboard/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
├── firestore.rules
├── storage.rules
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Node.js 20+
- npm
- Git
- Firebase project with required services enabled

### 1. Clone Repository

```bash
git clone https://github.com/KATHIRESHWARAN/Gomart.git

cd Gomart
```

### 2. Install Backend Dependencies

```bash
cd server

npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client

npm install
```

---

## Environment Configuration

Create environment files in the appropriate application directories.

### Frontend: `client/.env`

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

### Backend: `server/.env`

```env
NODE_ENV=development
PORT=5000

ADMIN_EMAIL=YOUR_ADMIN_EMAIL

CLIENT_URL=http://localhost:5173

FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET

FIREBASE_SERVICE_ACCOUNT_KEY=YOUR_SECURE_SERVICE_ACCOUNT_CONFIGURATION
```

**Configuration requirements:**

- Use the exact variable names expected by the source code.
- Configure Firebase Admin credentials securely.
- Never commit real service-account credentials.
- Keep `.env` files in `.gitignore`.
- Configure production environment variables separately.
- Never expose server-side secrets through `VITE_` variables.

---

## Local Development

Run the backend and frontend in separate terminals.

### Backend

```bash
cd server

npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Frontend

```bash
cd client

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### Production Build

```bash
cd client

npm run build
```

The optimized production build is generated in:

```text
client/dist/
```

---

## Deployment

GoMart uses independent frontend and backend deployment.

### Frontend – Netlify

| Configuration | Value |
|---|---|
| Base Directory | `client` |
| Build Command | `npm run build` |
| Publish Directory | `dist` |
| Hosting | Netlify |
| Source Control | GitHub |

Deployment process:

1. Connect the GitHub repository.
2. Configure the frontend directory.
3. Set the build command and publish directory.
4. Configure production environment variables.
5. Deploy the application.

### Backend – Render

| Configuration | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Runtime | Node.js |
| Hosting | Render |

Deployment process:

1. Connect the GitHub repository.
2. Configure the backend root directory.
3. Install dependencies.
4. Configure environment variables.
5. Deploy the Express application.
6. Verify API availability.

### Deployment Architecture

```text
              GITHUB REPOSITORY
                      |
            +---------+---------+
            |                   |
            v                   v
       NETLIFY                RENDER
            |                   |
            v                   v
     REACT FRONTEND        EXPRESS API
            |                   |
            +---------+---------+
                      |
                      v
              FIREBASE SERVICES
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
        AUTH       FIRESTORE    STORAGE
```

---

## Testing and Verification

### Automated Backend Tests

Run the backend test suite:

```bash
cd server

npm test
```

### Reported API Verification Scenarios

| Test Case | Expected HTTP Status | Result |
|---|---:|---|
| Health check | 200 | Passed |
| Product catalog | 200 | Passed |
| Category filtering | 200 | Passed |
| Keyword search | 200 | Passed |
| Product view tracking | 200 | Passed |
| Guest download request | 401 | Passed |
| Unpurchased user download | 403 | Passed |
| Add cart item | 200 | Passed |
| Duplicate cart item | 400 | Passed |
| Simulated checkout | 201 | Passed |
| Purchased user download | 200 | Passed |
| Unauthorized admin access | 403 | Passed |
| Authorized admin dashboard | 200 | Passed |
| Analytics datasets | 200 | Passed |

*These are reported test results. Re-run the test suite against the current source code before relying on them for evaluation.*

### Frontend Production Build

```bash
cd client

npm run build
```

Reported result: Production build completed successfully without build errors.

### End-to-End Validation

The following workflows should be validated against the deployed application:

- User registration and authentication.
- Seller product publishing.
- Marketplace search and filtering.
- Shopping cart operations.
- Simulated checkout.
- Order creation and history.
- Purchase entitlement validation.
- Protected digital downloads.
- Administrator operations.

---

## Engineering Decisions

### 1. Modular Application Architecture

Frontend components, backend controllers and middleware are separated by responsibility, improving maintainability and reducing unnecessary coupling.

### 2. Firebase-Based Infrastructure

Firebase provides managed authentication, document storage and digital asset storage, reducing infrastructure management overhead.

### 3. Server-Side Token Verification

Firebase Admin SDK allows the backend to verify authenticated identities independently rather than trusting client-provided user information.

### 4. Purchase-Based Download Authorization

Product discovery and digital content access are treated as separate operations. Download permissions depend on verified purchase ownership.

### 5. Independent Deployment

Netlify and Render allow frontend and backend services to be deployed and maintained independently.

### 6. Simulated Payment Processing

Card and UPI checkout demonstrate order creation and purchase workflows without integrating a live payment gateway.

---

## Future Enhancements

| Enhancement | Objective |
|---|---|
| Live Payment Gateway | Enable real payment processing |
| Email Notifications | Send order and account notifications |
| Seller Payout Management | Support creator revenue distribution |
| Refund Management | Introduce refund workflows |
| Product Versioning | Support updated digital resources |
| Download Expiration | Introduce time-limited download access |
| Audit Logging | Improve administrative accountability |
| Automated CI/CD Testing | Validate changes before deployment |
| Advanced Analytics | Provide deeper marketplace insights |

---

## Conclusion

GoMart demonstrates the development of a full-stack digital products marketplace using React, Node.js, Express.js and Firebase.

The application integrates authentication, role-based authorization, product management, shopping cart operations, simulated checkout, order processing, purchase verification, digital downloads and administrative analytics.

The project emphasizes modular architecture, REST API development, cloud integration, access-control validation and independent deployment.

**Developed for:** She Software Solutions  
**Assessment:** Full Stack Developer Internship  
**Project:** GoMart – Digital Products Marketplace

---

**Repository:** https://github.com/KATHIRESHWARAN/Gomart  
**Live Application:** https://gomart1.netlify.app

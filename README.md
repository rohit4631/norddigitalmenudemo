# ☕ Nord Cafe — Digital Menus. Smarter Restaurants.

A complete multi-tenant SaaS platform where cafe and restaurant owners can create and customize digital menus, generate permanent QR codes, manage dining tables, accept customer orders without app installation, streamline kitchen preparation via KDS, and track business analytics.

---

## 🌟 Key Product Capabilities

### 1. Dual Business Models
- **Self-Service SaaS**: Cafe owners register, configure their digital menu, set up dining tables, and subscribe to plans.
- **Admin-Assisted Service**: The Nord Cafe operations team can onboard restaurants on their behalf, upload menus via CSV, configure branding, generate print-ready table QR tent cards, and hand over access.

### 2. Multi-Tenant Role-Based Access Control (RBAC)
- **👑 Super Admin**: Full platform management, cafe approvals, suspension, MRR tracking, subscription plans, and user permissions.
- **💼 Admin Staff**: Cafe onboarding, support, and manual menu digitizations.
- **☕ Cafe Owner**: Full management of their cafe, menu catalog, tables, orders, staff, branding, and billing.
- **👔 Cafe Manager**: Day-to-day operations, table sessions, and order fulfilment.
- **👨‍🍳 Kitchen Staff**: Dedicated Kitchen Display System (KDS) with live dish checklists and prep timers.
- **📱 Customer**: Contactless QR digital menu, cart, size/variant selection, add-ons, dine-in / takeaway / delivery checkout, and real-time live order tracking.

### 3. Server-Recalculated Checkout & Price Integrity
- Prices submitted by the client are never trusted. All variant prices, add-on costs, 5% restaurant GST, and packaging charges are computed securely on the server with database-backed item snapshots.

### 4. Real-Time Kitchen Display System (KDS)
- Tablet-optimized dark mode interface displaying incoming orders, elapsed timers with urgent warning thresholds, dish-specific notes, and one-tap status updates.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **Database** | PostgreSQL 16 (Running natively / Docker) |
| **ORM** | Prisma ORM v5 |
| **Authentication** | Jose JWT sessions, HttpOnly secure cookies, bcrypt password hashing |
| **QR Code Generation** | `qrcode` (SVG, High-res PNG data URLs, printable tent cards) |
| **Menu Importer** | PapaParse CSV parser |
| **Payments** | Razorpay SDK integration with signature verification |
| **Automated Testing** | Node.js Test Runner + tsx |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- pnpm (or npm)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/NordByte/digital-menu.git
cd digital-menu
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and verify database credentials:
```bash
cp .env.example .env
```
Default local PostgreSQL connection string:
```env
DATABASE_URL="postgresql://rohit@localhost:5432/nordcafe?schema=public"
JWT_SECRET="nord-cafe-super-secret-jwt-key-2026-production-ready"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Rich Demo Data
```bash
# Push Prisma schema to PostgreSQL and seed sample cafes, menus, tables, orders, and users
pnpm db:setup
```

### 4. Run Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Personas & Credentials

The database comes pre-seeded with realistic cafes, menus, and roles in Chandigarh & Mohali:

| Role | Email | Password | Access Panel |
|---|---|---|---|
| **👑 Super Admin** | `admin@nordcafe.com` | `admin123` | `/admin` |
| **☕ Cafe Owner** | `owner@nordicroast.com` | `owner123` | `/dashboard` |
| **👔 Cafe Manager** | `manager@nordicroast.com` | `manager123` | `/dashboard` |
| **👨‍🍳 Kitchen Staff** | `kitchen@nordicroast.com` | `kitchen123` | `/kitchen` |

### Sample Public Digital Menus
- **Nordic Roast & Bakery** (Sector 35-C, Chandigarh): [http://localhost:3000/c/nordic-roast](http://localhost:3000/c/nordic-roast)
- **Table T-02 Dine-in Menu**: [http://localhost:3000/c/nordic-roast?table=T-02](http://localhost:3000/c/nordic-roast?table=T-02)
- **The Matcha Lab** (Sector 67, Mohali): [http://localhost:3000/c/matcha-lab](http://localhost:3000/c/matcha-lab)
- **Brew & Bite Bistro**: [http://localhost:3000/c/brew-and-bite](http://localhost:3000/c/brew-and-bite)

---

## 📋 Production Testing & Verification

Run the automated test suite:
```bash
pnpm test
```
Build verification:
```bash
pnpm build
```

---

## 📦 Container Deployment (Docker)

To run PostgreSQL and Redis in Docker:
```bash
docker compose up -d
```
Then run migrations and start the application:
```bash
pnpm db:setup
pnpm start
```

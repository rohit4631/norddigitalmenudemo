# Nord Cafe — Complete Route Inventory

This inventory documents all **42 routes** in the Nord Cafe SaaS platform, including public portals, authenticated management panels, and backend RESTful API endpoints.

---

## 1. Frontend Page Routes

| Route Pattern | Panel / Domain | Auth Required | Authorized Roles | Key Components & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Landing Page | No | Public | SaaS marketing homepage, hero, feature breakdown, live demos, pricing tiers |
| `/login` | Authentication | No | Public | Unified sign-in portal with 1-click quick credentials switcher for all 4 roles |
| `/register` | Authentication | No | Public | Self-service cafe registration wizard with live slug preview |
| `/lookup` | Order Tracking | No | Public | Self-service order tracker by order number and customer phone |
| `/c/[slug]` | Customer Menu | No | Public / Customer | Digital cafe menu with category pills, food search, dietary filters, and cart dock |
| `/c/[slug]?table=[token]` | Dine-in Menu | No | Public / Customer | Table-linked digital menu displaying verified table indicator banner |
| `/c/[slug]/checkout` | Customer Checkout | No | Public / Customer | Order checkout, table confirmation, customer details, coupon discount, payment select |
| `/c/[slug]/orders/[orderNumber]` | Order Status | No | Public / Customer | Live order tracking timeline with real-time progress steps and printable receipt |
| `/qr/[token]` | QR Redirect Engine | No | Public | Dynamic shortlink redirector verifying token, logging scan telemetry, and routing |
| `/admin` | Super Admin | Yes | `SUPER_ADMIN`, `ADMIN_STAFF` | Platform operations overview, telemetry KPIs, monthly MRR charts, pending cafe triage |
| `/admin/cafes` | Super Admin | Yes | `SUPER_ADMIN`, `ADMIN_STAFF` | Tenant cafe directory with search, filter, bulk activate/suspend, CSV export |
| `/admin/onboarding` | Super Admin | Yes | `SUPER_ADMIN`, `ADMIN_STAFF` | Assisted 3-step onboarding wizard for cafes needing turnkey setup |
| `/admin/plans` | Super Admin | Yes | `SUPER_ADMIN`, `ADMIN_STAFF` | SaaS tier pricing, catalog item limits, table quotas, and feature gates editor |
| `/admin/users` | Super Admin | Yes | `SUPER_ADMIN`, `ADMIN_STAFF` | RBAC user directory with role assignment, status audit, and staff provisioning |
| `/dashboard` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Daily restaurant operations overview, today's sales, incoming orders, bestsellers |
| `/dashboard/orders` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Live orders manager with List & Kanban views, audio chime, KOT printing, reject modal |
| `/dashboard/menu` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Catalog management, category builder, dish customizer, in-stock switch, CSV import |
| `/dashboard/tables` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Dining room table grid, seating capacity, active order indicator, table QR generation |
| `/dashboard/qr-codes` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | QR Code Studio with color palette customization, print-ready tent cards |
| `/dashboard/analytics` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Sales reports, 7-day revenue trend chart, average ticket size, QR scan engagement |
| `/dashboard/subscription` | Cafe Owner | Yes | `CAFE_OWNER` | Active subscription details, catalog quota progress bars, tier upgrade actions |
| `/dashboard/settings` | Cafe Owner | Yes | `CAFE_OWNER` | Cafe identity, theme color, GST taxation, packaging fees, ordering rule toggles |
| `/dashboard/staff` | Cafe Owner | Yes | `CAFE_OWNER`, `CAFE_MANAGER` | Cafe team roster, staff roles (Kitchen Staff / Manager), and invite provisioning |
| `/kitchen` | Kitchen KDS | Yes | `KITCHEN_STAFF`, `CAFE_OWNER`, `CAFE_MANAGER` | Touch-first dark mode kitchen console with elapsed timers and audio chimes |

---

## 2. Backend REST API Routes

### 2.1 Authentication & Profile APIs

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Validates credentials via bcrypt, issues HTTP-only JWT cookie (`nord_session_token`) |
| `POST` | `/api/v1/auth/register` | Public | Registers tenant user, auto-generates cafe record, slug, and assigns `CAFE_OWNER` role |
| `GET` | `/api/v1/auth/me` | Authenticated | Decodes JWT session token, returns user ID, email, role, and assigned `cafeId` |
| `POST` | `/api/v1/auth/logout` | Authenticated | Clears `nord_session_token` HTTP-only cookie, terminating the session |

### 2.2 Super Admin APIs

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | `SUPER_ADMIN`, `ADMIN_STAFF` | Computes platform MRR, active/pending/suspended cafes, total orders, and GMV |
| `GET` | `/api/v1/admin/cafes` | `SUPER_ADMIN`, `ADMIN_STAFF` | Retrieves tenant cafes with pagination, search query, and status filter |
| `POST` | `/api/v1/admin/cafes` | `SUPER_ADMIN`, `ADMIN_STAFF` | Creates turnkey cafe, provisions owner account, assigns plan, and creates default branch |
| `PATCH` | `/api/v1/admin/cafes/[id]` | `SUPER_ADMIN`, `ADMIN_STAFF` | Updates cafe status (`ACTIVE`, `SUSPENDED`, `PENDING_APPROVAL`) or plan assignment |
| `GET` | `/api/v1/admin/plans` | `SUPER_ADMIN`, `ADMIN_STAFF` | Lists all SaaS subscription tiers with active subscription counts |
| `PATCH` | `/api/v1/admin/plans` | `SUPER_ADMIN` | Modifies pricing, item limits, table limits, and feature flags for a subscription tier |
| `GET` | `/api/v1/admin/users` | `SUPER_ADMIN`, `ADMIN_STAFF` | Fetches system user directory with assigned tenant associations and roles |
| `POST` | `/api/v1/admin/users` | `SUPER_ADMIN` | Creates privileged platform staff accounts (`SUPER_ADMIN` or `ADMIN_STAFF`) |

### 2.3 Cafe Operations & Catalog APIs

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cafes/me` | `CAFE_OWNER`, `CAFE_MANAGER` | Returns current cafe profile, theme colors, and operating hours |
| `PATCH` | `/api/v1/cafes/me` | `CAFE_OWNER` | Updates cafe branding (name, slug, logo URL, cover URL, themeColor, bio) |
| `GET` | `/api/v1/cafes/me/settings` | `CAFE_OWNER`, `CAFE_MANAGER` | Returns ordering rules, GST tax rates, packaging fees, and min order values |
| `PATCH` | `/api/v1/cafes/me/settings` | `CAFE_OWNER` | Updates ordering toggles (dine-in, takeaway), tax rate %, and service charges |
| `GET` | `/api/v1/categories` | `CAFE_OWNER`, `CAFE_MANAGER` | Lists all categories for the authenticated tenant cafe |
| `POST` | `/api/v1/categories` | `CAFE_OWNER`, `CAFE_MANAGER` | Creates a new menu category with automatic sort ordering |
| `PATCH` | `/api/v1/categories/[id]` | `CAFE_OWNER`, `CAFE_MANAGER` | Updates category name, description, image, or active state |
| `DELETE` | `/api/v1/categories/[id]` | `CAFE_OWNER` | Soft-deletes or removes category (prevented if items are active) |
| `GET` | `/api/v1/menu-items` | `CAFE_OWNER`, `CAFE_MANAGER` | Lists all food items with variants and add-on groups for the tenant |
| `POST` | `/api/v1/menu-items` | `CAFE_OWNER`, `CAFE_MANAGER` | Creates food item with variants and checks plan item quota |
| `PATCH` | `/api/v1/menu-items/[id]` | `CAFE_OWNER`, `CAFE_MANAGER` | Updates food item details, price, preparation time, or stock availability |
| `DELETE` | `/api/v1/menu-items/[id]` | `CAFE_OWNER` | Deletes food item from catalog |
| `POST` | `/api/v1/menus/import` | `CAFE_OWNER`, `ADMIN_STAFF` | Parses and batch-inserts categories and dishes from CSV payload |
| `GET` | `/api/v1/tables` | `CAFE_OWNER`, `CAFE_MANAGER` | Lists dining tables, seating capacities, and associated QR code tokens |
| `POST` | `/api/v1/tables` | `CAFE_OWNER` | Provisions dining table and auto-generates table-specific QR token |
| `DELETE` | `/api/v1/tables/[id]` | `CAFE_OWNER` | Removes dining table and invalidates associated QR token |
| `GET` | `/api/v1/qr-codes` | `CAFE_OWNER`, `CAFE_MANAGER` | Lists all generated QR codes (General + Tables) with scan counts |
| `GET` | `/api/v1/orders` | `CAFE_OWNER`, `KITCHEN_STAFF` | Fetches active and historical orders for the tenant cafe |
| `GET` | `/api/v1/orders/[id]` | `CAFE_OWNER`, `KITCHEN_STAFF` | Retrieves single order details, customer contact, items, and add-ons |
| `PATCH` | `/api/v1/orders/[id]` | `CAFE_OWNER`, `KITCHEN_STAFF` | Advances order status (`ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`, `REJECTED`) |
| `GET` | `/api/v1/analytics/overview`| `CAFE_OWNER`, `CAFE_MANAGER` | Calculates today's sales, active orders, top 5 bestsellers, and 7-day revenue |
| `GET` | `/api/v1/subscriptions` | `CAFE_OWNER` | Checks active plan, billing period, and current quota usage vs entitlements |
| `POST` | `/api/v1/subscriptions` | `CAFE_OWNER` | Upgrades/downgrades subscription plan and updates tenant limits |
| `GET` | `/api/v1/staff` | `CAFE_OWNER`, `CAFE_MANAGER` | Lists assigned cafe personnel (Managers, Chefs) |
| `POST` | `/api/v1/staff` | `CAFE_OWNER` | Provisions new team member login linked to tenant cafe |

### 2.4 Public Customer & Gateway APIs

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/public/c/[slug]` | Public | Fetches public cafe identity, open status, theme color, settings, and branches |
| `GET` | `/api/v1/public/c/[slug]/menu` | Public | Fetches active categories, available food items, variants, and add-on options |
| `POST` | `/api/v1/public/c/[slug]/orders` | Public | Validates cart items, verifies server-side pricing, generates order number, stores in DB |
| `GET` | `/api/v1/public/orders/[orderNumber]`| Public | Fetches real-time status of a customer order (used for live tracker & receipts) |
| `GET` | `/api/v1/public/qr/[token]` | Public | Resolves QR token to destination menu URL and increments scan counter |
| `POST` | `/api/v1/payments/razorpay/verify` | Public / Customer | Verifies HMAC-SHA256 Razorpay payment signature and marks order as PAID |

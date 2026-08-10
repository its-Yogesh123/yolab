# Changelog

All notable changes to **YoLab** will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Changes planned but not yet released.

- Self-service refund flow for Pro plan cancellations
- Centralized SSO authentication system
- Maester — PDF Analyzer service (srv004)
- File conversion service (srv005)
- Public REST API for external developers with API key management
- Admin dashboard UI for managing user subscriptions
- Monthly renewal reminders via email

---

## [1.3.0] — 2026-08-11

### Added — Razorpay Payment Integration

- **`backend/modules/subscription/payment.controller.js`** — Full payment lifecycle:
  - `createOrder` — Creates a Razorpay order (amount from `subscription.plans.js`, stored in paise). Lazy-initializes the Razorpay SDK client so missing env keys don't crash the server at startup. Receipt field is capped at 40 chars per Razorpay's limit.
  - `verifyPayment` — Verifies the `razorpay_order_id|razorpay_payment_id` HMAC-SHA256 signature against `RAZORPAY_KEY_SECRET`. On success: sets `plan = "pro"`, `status = "active"`, sets `expiresAt = now + 30 days`, pushes a payment record, and fires an email receipt (non-blocking).
  - `razorpayWebhook` — Server-to-server fallback for `payment.captured` events. Correctly reads the raw `Buffer` body (via `Buffer.toString("utf8")`) for HMAC verification instead of `JSON.stringify` (which would produce the wrong hash). Idempotency guard on `razorpayOrderId` prevents double-activation if both `/verify` and the webhook fire.

- **`backend/modules/subscription/payment.mailer.js`** — Nodemailer-based email receipt utility. Silently skips (no crash) if `MAIL_*` env vars are not configured. Sends a styled dark-themed HTML receipt with: plan name, amount paid, Payment ID, Order ID, and plan expiry date. Receipt links back to `/pricing`.

- **New routes** in `subscription.routes.js`:
  - `POST /api/subscription/create-order` — login required
  - `POST /api/subscription/verify` — login required
  - `POST /api/subscription/webhook` — no cookie auth, HMAC-verified

- **`backend/server.js`** — Added `express.raw({ type: 'application/json' })` middleware scoped to `/api/subscription/webhook` **before** `express.json()`. This preserves the raw request body that Razorpay needs to verify its webhook signature.

- **`frontend/index.html`** — Added Razorpay Checkout SDK `<script>` tag in `<head>` so `window.Razorpay` is available when `PricingPage` mounts.

- **`frontend/src/subscription/PricingPage.jsx`** — Replaced fake direct-upgrade with the real 3-step Razorpay flow:
  1. `POST /create-order` → get `orderId`, `key_id`
  2. Open `window.Razorpay(...)` modal with `prefill`, `ondismiss`, and `payment.failed` handlers
  3. On success: `POST /verify` → confirm HMAC → show toast → refresh subscription UI

### Added — OnePic Phase 3: Image Transforms

- **`backend/modules/onepic/onepic.controller.js`** — 6 new controllers proxied to `/transform/*` on the OnePic microservice: `rotateImage`, `flipImage`, `resizeImage`, `brightnessContrast`, `grayscale`, `invertColors`.
- **`backend/modules/onepic/onepic.routes.js`** — 6 new routes: `POST /rotate`, `/flip`, `/resize`, `/brightness-contrast`, `/grayscale`, `/invert`.
- **`frontend/src/image-processing/page.jsx`** — Phase 3 group added to `PHASE_GROUPS` with full parameter definitions (angle, direction, width/height, brightness/contrast factors) and descriptions.

### Changed

- **`backend/modules/subscription/subscription.model.js`** — Added a proper `paymentSchema = new mongoose.Schema(..., { _id: false })` and `payments: { type: [paymentSchema], default: [] }` field to the subscription document. Previously an inline array literal (Mongoose mixed type — no validation or default enforcement).
- **`backend/modules/subscription/subscription.plans.js`** — `pro.price` set to `1` (₹1) for test mode. Change to `299` before production.
- **`payment.md`** — Added full failure handling section documenting what is and isn't covered.

### Fixed

- **`payment.controller.js`** — Razorpay client is now lazy-instantiated inside `getRazorpay()`. Previously `new Razorpay(...)` ran at module-load time and crashed the server if env keys were missing.
- **`payment.controller.js` (webhook)** — Signature verification now uses `req.body.toString("utf8")` on the raw Buffer. Previously used `JSON.stringify(req.body)` which produced a mangled string, making all webhook signatures permanently invalid.
- **`subscription.model.js`** — `payments` field migrated from inline array-of-objects literal to a proper Mongoose sub-schema with `_id: false`.
- **`PricingPage.jsx`** — Replaced bare `return` after failed `create-order` call with `throw` so the `catch` block handles cleanup uniformly and the loading spinner always stops correctly.

---

## [1.2.0] — 2026-08-04

### Added — Analytics System (Lean MVP)

- **`backend/modules/analytics/analytics.model.js`** — Two new MongoDB schemas:
  - `DailyStats`: One document per calendar day (`YYYY-MM-DD`). Atomic `$inc` counters for `newUsers`, `activeUsers`, `serviceUsage.qrGenerator`, `serviceUsage.shortUrl`.
  - `ActivityFeed`: Audit log capped to 100 entries via query-based trim. Fields: `timestamp`, `actionName`, `userIdentifier`.

- **`backend/modules/analytics/analytics.services.js`** — Core tracking service:
  - In-memory active users cache (`Map<DateString, Set<UserId>>`) to deduplicate daily active user counts without Redis.
  - Auto-flush at midnight via `setTimeout` — no cron job needed.
  - `trackActivity({ userIdentifier, actionName, userId, service, isNewUser, isLogin })` — fire-and-forget async function. Never throws, never blocks user requests.

- **`backend/modules/analytics/analytics.controller.js`**:
  - `getSummary`: Returns today's stats + all-time aggregation via `$group` across all `DailyStats` documents. Pulls real `totalUsers` count from the `Users` collection.
  - `getFeed`: Returns 50 most recent `ActivityFeed` entries sorted by timestamp descending.

- **`backend/modules/analytics/analytics.routes.js`** — Admin-only routes:
  - `GET /api/admin/analytics/summary` — protected by `isLoggedIn` + `isAuthorize("admin")`
  - `GET /api/admin/analytics/feed` — protected by `isLoggedIn` + `isAuthorize("admin")`

- **`frontend/src/admin/AnalyticsDashboard.jsx`** — Admin dashboard at `/admin/analytics`:
  - Matches the exact short-url dark theme (`bg-[#050505]`, `bg-[#111111]`, `bg-neutral-200` buttons).
  - 4 `StatCard` components: Total Users, Active Users (Today), Short URLs (Today), QR Codes (Today).
  - `ServicePopularityPanel`: Animated progress bars for all-time service usage.
  - `RecentActivityPanel`: Scrollable list of the last 50 activity events with timestamps and user identifiers.
  - Frontend access guard: redirects non-admin users (`session.role !== "admin"`) to `/`.
  - Refresh button with spinner, last-updated timestamp in nav.

### Changed

- **`backend/modules/analytics/analytics.services.js`** — `trackActivity` calls added to 3 existing controllers:
  - `auth.controller.js`: Fires on login (`isLogin: true`) and register (`isNewUser: true`, `isLogin: true`).
  - `srv001.controller.js`: Fires on short URL creation (`service: "shortUrl"`).
  - `srv002.controller.js`: Fires on QR code generation (`service: "qrGenerator"`).
- **`backend/server.js`** — Mounted `analyticsRoutes` at `/api/admin/analytics`.
- **`frontend/src/main.jsx`** — Added `/admin/analytics` route.
- **`frontend/src/shared/Navigation.jsx`** — Added admin-only "Analytics Dashboard" link (`BarChart3` icon) in the profile drawer, conditionally rendered when `session.role === "admin"`.

---

## [1.1.0] — 2026-07-29

### Added — Subscription System (Platform-Level)

- **`backend/modules/subscription/subscription.plans.js`** — Central config for all plan tiers and per-service usage limits. Single source of truth — changing limits for any service requires editing only this file.
- **`backend/modules/subscription/subscription.model.js`** — MongoDB schema: one subscription document per user tracks plan tier (`free`/`pro`), status (`active`/`cancelled`/`expired`), and per-service usage counters with individual monthly reset timestamps.
- **`backend/modules/subscription/subscription.controller.js`** — Controllers: `getMySubscription`, `upgradePlan`, `cancelSubscription`, `adminSetPlan`.
- **`backend/modules/subscription/subscription.routes.js`** — Routes:
  - `GET  /api/subscription/me` — current user's plan + usage data
  - `POST /api/subscription/upgrade` — self-service Pro upgrade
  - `POST /api/subscription/cancel` — downgrade to Free
  - `PUT  /api/subscription/admin/:userId` — admin manually set any user's plan
- **`backend/modules/subscription/middlewares/checkSubscription.js`** — `hasActiveSubscription(serviceCode)` middleware factory: checks plan limits, auto-resets monthly usage window, increments counter on pass, returns structured `429` with upgrade info on limit breach.

### Added — QR Code Generator Service (srv002)

- **`backend/modules/qr-code/srv002.model.js`** — MongoDB schema for QR codes: `content`, `format`, `size`, `darkColor`, `lightColor`, `createdBy`.
- **`backend/modules/qr-code/srv002.controller.js`** — Controllers: `generateQRCode` (uses `qrcode` npm package, returns base64 PNG), `getMyQRCodes`, `deleteQRCode`.
- **`backend/modules/qr-code/srv002.routes.js`** — Routes:
  - `POST   /srv002/qr` — generate QR code (subscription-gated: 10/month Free, unlimited Pro)
  - `GET    /srv002/qr` — list user's QR codes
  - `DELETE /srv002/qr/:id` — delete a QR code
- Installed `qrcode` npm package in backend.

### Added — Frontend: Pricing Page

- **`frontend/src/subscription/PricingPage.jsx`** — Full pricing page at `/pricing`:
  - Live animated usage meters per service (Short URL + QR Code)
  - Free and Pro plan cards with feature lists
  - Upgrade to Pro button with API integration
  - Cancel subscription button
  - Shows "Current Plan" badge on active plan
  - Resets-on date shown for Free plan users

### Added — Frontend: QR Code Service Page

- **`frontend/src/qr-code/page.jsx`** — Full QR generator UI at `/qr-code`:
  - URL or text input with real-time generation
  - Size selector (200–600px)
  - QR color + background color pickers
  - Live QR image preview with download button
  - Animated usage progress bar (green → amber → red)
  - Monthly limit reached banner with upgrade CTA
  - Recent QR codes history grid with delete support
  - Plan badge in service navbar

### Changed

- **`backend/server.js`** — Refactored:
  - Fixed critical bug: duplicate `app.listen()` calls (was binding two HTTP servers)
  - Added `srv002` routes at `/srv002` (login-required)
  - Added `subscriptionRoutes` at `/api/subscription`
  - CORS origin now reads from `process.env.CLIENT_URL` with `localhost:5173` fallback
- **`backend/modules/auth/auth.controller.js`** — `registerWithEmailPassword` now auto-creates a Free `Subscription` document for every new user on registration.
- **`frontend/src/main.jsx`** — Added routes: `/qr-code` → `QRCodeService`, `/pricing` → `PricingPage`.
- **`frontend/src/shared/Navigation.jsx`** — Added Short URL, QR Code, and Pricing links to navbar and mobile drawer. Added "Subscription & Pricing" entry in profile drawer with Zap icon.

### Fixed

- **`backend/modules/auth/middlewares/authenticate.js`** — Critical auth inconsistency fixed: `isLoggedIn` middleware now reads JWT from `req.cookies.token` (httpOnly cookie set at login) instead of the `Authorization: Bearer` header. This makes authentication consistent across all protected routes and sessions.

---

## [1.0.0] — 2026-07-28 *(Initial structured release)*

### Added

- **Auth Module** (`backend/modules/auth/`):
  - Local email/password authentication with bcrypt + JWT
  - Google OAuth 2.0 via Passport.js (`passport-google-oauth20`)
  - `POST /auth/login` — email/password login, sets httpOnly JWT cookie
  - `POST /auth/register` — creates user with hashed password
  - `POST /auth/logout` — clears JWT cookie
  - `GET  /auth/session` — validates cookie and returns session user
  - `GET  /auth/google` + `GET /auth/google/callback` — OAuth flow
  - `isAuthorize(role)` middleware for RBAC (Role-Based Access Control)

- **Users Module** (`backend/modules/users/`):
  - Mongoose `User` schema: `name`, `email`, `authProvider`, `auth0Id`, `password` (hidden), `role`
  - User CRUD routes at `/api/users`

- **URL Shortener (srv001)** (`backend/modules/short-url/`):
  - `POST /srv001/url` — generate short URL with `shortid`
  - `GET  /srv001/url/:shortId` — redirect to original URL + track visit timestamp
  - `Url` schema: `shortId`, `redirectURL`, `visitedHistory[]`, `createdBy`

- **Frontend Foundation** (`frontend/src/`):
  - React 19 + Vite 8 SPA
  - React Router v7 with `BrowserRouter`
  - Global `SessionProvider` context for auth state
  - `Navigation.jsx` — responsive navbar with mobile drawer, dark mode toggle, profile panel
  - `Footer.jsx`
  - Pages: `Home.jsx`, `About.jsx`, `Privacy.jsx`, `Login.jsx`, `Register.jsx`
  - `short-url/page.jsx` — URL shortener UI with history table
  - `prompts-lib/page.jsx` — AI Prompts Marketplace UI
  - shadcn/ui component library: `button`, `card`, `input`, `table`, `badge`, `avatar`, `tooltip`, `sheet`, `spinner`, `navigation-menu`
  - TailwindCSS v3 + Inter Variable font
  - Framer Motion animations
  - Sonner toast notifications

### Infrastructure

- Monorepo structure: `backend/` + `frontend/` in single repository
- MongoDB connection via Mongoose
- `dotenv` configuration for all secrets
- CORS configured for cross-origin requests with credentials

---

## [0.1.0] — 2026-07 *(Project Inception)*

### Added

- Repository initialized
- Project vision defined: Multi-service SaaS platform (Modular Monolith → Microservices)
- `README.md`, `LICENSE` (Apache 2.0), `design.png` architecture diagram
- Basic Express server scaffold
- Initial module folder structure planned: `auth/`, `users/`, `qr-code/`, `short-url/`, `yo-auth/`

---

*© 2026 YoLab — Made in India 🇮🇳*

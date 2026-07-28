# Changelog

All notable changes to **YoLab** will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

> Changes planned but not yet released.

- Payment gateway integration (Razorpay / Stripe) for Pro plan upgrades
- Centralized SSO authentication system
- Image processing service (srv003)
- File conversion service (srv004)
- Public REST API for external developers
- Admin dashboard UI for managing user subscriptions
- Migration of selected modules to microservices (Strangler Pattern)

---

## [0.3.0] — 2026-07-29

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

## [0.2.0] — 2026-07-28 *(Initial structured release)*

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

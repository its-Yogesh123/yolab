# YoLab

![GitHub repo size](https://img.shields.io/github/repo-size/its-Yogesh123/yolab)
![GitHub stars](https://img.shields.io/github/stars/its-Yogesh123/yolab?style=social)
![GitHub forks](https://img.shields.io/github/forks/its-Yogesh123/yolab?style=social)
![GitHub issues](https://img.shields.io/github/issues/its-Yogesh123/yolab)
![GitHub license](https://img.shields.io/github/license/its-Yogesh123/yolab)

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express.js-lightgrey)
![React](https://img.shields.io/badge/Frontend-React_19-blue)
![Vite](https://img.shields.io/badge/Build-Vite_8-purple)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-yellow)
![Future](https://img.shields.io/badge/Future-Microservices-orange)
![Subscription](https://img.shields.io/badge/Billing-Subscription_Ready-violet)

> **YoLab** is a `multi-service SaaS` platform providing useful web tools — URL Shortener, QR Code Generator, and more — under one unified interface with a built-in subscription system.

# Made in INDIA 🇮🇳

---

## Table of Contents

- [Introduction](#introduction)
- [Live Services](#live-services)
- [Architecture](#architecture)
  - [Modular Monolith Overview](#modular-monolith-overview)
  - [Subscription System Architecture](#subscription-system-architecture)
  - [Authentication Flow](#authentication-flow)
  - [Request Lifecycle — Protected Service](#request-lifecycle--protected-service)
  - [Subscription State Machine](#subscription-state-machine)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Goals](#goals)
- [Changelog](#changelog)
- [License](#license)
- [Team](#team)

---

## Introduction

YoLab is designed as a **modular monolith** where each service (QR generator, URL shortener, etc.) is implemented as an independent module inside a single backend. The frontend is a React 19 SPA providing a unified interface for all services.

The platform is **subscription-ready** — users start on a Free tier with monthly usage limits per service and can upgrade to Pro for unlimited access. The subscription system is **payment-gateway agnostic** (Razorpay/Stripe plug-in ready).

This design allows easy migration to microservices in the future using the **Strangler Pattern**.

---

## Live Services

| Service | Route | Free Limit | Pro Limit | Status |
|---|---|---|---|---|
| 🔗 URL Shortener | `/short-url` | 5 links/month | Unlimited | ✅ Live |
| 📱 QR Code Generator | `/qr-code` | 10 QR/month | Unlimited | ✅ Live |
| 🤖 AI Prompts Marketplace | `/prompts-ai-marketplace` | — | — | 🔧 UI Only |
| 💳 Pricing & Plans | `/pricing` | — | — | ✅ Live |

---

## Architecture

### Modular Monolith Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│              React 19 + Vite + TailwindCSS + shadcn/ui      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │ ShortURL │  │  QR Code │  │ Pricing  │   │
│  │  /about  │  │/short-url│  │ /qr-code │  │ /pricing │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                  SessionProvider (Global Auth State)         │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP + Cookies (httpOnly JWT)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express 5)             │
│                                                             │
│  ┌─────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │ /auth       │  │ /api/users │  │ /api/subscription  │   │
│  │ Login       │  │ User CRUD  │  │ Plans & Usage      │   │
│  │ Register    │  └────────────┘  └────────────────────┘   │
│  │ Google OAuth│                                            │
│  │ Session     │  ┌────────────┐  ┌────────────────────┐   │
│  └─────────────┘  │ /srv001    │  │ /srv002            │   │
│                   │ URL Short  │  │ QR Generator       │   │
│                   │ (gated)    │  │ (gated)            │   │
│                   └────────────┘  └────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │  Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        MongoDB Atlas                        │
│                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────────────────┐   │
│   │  Users   │   │   URLs   │   │    Subscriptions     │   │
│   │collection│   │collection│   │      collection      │   │
│   └──────────┘   └──────────┘   └──────────────────────┘   │
│                                                             │
│                  ┌──────────┐                               │
│                  │ QRCodes  │                               │
│                  │collection│                               │
│                  └──────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

### Subscription System Architecture

The subscription system is **platform-level** — one plan gates all services. Adding a new service requires changing only the config file and one route mount.

```
┌──────────────────────────────────────────────────────┐
│              subscription.plans.js                   │
│            (Single Source of Truth)                  │
│                                                      │
│  PLANS = {                                           │
│    free: {                                           │
│      limits: { srv001: 5, srv002: 10, ... }          │
│    },                                                │
│    pro: {                                            │
│      limits: { srv001: ∞, srv002: ∞, ... }           │
│    }                                                 │
│  }                                                   │
└───────────────────────┬──────────────────────────────┘
                        │ imported by
          ┌─────────────┼────────────────┐
          ▼             ▼                ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
  │ Subscription │  │ Subscription │  │  checkSubscription│
  │   Model      │  │  Controller  │  │   Middleware      │
  │              │  │              │  │                   │
  │ usage: {     │  │ getMe()      │  │ hasActiveSubscrip-│
  │  srv001:{    │  │ upgrade()    │  │ tion("srv002")    │
  │   count: 3,  │  │ cancel()     │  │                   │
  │   resetAt:.. │  │ adminSet()   │  │ → checks plan     │
  │  },          │  │              │  │ → checks limit    │
  │  srv002:{    │  └──────────────┘  │ → resets monthly  │
  │   count: 7,  │                   │ → increments count │
  │   resetAt:.. │                   │ → 429 if exceeded  │
  │  }           │                   └──────────────────┘
  │ }            │
  └──────────────┘
```

**Subscription MongoDB Document:**
```json
{
  "userId": "ObjectId",
  "plan": "free",
  "status": "active",
  "expiresAt": null,
  "usage": {
    "srv001": { "count": 3, "resetAt": "2026-08-29T00:00:00Z" },
    "srv002": { "count": 7, "resetAt": "2026-08-29T00:00:00Z" }
  }
}
```

---

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL AUTH FLOW                          │
│                                                             │
│  Browser          Backend           MongoDB                 │
│    │                 │                 │                    │
│    │─POST /auth/login─►               │                    │
│    │  {email,password}│               │                    │
│    │                 │──findUser()────►│                    │
│    │                 │◄──User doc──────│                    │
│    │                 │                │                    │
│    │                 │ bcrypt.compare()│                    │
│    │                 │ generateToken() │                    │
│    │                 │                │                    │
│    │◄─Set-Cookie: token (httpOnly)────│                    │
│    │  200 {user}     │                │                    │
│                                                             │
│                   GOOGLE OAUTH FLOW                         │
│                                                             │
│  Browser          Backend           Google                  │
│    │                 │                 │                    │
│    │─GET /auth/google─►               │                    │
│    │◄─302 redirect to Google OAuth────│                    │
│    │────────────────────────────────► │                    │
│    │◄─────────── auth code ───────────│                    │
│    │─GET /auth/google/callback ───────►                    │
│    │                 │──Passport verify profile             │
│    │                 │ generateToken()                      │
│    │◄─Set-Cookie: token + redirect to /                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Request Lifecycle — Protected Service

Every request to a service (srv001, srv002, etc.) passes through this exact chain:

```
  Browser Request
       │
       ▼
  app.use("/srv002", ...)
       │
       ▼
┌──────────────────┐
│  [1] isLoggedIn  │  Reads JWT from req.cookies.token
│   (authenticate) │  Verifies with JWT_SECRET
│                  │  Populates req.user = {id, email, role}
└────────┬─────────┘
         │ ✅ token valid          ❌ no token / invalid
         │                              │
         ▼                              ▼
┌──────────────────────┐          401 "Not authenticated"
│  [2] hasActiveSub-   │
│  scription("srv002") │  Finds Subscription by userId
│                      │  Checks monthly reset window
│                      │  Compares count vs plan limit
└────────┬─────────────┘
         │                              │
    ✅ within limit              ❌ limit exceeded
    count += 1                         │
         │                             ▼
         ▼                    429 {
┌──────────────────┐            message: "Limit reached",
│  [3] Controller  │            used: 10, limit: 10,
│  generateQRCode()│            resetAt: "...",
│                  │            upgradePrice: 299
│  → creates QR    │          }
│  → returns base64│
└──────────────────┘
         │
         ▼
    201 { qrImage, subscription: { used, limit } }
```

---

### Subscription State Machine

```
  [New User Registers]
          │
          ▼
  Auto-create Subscription
  { plan: "free", status: "active" }
  usage: { srv001: {count:0}, srv002: {count:0} }
          │
          │
    ┌─────┴─────────────────────────────┐
    │                                   │
    ▼                                   ▼
[Uses services]                  [Hits monthly limit]
count increments                        │
    │                                   ▼
    │                          429 "Upgrade to Pro"
    │                                   │
    │                                   ▼
    │                          POST /api/subscription/upgrade
    │                                   │
    │                                   ▼
    │                          { plan: "pro", status: "active" }
    │                          → unlimited usage
    │                                   │
    │                      ┌────────────┘
    │                      ▼
    │             [Monthly Reset — Rolling 30 days]
    │             count = 0, resetAt = now + 30d
    │
    ▼
[Admin can set any plan at any time]
PUT /api/subscription/admin/:userId { plan, expiresAt }
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 8 | Build tool & dev server |
| React Router | v7 | Client-side routing |
| TailwindCSS | v3 | Utility-first styling |
| shadcn/ui | latest | Component library |
| Framer Motion | 12 | Animations |
| Lucide React | latest | Icons |
| Sonner | 2 | Toast notifications |
| Inter Variable | latest | Typography |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | — | Runtime |
| Express | 5 | Web framework |
| Mongoose | 9 | MongoDB ODM |
| bcrypt | 6 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| Passport.js | 0.7 | Google OAuth 2.0 |
| cookie-parser | 1.4 | Cookie handling |
| cors | 2.8 | Cross-origin requests |
| shortid | 2.2 | Short URL ID generation |
| qrcode | latest | QR code image generation |
| dotenv | 17 | Environment variables |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Git | Version control |
| Vercel | Frontend deployment (`vercel.json` configured) |

---

## Project Structure

```
yolab/
│
├── CHANGELOG.md                    ← Version history
├── README.md
├── LICENSE                         ← Apache 2.0
├── design.png
│
├── backend/
│   ├── .env                        ← Environment variables
│   ├── package.json                ← ESM, Express 5 deps
│   ├── server.js                   ← Entry: DB connect, middleware, routes
│   │
│   └── modules/
│       ├── auth/                   ← Authentication module
│       │   ├── auth.controller.js  ← login, register, logout, session
│       │   ├── auth.services.js    ← generateToken, validateToken
│       │   ├── auth.routes.js      ← /auth/* routes
│       │   ├── auth.passport.js    ← Google OAuth strategy
│       │   ├── auth.validation.js
│       │   └── middlewares/
│       │       ├── authenticate.js ← isLoggedIn (reads httpOnly cookie)
│       │       └── authorize.js    ← isAuthorize(role) RBAC
│       │
│       ├── users/                  ← User module
│       │   ├── user.model.js       ← User schema
│       │   ├── user.controller.js
│       │   └── user.route.js       ← /api/users/*
│       │
│       ├── subscription/           ← Subscription system ← NEW
│       │   ├── subscription.plans.js     ← Plan config (source of truth)
│       │   ├── subscription.model.js     ← Subscription schema
│       │   ├── subscription.controller.js
│       │   ├── subscription.routes.js    ← /api/subscription/*
│       │   └── middlewares/
│       │       └── checkSubscription.js  ← hasActiveSubscription()
│       │
│       ├── short-url/              ← URL Shortener (srv001)
│       │   ├── srv001.model.js     ← Url schema
│       │   ├── srv001.controller.js
│       │   └── srv001.routes.js    ← /srv001/*
│       │
│       └── qr-code/               ← QR Generator (srv002) ← NEW
│           ├── srv002.model.js     ← QRCode schema
│           ├── srv002.controller.js
│           └── srv002.routes.js   ← /srv002/*
│
└── frontend/
    ├── .env                        ← VITE_API_URL
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── components.json             ← shadcn/ui config
    ├── vercel.json
    │
    └── src/
        ├── main.jsx                ← Router root + all routes
        │
        ├── app/                    ← Core pages
        │   ├── App.jsx             ← Home layout
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── pages/
        │       ├── Home.jsx
        │       ├── About.jsx
        │       └── Privacy.jsx
        │
        ├── short-url/
        │   └── page.jsx            ← URL Shortener UI (srv001)
        │
        ├── qr-code/               ← NEW
        │   └── page.jsx            ← QR Generator UI (srv002)
        │
        ├── subscription/          ← NEW
        │   └── PricingPage.jsx     ← Pricing + live usage meters
        │
        ├── prompts-lib/
        │   └── page.jsx            ← AI Prompts Marketplace UI
        │
        ├── shared/                 ← Layout components
        │   ├── Navigation.jsx      ← Navbar + drawers
        │   └── Footer.jsx
        │
        ├── components/ui/          ← shadcn/ui primitives
        │   ├── button.jsx
        │   ├── card.jsx
        │   ├── input.jsx
        │   ├── table.jsx
        │   ├── badge.jsx
        │   ├── avatar.jsx
        │   ├── tooltip.jsx
        │   ├── sheet.jsx
        │   ├── spinner.jsx
        │   └── navigation-menu.jsx
        │
        ├── context/
        │   └── sessions.jsx        ← Global session state (React Context)
        │
        ├── services/               ← (planned: centralized API calls)
        ├── lib/
        │   └── utils.js
        └── styles/
            ├── index.css
            ├── App.css
            ├── Login.css
            ├── Register.css
            └── Footer.css
```

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user — auto-creates Free subscription |
| `POST` | `/auth/login` | Public | Email/password login → sets httpOnly JWT cookie |
| `POST` | `/auth/logout` | Public | Clears JWT cookie |
| `GET` | `/auth/session` | Public (cookie) | Validate cookie → return session user |
| `GET` | `/auth/google` | Public | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | isLoggedIn | User CRUD operations |

### Subscription — `/api/subscription`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/subscription/me` | isLoggedIn | Current plan + per-service usage |
| `POST` | `/api/subscription/upgrade` | isLoggedIn | Upgrade to Pro |
| `POST` | `/api/subscription/cancel` | isLoggedIn | Downgrade to Free |
| `PUT` | `/api/subscription/admin/:userId` | isLoggedIn + admin | Admin: set any user's plan |

### URL Shortener — `/srv001` *(isLoggedIn required)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/srv001/url` | Create short URL |
| `GET` | `/srv001/url/:shortId` | Redirect to original URL + track visit |

### QR Code Generator — `/srv002` *(isLoggedIn required)*

| Method | Endpoint | Subscription | Description |
|---|---|---|---|
| `POST` | `/srv002/qr` | ✅ Gated | Generate QR code (Free: 10/mo, Pro: ∞) |
| `GET` | `/srv002/qr` | Login only | List my QR codes |
| `DELETE` | `/srv002/qr/:id` | Login only | Delete a QR code |

---

## Data Models

### User
```js
{
  name        : String (required)
  email       : String (required, unique)
  authProvider: "local" | "auth0"
  auth0Id     : String (sparse, unique)
  password    : String (hidden by select:false)
  role        : "admin" | "user"  (default: "user")
  createdAt, updatedAt
}
```

### Subscription
```js
{
  userId   : ObjectId → User  (unique, one per user)
  plan     : "free" | "pro"   (default: "free")
  status   : "active" | "cancelled" | "expired"
  expiresAt: Date | null
  usage: {
    srv001: { count: Number, resetAt: Date }
    srv002: { count: Number, resetAt: Date }
  }
  createdAt, updatedAt
}
```

### URL (srv001)
```js
{
  shortId       : String (required, unique)
  redirectURL   : String (required)
  visitedHistory: [Number]  ← Unix timestamps of visits
  createdBy     : ObjectId → User
  createdAt, updatedAt
}
```

### QRCode (srv002)
```js
{
  content   : String (required)  ← URL or text to encode
  format    : "png" | "svg"      (default: "png")
  size      : Number             (default: 300)
  darkColor : String             (default: "#000000")
  lightColor: String             (default: "#ffffff")
  createdBy : ObjectId → User
  createdAt, updatedAt
}
```

---

## Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/its-Yogesh123/yolab.git
cd yolab
```

### 2. Backend setup
```bash
cd backend
npm install
```

Copy `.env.example` and fill in your values (see [Environment Variables](#environment-variables)):
```bash
cp .env .env.local   # edit with your values
npm start
```
Server starts on `http://localhost:8000`

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```
App starts on `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=8000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=Yolab
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## Goals

### ✅ Completed
- Modular monolith backend with independent service modules
- JWT + Google OAuth authentication
- URL Shortener (srv001) with visit tracking
- QR Code Generator (srv002) with color customization
- Platform-level subscription system (Free + Pro tiers)
- Per-service monthly usage limits with auto-reset
- Self-service upgrade/downgrade
- Admin plan management API
- Pricing page with live usage meters
- Responsive React 19 frontend

### 🔧 Short-Term
- Integrate Razorpay or Stripe for real Pro payments
- Centralize frontend API calls in `services/` directory
- Admin dashboard UI for subscription management
- Google OAuth → persist users to MongoDB

### 📅 Mid-Term
- Centralized SSO authentication
- Image processing service (srv003)
- File conversion service (srv004)
- API access for external developers
- Improve analytics: per-link + per-QR click tracking

### 🚀 Long-Term (Startup Vision)
- Migrate selected modules to microservices (Strangler Pattern)
- Public developer API with API key management
- Multi-tenant SaaS with team plans
- Establish YoLab as a reliable productivity utility platform

> YoLab is envisioned not only as a technical project but as a foundation for a future startup focused on productivity and web utilities.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

---

## License

This project is licensed under the **Apache License 2.0**.  
See the [LICENSE](LICENSE) file for details.

---

## Team

YoLab is currently developed and maintained by an independent developer.

- **Founder & Developer:** Yogesh Kumar
- **Role:** Everything 😄

Contributions and collaborations are welcome as the project grows.

---

*Happy Coding Devs — © 2026 YoLab. Made in India 🇮🇳*

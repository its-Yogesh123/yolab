# YoLab

![GitHub repo size](https://img.shields.io/github/repo-size/its-Yogesh123/yolab)
![GitHub stars](https://img.shields.io/github/stars/its-Yogesh123/yolab?style=social)
![GitHub forks](https://img.shields.io/github/forks/its-Yogesh123/yolab?style=social)
![GitHub issues](https://img.shields.io/github/issues/its-Yogesh123/yolab)
![GitHub license](https://img.shields.io/github/license/its-Yogesh123/yolab)

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express.js-lightgrey)
![React](https://img.shields.io/badge/Frontend-React_19-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Payments](https://img.shields.io/badge/Payments-Razorpay-blue)
![Subscription](https://img.shields.io/badge/Billing-Subscription_Ready-violet)

> **YoLab** is a multi-service SaaS platform providing useful web tools — URL Shortener, QR Code Generator, Image Processing, and more — under one unified interface with a built-in subscription and payment system.

# Made in INDIA 🇮🇳

---

## Table of Contents

- [Introduction](#introduction)
- [Live Services](#live-services)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Goals](#goals)
- [Changelog](#changelog)
- [License](#license)
- [Team](#team)

---

## Introduction

YoLab is a **multi-service SaaS platform** where developers and teams can access powerful web utilities — all under a single login and subscription.

The platform is **subscription-ready** — users start on a Free tier with monthly usage limits per service and can upgrade to Pro for unlimited access. Pro upgrades are handled via **Razorpay** with real payment verification, webhook fallback, and automatic email receipts.

---

## Live Services

| Service | Route | Free Limit | Pro Limit | Status |
|---|---|---|---|---|
| 🔗 URL Shortener | `/short-url` | 5 links/month | Unlimited | ✅ Live |
| 📱 QR Code Generator | `/qr-code` | 10 QR/month | Unlimited | ✅ Live |
| 🖼️ Image Processing | `/image-processing` | — | — | ✅ Live |
| 📄 Maester — PDF Analyzer | — | — | — | 🔜 Coming Soon |
| 💳 Pricing & Plans | `/pricing` | — | — | ✅ Live |

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

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | — | Runtime |
| Express | 5 | Web framework |
| Mongoose | 9 | MongoDB ODM |
| bcrypt | 6 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| Passport.js | 0.7 | Google OAuth 2.0 |
| Razorpay | 2 | Payment gateway |
| Nodemailer | 6 | Email receipts |
| multer | 2 | File upload handling |
| axios | 1 | HTTP proxy to microservices |

### Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Razorpay | Payment processing |
| Git | Version control |
| Vercel | Frontend deployment |

---

## Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Razorpay account (free to create — test mode works out of the box)

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

Copy the env template and fill in your values (see [Environment Variables](#environment-variables)):
```bash
cp .env.example .env   # fill in your secrets
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

# Razorpay — get from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email receipts — any SMTP provider (Gmail, Brevo, Resend, etc.)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_app_password
MAIL_FROM=YoLab <your@email.com>
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Email/password login → sets httpOnly JWT cookie |
| `POST` | `/auth/logout` | Public | Clears JWT cookie |
| `GET` | `/auth/session` | Public (cookie) | Validate cookie → return session user |
| `GET` | `/auth/google` | Public | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback |

### Subscription — `/api/subscription`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/subscription/me` | Login required | Current plan + per-service usage |
| `POST` | `/api/subscription/create-order` | Login required | Create Razorpay order for Pro upgrade |
| `POST` | `/api/subscription/verify` | Login required | Verify payment signature + activate Pro |
| `POST` | `/api/subscription/webhook` | Razorpay HMAC | Server-to-server payment fallback |
| `POST` | `/api/subscription/cancel` | Login required | Downgrade to Free |
| `PUT` | `/api/subscription/admin/:userId` | Admin only | Manually set any user's plan |

### URL Shortener — `/srv001` *(login required)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/srv001/url` | Create short URL |
| `GET` | `/s/:shortId` | Redirect to original URL |

### QR Code Generator — `/srv002` *(login required)*

| Method | Endpoint | Subscription | Description |
|---|---|---|---|
| `POST` | `/srv002/qr` | Gated | Generate QR code (Free: 10/mo, Pro: ∞) |
| `GET` | `/srv002/qr` | Login only | List my QR codes |
| `DELETE` | `/srv002/qr/:id` | Login only | Delete a QR code |

### Image Processing — `/api/image` *(login required)*

Proxied to the OnePic microservice. Supports Phase 1 (Enhancement), Phase 2 (Edge Detection), and Phase 3 (Transforms).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/image/gaussian` | Gaussian blur |
| `POST` | `/api/image/median` | Median filter |
| `POST` | `/api/image/sharpen` | Sharpening |
| `POST` | `/api/image/histogram-eq` | Histogram equalization |
| `POST` | `/api/image/sobel` | Sobel edge detection |
| `POST` | `/api/image/prewitt` | Prewitt edge detection |
| `POST` | `/api/image/laplacian` | Laplacian edge detection |
| `POST` | `/api/image/canny` | Canny edge detection |
| `POST` | `/api/image/rotate` | Rotate image |
| `POST` | `/api/image/flip` | Flip image |
| `POST` | `/api/image/resize` | Resize image |
| `POST` | `/api/image/brightness-contrast` | Brightness & contrast |
| `POST` | `/api/image/grayscale` | Convert to grayscale |
| `POST` | `/api/image/invert` | Invert colors |

---

## Goals

### ✅ Completed
- JWT + Google OAuth authentication
- URL Shortener (srv001) with visit tracking
- QR Code Generator (srv002) with color customization
- Image Processing (OnePic) — Phase 1, 2 & 3
- Platform-level subscription system (Free + Pro tiers)
- **Razorpay payment integration** — real Pro upgrades with HMAC verification, webhook fallback, email receipts
- Per-service monthly usage limits with auto-reset
- Admin plan management API
- Pricing page with live usage meters
- Analytics dashboard (admin-only)
- Responsive React 19 frontend

### 🔧 Short-Term
- Centralize frontend API calls in `services/` directory
- Admin dashboard UI for subscription management
- Self-service refund flow

### 📅 Mid-Term
- Maester — PDF Analyzer service
- Centralized SSO authentication
- File conversion service
- API access for external developers

### 🚀 Long-Term
- Public developer API with API key management
- Multi-tenant SaaS with team plans
- Establish YoLab as a reliable productivity utility platform

> YoLab is built not only as a technical project but as a foundation for a future startup focused on productivity and web utilities.

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

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

//
import { getRedirectUrl } from "./modules/short-url/srv001.controller.js";
// Route imports
import userRoutes from "./modules/users/user.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import srv001Routes from "./modules/short-url/srv001.routes.js";
import srv002Routes from "./modules/qr-code/srv002.routes.js";
import subscriptionRoutes from "./modules/subscription/subscription.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import feedbackRoutes from "./modules/feedback/feedback.routes.js";

// Middleware imports
import { isLoggedIn } from "./modules/auth/middlewares/authenticate.js";
import { isAuthorize } from "./modules/auth/middlewares/authorize.js";

// Passport (Google OAuth strategy registration)
import "./modules/auth/auth.passport.js";

const app = express();

/** Environment Variables */
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

/** Database Connection */
mongoose
  .connect(MONGO_URI)
  .then(() => { if (process.env.NODE_ENV !== 'production') console.log("✅ Connected to MongoDB"); })
  .catch((err) => { if (process.env.NODE_ENV !== 'production') console.log("❌ Unable to connect to MongoDB", err); });

/************************** Middleware **************************/
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

/************************** Routes **************************/

// Public auth routes (login, register, logout, session, Google OAuth)
app.use("/auth", authRoutes);

// User CRUD
app.use("/api/users", userRoutes);

// Subscription management
app.use("/api/subscription", subscriptionRoutes);

// Admin: Analytics (isLoggedIn + isAuthorize("admin") applied inside analytics.routes.js)
// Also exposes /api/admin/analytics/public (no auth)
app.use("/api/admin/analytics", analyticsRoutes);

// Feedback: public GET, logged-in POST
app.use("/api/feedback", feedbackRoutes);

// Public redirect for short URLs (no auth required)
app.get("/s/:shortId", getRedirectUrl);

// Service 001: URL Shortener — login required
app.use("/srv001", isLoggedIn, srv001Routes);

// Service 002: QR Code Generator — login required (subscription check is inside srv002.routes.js)
app.use("/srv002", isLoggedIn, srv002Routes);

/************************** Root & Test Routes **************************/
app.get("/", (req, res) => {
  return res.end("<html><h1>YoLab API is running 🚀</h1></html>");
});

app.get("/admin", isLoggedIn, (req, res) => {
  return res.status(200).json({ message: "Admin access granted" });
});

app.get("/dash", isLoggedIn, isAuthorize("admin"), (req, res) => {
  return res.status(200).json({ message: "Dashboard access granted" });
});

/************************** Server Start **************************/
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server started on port ${PORT}`);
  }
});
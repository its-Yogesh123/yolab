import express from "express";
import {
  getMySubscription,
  upgradePlan,
  cancelSubscription,
  adminSetPlan,
} from "./subscription.controller.js";
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
} from "./payment.controller.js";
import { isLoggedIn } from "../auth/middlewares/authenticate.js";
import { isAuthorize } from "../auth/middlewares/authorize.js";

const subscriptionRouter = express.Router();

// ── User subscription info ───────────────────────────────────────────────────
subscriptionRouter.get("/me", isLoggedIn, getMySubscription);
subscriptionRouter.post("/cancel", isLoggedIn, cancelSubscription);

// ── Legacy direct-upgrade (kept for admin/test use only) ─────────────────────
subscriptionRouter.post("/upgrade", isLoggedIn, upgradePlan);

// ── Razorpay payment flow ────────────────────────────────────────────────────
// Step 1: create a Razorpay order → returns order_id and key_id to frontend
subscriptionRouter.post("/create-order", isLoggedIn, createOrder);

// Step 2: frontend sends payment result → backend verifies HMAC signature
subscriptionRouter.post("/verify", isLoggedIn, verifyPayment);

// Webhook: Razorpay → backend (no cookie auth — verified by HMAC signature)
// NOTE: must receive raw body — configured in server.js
subscriptionRouter.post("/webhook", razorpayWebhook);

// ── Admin: manually set any user's plan ─────────────────────────────────────
subscriptionRouter.put(
  "/admin/:userId",
  isLoggedIn,
  isAuthorize("admin"),
  adminSetPlan
);

export default subscriptionRouter;

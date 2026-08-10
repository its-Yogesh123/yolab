import mongoose from "mongoose";
import { PLANS } from "./subscription.plans.js";

/**
 * Subscription Schema
 *
 * One document per user.
 * Tracks their plan tier and per-service usage with monthly resets.
 *
 * usage: {
 *   srv001: { count: 3, resetAt: Date }  ← URL Shortener
 *   srv002: { count: 1, resetAt: Date }  ← QR Generator
 * }
 */

const serviceUsageSchema = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    resetAt: { type: Date, default: () => nextMonthDate() },
  },
  { _id: false }
);

function nextMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

// Proper sub-schema for each payment transaction record
const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    amount:            { type: Number }, // stored in paise
    currency:          { type: String, default: 'INR' },
    paidAt:            { type: Date, default: Date.now },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: Object.keys(PLANS),
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    usage: {
      srv001: { type: serviceUsageSchema, default: () => ({}) },
      srv002: { type: serviceUsageSchema, default: () => ({}) },
    },
    // Payment history — one entry per successful Razorpay transaction
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;

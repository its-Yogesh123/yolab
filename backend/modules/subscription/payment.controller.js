import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "./subscription.model.js";
import { PLANS } from "./subscription.plans.js";
import { sendPaymentReceiptEmail } from "./payment.mailer.js";

// Razorpay client — lazy singleton so missing env keys don't crash on startup
let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys are not configured in .env");
    }
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

// Amount in paise: ₹1 = 100 paise (test mode). Switch to PLANS.pro.price * 100 in prod.
const PRO_AMOUNT_PAISE = PLANS.pro.price * 100;

// ──────────────────────────────────────────────────────────────────────────────
//  POST /api/subscription/create-order
//  Creates a Razorpay order and returns order_id + key to the frontend.
// ──────────────────────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay(); // throws if keys missing

    // Prevent duplicate active pro orders
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (sub?.plan === "pro" && sub?.status === "active") {
      return res.status(400).json({ error: "You are already on the Pro plan." });
    }

    const order = await razorpay.orders.create({
      amount:   PRO_AMOUNT_PAISE,
      currency: "INR",
      receipt:  `ylb_${req.user.id}_${Date.now()}`.slice(0, 40),
      notes:    { userId: String(req.user.id), plan: "pro" },
    });

    return res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key_id:   process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[payment] create-order error:", err.message);
    if (err.message.includes("not configured")) {
      return res.status(503).json({ error: "Payment gateway is not configured." });
    }
    return res.status(500).json({ error: "Failed to create payment order." });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
//  POST /api/subscription/verify
//  Verifies Razorpay HMAC signature, then activates Pro subscription.
//  Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ──────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields." });
    }

    // ── HMAC-SHA256 verification ──────────────────────────────────────────────
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      console.warn("[payment] signature mismatch — possible tamper attempt");
      return res.status(400).json({ error: "Payment verification failed. Please contact support." });
    }

    // ── Activate Pro ──────────────────────────────────────────────────────────
    let sub = await Subscription.findOne({ userId: req.user.id });
    if (!sub) sub = new Subscription({ userId: req.user.id });

    // Idempotency: skip if this order was already processed
    const alreadyProcessed = sub.payments?.some(
      (p) => p.razorpayOrderId === razorpay_order_id
    );
    if (alreadyProcessed) {
      return res.status(200).json({ message: "Payment already processed.", plan: sub.plan });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    sub.plan      = "pro";
    sub.status    = "active";
    sub.expiresAt = expiresAt;
    sub.payments.push({
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount:            PRO_AMOUNT_PAISE,
      currency:          "INR",
      paidAt:            new Date(),
    });
    await sub.save();

    // ── Fire-and-forget email receipt ─────────────────────────────────────────
    sendPaymentReceiptEmail({
      user:      req.user,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      amount:    PLANS.pro.price,
      expiresAt,
    }).catch((e) => console.error("[payment] receipt email error:", e.message));

    return res.status(200).json({
      message:   "Payment verified. Pro plan activated!",
      plan:      "pro",
      expiresAt,
    });
  } catch (err) {
    console.error("[payment] verify error:", err.message);
    return res.status(500).json({ error: "Internal server error during payment verification." });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
//  POST /api/subscription/webhook
//  Called server-to-server by Razorpay. No cookie auth — verified by signature.
//  Handles: payment.captured (reliable fallback) and payment.failed (logging).
// ──────────────────────────────────────────────────────────────────────────────
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("[webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping verification");
    } else {
      // req.body is a raw Buffer from express.raw() — must call .toString() before hashing
      const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expected !== signature) {
        console.warn("[webhook] invalid signature");
        return res.status(400).json({ error: "Invalid webhook signature." });
      }
    }

    // Parse body — may still be a Buffer if webhook secret was not set
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString("utf8")) : req.body;
    const event   = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (event === "payment.captured" && payment) {
      const userId  = payment.notes?.userId;
      const orderId = payment.order_id;

      if (!userId) {
        console.warn("[webhook] payment.captured has no userId in notes");
        return res.status(200).json({ received: true });
      }

      let sub = await Subscription.findOne({ userId });
      if (!sub) sub = new Subscription({ userId });

      // Idempotency guard
      const alreadyDone = sub.payments?.some((p) => p.razorpayOrderId === orderId);
      if (!alreadyDone) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        sub.plan      = "pro";
        sub.status    = "active";
        sub.expiresAt = expiresAt;
        sub.payments.push({
          razorpayOrderId:   orderId,
          razorpayPaymentId: payment.id,
          amount:            payment.amount,
          currency:          payment.currency,
          paidAt:            new Date(),
        });
        await sub.save();
        console.log(`[webhook] Pro activated for userId=${userId} via payment.captured`);
      }
    }

    if (event === "payment.failed" && payment) {
      console.warn(`[webhook] payment.failed — orderId=${payment.order_id} reason=${payment.error_reason}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[webhook] error:", err.message);
    return res.status(500).json({ error: "Webhook processing failed." });
  }
};

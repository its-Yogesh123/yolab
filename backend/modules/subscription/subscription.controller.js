import Subscription from "./subscription.model.js";
import { PLANS, getLimitForService } from "./subscription.plans.js";

/**
 * GET /api/subscription/me
 * Returns the current user's plan, usage, and limits.
 */
export const getMySubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.id });

    if (!sub) {
      // Auto-heal: create if missing
      sub = await Subscription.create({ userId: req.user.id });
    }

    const planConfig = PLANS[sub.plan];
    const usageData = {};

    for (const serviceCode of Object.keys(planConfig.limits)) {
      const limit = getLimitForService(sub.plan, serviceCode);
      const used = sub.usage?.[serviceCode]?.count ?? 0;
      const resetAt = sub.usage?.[serviceCode]?.resetAt ?? null;

      usageData[serviceCode] = {
        used,
        limit: limit === Infinity ? null : limit, // null = unlimited in JSON
        resetAt,
        isUnlimited: limit === Infinity,
      };
    }

    return res.status(200).json({
      plan: sub.plan,
      planLabel: planConfig.label,
      status: sub.status,
      expiresAt: sub.expiresAt,
      usage: usageData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/subscription/upgrade
 * Self-service: user requests Pro plan.
 * (Payment gateway integration point — currently auto-approves for testing)
 */
export const upgradePlan = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user.id });

    if (!sub) {
      sub = await Subscription.create({ userId: req.user.id });
    }

    if (sub.plan === "pro" && sub.status === "active") {
      return res.status(400).json({ message: "You are already on the Pro plan." });
    }

    // TODO: Integrate Razorpay/Stripe payment verification here.
    // For now, auto-approve for development/testing.
    sub.plan = "pro";
    sub.status = "active";
    sub.expiresAt = null; // Set to subscription end date after payment integration
    await sub.save();

    return res.status(200).json({
      message: "Successfully upgraded to Pro plan!",
      plan: sub.plan,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/subscription/cancel
 * Self-service: user downgrades back to Free.
 */
export const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id });

    if (!sub || sub.plan === "free") {
      return res.status(400).json({ message: "You are already on the Free plan." });
    }

    sub.plan = "free";
    sub.status = "active";
    sub.expiresAt = null;
    await sub.save();

    return res.status(200).json({
      message: "Subscription cancelled. You are now on the Free plan.",
      plan: sub.plan,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/subscription/admin/:userId
 * Admin: manually set any user's plan.
 * Body: { plan: "free" | "pro", expiresAt?: ISO date string }
 */
export const adminSetPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, expiresAt } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({
        message: `Invalid plan. Valid options: ${Object.keys(PLANS).join(", ")}`,
      });
    }

    let sub = await Subscription.findOne({ userId });

    if (!sub) {
      sub = await Subscription.create({ userId });
    }

    sub.plan = plan;
    sub.status = "active";
    sub.expiresAt = expiresAt ? new Date(expiresAt) : null;
    await sub.save();

    return res.status(200).json({
      message: `User plan updated to ${PLANS[plan].label} successfully.`,
      userId,
      plan: sub.plan,
      expiresAt: sub.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

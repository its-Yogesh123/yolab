import Subscription from "../subscription.model.js";
import { getLimitForService, PLANS } from "../subscription.plans.js";

/**
 * hasActiveSubscription(serviceCode)
 *
 * Middleware factory — call with a service code (e.g. "srv002").
 * Checks the logged-in user's subscription plan against the service limit.
 *
 * Usage in routes:
 *   router.post('/qr', isLoggedIn, hasActiveSubscription('srv002'), controller)
 *
 * Flow:
 *  1. Find user's Subscription document (create Free plan if missing)
 *  2. Check if monthly usage window has expired → reset if needed
 *  3. Compare count vs limit for this service
 *  4. If within limit → increment count, call next()
 *  5. If over limit → 429 with upgrade info
 */
export const hasActiveSubscription = (serviceCode) => async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n--- [checkSubscription Middleware] STARTED ---`);
      console.log(`[checkSubscription] Service Code: ${serviceCode}`);
      console.log(`[checkSubscription] req.user (from auth middleware):`, req.user);
    }

    let sub = await Subscription.findOne({ userId: req.user.id });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[checkSubscription] Subscription found in DB:`, sub ? `Yes, Plan: ${sub.plan}` : "No");
    }

    // Auto-create Free subscription if user somehow doesn't have one
    if (!sub) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[checkSubscription] DB WRITE COMMENTED OUT: Would have created a Free subscription here.`);
      }
      // sub = await Subscription.create({ userId: req.user.id });
      sub = new Subscription({ userId: req.user.id, plan: 'free', status: 'active', usage: {} }); // Mock for the rest of the flow
    }

    // Check subscription status
    if (sub.status !== "active") {
      return res.status(403).json({
        message: "Your subscription is inactive. Please contact support.",
        status: sub.status,
      });
    }

    // Check if pro plan is expired
    if (sub.plan === "pro" && sub.expiresAt && sub.expiresAt < new Date()) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[checkSubscription] DB WRITE COMMENTED OUT: Would have downgraded expired pro plan to free.`);
      }
      sub.plan = "free";
      sub.status = "active";
      sub.expiresAt = null;
      // await sub.save();
    }

    // Ensure the usage sub-document exists for this service
    if (!sub.usage[serviceCode]) {
      sub.usage[serviceCode] = { count: 0, resetAt: nextMonthDate() };
    }

    const serviceUsage = sub.usage[serviceCode];

    // Check if the monthly usage window has expired → reset count
    if (serviceUsage.resetAt && new Date() > serviceUsage.resetAt) {
      serviceUsage.count = 0;
      serviceUsage.resetAt = nextMonthDate();
    }

    const limit = getLimitForService(sub.plan, serviceCode);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[checkSubscription] Current usage count: ${serviceUsage.count}, Limit: ${limit}`);
    }

    // Pro plan → unlimited
    if (limit === Infinity) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[checkSubscription] User is on Pro plan (unlimited).`);
        console.log(`[checkSubscription] DB WRITE COMMENTED OUT: Would have incremented count.`);
      }
      // serviceUsage.count += 1;
      // sub.markModified("usage");
      // await sub.save();
      req.subscription = { plan: sub.plan, used: serviceUsage.count + 1, limit: null };
      if (process.env.NODE_ENV !== 'production') {
        console.log(`--- [checkSubscription Middleware] PASSED ---\n`);
      }
      return next();
    }

    // Free plan → check limit
    if (serviceUsage.count >= limit) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[checkSubscription] Limit reached! Blocking request.`);
      }
      return res.status(429).json({
        message: `Monthly limit reached for this service (${limit}/${limit} used).`,
        code: "LIMIT_REACHED",
        serviceCode,
        used: serviceUsage.count,
        limit,
        resetAt: serviceUsage.resetAt,
        upgradeTo: "pro",
        upgradePrice: PLANS.pro.price,
      });
    }

    // Within limit → increment and continue
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[checkSubscription] Within limits. DB WRITE COMMENTED OUT: Would have incremented count.`);
    }
    serviceUsage.count += 1;
    sub.markModified("usage");
    await sub.save();

    // Attach subscription info to request (useful in controllers)
    req.subscription = {
      plan: sub.plan,
      used: serviceUsage.count + 1, // sending simulated incremented value
      limit,
      remaining: limit - (serviceUsage.count + 1),
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- [checkSubscription Middleware] PASSED ---\n`);
    }
    return next();
  } catch (error) {
    console.error("Subscription middleware error:", error);
    return res.status(500).json({ message: "Error checking subscription." });
  }
};

function nextMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * subscription.plans.js
 * Central source of truth for all subscription plan definitions.
 * To change limits for any service or plan — edit ONLY this file.
 *
 * usageLimit: Infinity = no limit (Pro tier)
 * Add new services by adding a key under each plan's `limits` object.
 */

export const PLANS = {
  free: {
    label: "Free",
    price: 0,
    description: "Great for getting started",
    limits: {
      srv001: 5,   // URL Shortener: 5 links/month
      srv002: 10,  // QR Generator:  10 QR codes/month
    },
  },
  pro: {
    label: "Pro",
    price: 1,    // ₹1 for testing — change to 299 before production
    description: "For power users and teams",
    limits: {
      srv001: Infinity,
      srv002: Infinity,
    },
  },
};

/**
 * Returns the usage limit for a given plan + service combo.
 * Falls back to 0 if the service is not listed under the plan.
 */
export const getLimitForService = (plan, serviceCode) => {
  return PLANS[plan]?.limits?.[serviceCode] ?? 0;
};

/**
 * Returns true if plan A meets or exceeds plan B's tier.
 * Order: free < pro
 */
const PLAN_ORDER = ["free", "pro"];
export const planMeetsRequirement = (userPlan, requiredPlan) => {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
};

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Sparkles, ArrowRight, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/context/sessions";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FEATURES = {
  free: [
    "5 Short URLs per month",
    "10 QR Codes per month",
    "Basic QR customization",
    "Link history",
    "Standard support",
  ],
  pro: [
    "Unlimited Short URLs",
    "Unlimited QR Codes",
    "Advanced QR colors & sizes",
    "Full analytics dashboard",
    "Priority support",
    "Early access to new services",
    "API access (coming soon)",
  ],
};

function UsageMeter({ label, used, limit, isUnlimited }) {
  const pct = isUnlimited ? 100 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && pct >= 80;
  const isAtLimit = !isUnlimited && used >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-400">{label}</span>
        <span className={isAtLimit ? "text-red-400 font-semibold" : "text-neutral-300"}>
          {isUnlimited ? "∞ Unlimited" : `${used} / ${limit} used`}
        </span>
      </div>
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isUnlimited ? 100 : pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isUnlimited
              ? "bg-gradient-to-r from-violet-500 to-purple-500"
              : isAtLimit
              ? "bg-red-500"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-gradient-to-r from-emerald-500 to-teal-500"
          }`}
        />
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { session } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── Per-page SEO ──
  useEffect(() => {
    document.title = 'Pricing — Free & Pro Plans | YoLab';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'YoLab Free gives you 5 short URLs and 10 QR codes monthly. Upgrade to Pro for unlimited access to every current and upcoming YoLab service.');
  }, []);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    fetchSubscription();
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${API}/api/subscription/me`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setSubscription(data);
    } catch {
      toast.error("Failed to load subscription info.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!session) { window.location.href = "/auth/login"; return; }
    setUpgrading(true);
    try {
      const res = await fetch(`${API}/api/subscription/upgrade`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🎉 Upgraded to Pro successfully!");
        fetchSubscription();
      } else {
        toast.error(data.message || "Upgrade failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${API}/api/subscription/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.info("Subscription cancelled. You're now on the Free plan.");
        fetchSubscription();
      } else {
        toast.error(data.message || "Cancellation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setCancelling(false);
    }
  };

  const isPro = subscription?.plan === "pro";

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans">
      <main className="container mx-auto px-4 py-20 max-w-5xl space-y-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/30 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        {/* Current Usage (shown when logged in) */}
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#111111] border-neutral-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Your Current Usage</span>
                  </div>
                  {subscription && (
                    <Badge
                      className={`${
                        isPro
                          ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                          : "bg-neutral-700/50 text-neutral-300 border-neutral-600"
                      } text-xs px-3`}
                    >
                      {isPro ? <Crown className="w-3 h-3 mr-1" /> : null}
                      {subscription.planLabel} Plan
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-neutral-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading usage...
                  </div>
                ) : subscription ? (
                  <>
                    <UsageMeter
                      label="Short URLs"
                      used={subscription.usage?.srv001?.used ?? 0}
                      limit={subscription.usage?.srv001?.limit ?? 5}
                      isUnlimited={subscription.usage?.srv001?.isUnlimited}
                    />
                    <UsageMeter
                      label="QR Codes"
                      used={subscription.usage?.srv002?.used ?? 0}
                      limit={subscription.usage?.srv002?.limit ?? 10}
                      isUnlimited={subscription.usage?.srv002?.isUnlimited}
                    />
                    {subscription.usage?.srv001?.resetAt && !isPro && (
                      <p className="text-xs text-neutral-600">
                        Resets on:{" "}
                        {new Date(subscription.usage.srv001.resetAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-neutral-500 text-sm">Could not load usage data.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className={`bg-[#111111] border-neutral-800 relative ${
                !isPro && session ? "ring-1 ring-emerald-500/30" : ""
              }`}
            >
              {!isPro && session && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardContent className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-neutral-400" />
                    <h2 className="text-xl font-bold">Free</h2>
                  </div>
                  <p className="text-neutral-500 text-sm">Perfect for getting started</p>
                </div>

                <div>
                  <span className="text-4xl font-extrabold">₹0</span>
                  <span className="text-neutral-500 text-sm ml-1">/ month</span>
                </div>

                <ul className="space-y-3">
                  {FEATURES.free.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-900"
                  disabled
                >
                  {!session ? "Get Started Free" : "Current Plan"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className={`relative border-violet-500/40 bg-gradient-to-b from-violet-950/30 to-[#111111] ${
                isPro ? "ring-1 ring-violet-500/50" : ""
              }`}
            >
              <div className="absolute -top-3 left-6">
                <Badge className="bg-violet-600 text-white border-0 text-xs">
                  <Zap className="w-3 h-3 mr-1" /> Most Popular
                </Badge>
              </div>
              {isPro && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                    <Crown className="w-3 h-3 mr-1" /> Current Plan
                  </Badge>
                </div>
              )}
              <CardContent className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <h2 className="text-xl font-bold">Pro</h2>
                  </div>
                  <p className="text-neutral-500 text-sm">For power users and growing teams</p>
                </div>

                <div>
                  <span className="text-4xl font-extrabold">₹299</span>
                  <span className="text-neutral-500 text-sm ml-1">/ month</span>
                </div>

                <ul className="space-y-3">
                  {FEATURES.pro.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isPro ? (
                  <Button
                    variant="outline"
                    className="w-full border-red-800/50 text-red-400 hover:bg-red-950/30"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                  >
                    {upgrading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Upgrade to Pro <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ note */}
        <p className="text-center text-neutral-600 text-sm">
          Payment gateway integration coming soon. Upgrades are instant during beta.
        </p>
      </main>
    </div>
  );
}

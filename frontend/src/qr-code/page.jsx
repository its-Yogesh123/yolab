import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Download, Trash2, Loader2, Crown,
  Zap, AlertTriangle, ArrowRight, Palette, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/context/sessions";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function UsageBar({ used, limit, isUnlimited }) {
  const pct = isUnlimited ? 100 : Math.min((used / limit) * 100, 100);
  const isAtLimit = !isUnlimited && used >= limit;
  const isNear = !isUnlimited && pct >= 70;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Monthly Usage</span>
        <span className={isAtLimit ? "text-red-400 font-semibold" : ""}>
          {isUnlimited ? "∞ Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isUnlimited ? 100 : pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isUnlimited ? "bg-violet-500"
              : isAtLimit ? "bg-red-500"
              : isNear ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
        />
      </div>
    </div>
  );
}

export default function QRCodeService() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [size, setSize] = useState(300);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetchSubscription();
    fetchHistory();
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${API}/api/subscription/me`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setSubscription(data);
    } catch {
      // silent fail
    } finally {
      setSubLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/srv002/qr`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setHistory(data.data || []);
    } catch {
      // silent fail
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!session) { navigate("/auth/login"); return; }
    if (!content.trim()) { toast.error("Please enter a URL or text."); return; }

    setLoading(true);
    setQrResult(null);
    try {
      const res = await fetch(`${API}/srv002/qr`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, size, darkColor, lightColor }),
      });
      const data = await res.json();

      if (res.status === 429) {
        // Limit reached
        toast.error(data.message || "Monthly limit reached.");
        setSubscription((prev) => prev ? { ...prev, limitReached: true } : prev);
        return;
      }
      if (!res.ok) {
        toast.error(data.message || "Failed to generate QR code.");
        return;
      }

      setQrResult(data.data);
      // Update local subscription usage
      if (data.subscription) {
        setSubscription((prev) => prev
          ? { ...prev, usage: { ...prev.usage, srv002: { ...prev.usage?.srv002, used: data.subscription.used, limit: data.subscription.limit } } }
          : prev
        );
      }
      toast.success("QR Code generated!");
      fetchHistory();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrResult?.qrImage) return;
    const a = document.createElement("a");
    a.href = qrResult.qrImage;
    a.download = `yolab-qr-${Date.now()}.png`;
    a.click();
    toast.success("Downloaded!");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/srv002/qr/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((q) => q.id !== id));
        toast.info("Deleted.");
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  const isPro = subscription?.plan === "pro";
  const srv002Usage = subscription?.usage?.srv002;
  const limitReached = !isPro && srv002Usage && srv002Usage.used >= (srv002Usage.limit ?? 10);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="bg-violet-600 p-1.5 rounded-md">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Yo<span className="text-neutral-400">QR</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!subLoading && subscription && (
              <Badge
                className={`text-xs ${isPro
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
                }`}
              >
                {isPro ? <Crown className="w-3 h-3 mr-1" /> : null}
                {subscription.planLabel}
              </Badge>
            )}
            <a href="/pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Pricing
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            QR Code <span className="text-neutral-400">Generator</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Turn any URL or text into a scannable QR code in seconds.
          </p>
        </motion.div>

        {/* Usage Bar */}
        {session && !subLoading && srv002Usage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UsageBar
              used={srv002Usage.used ?? 0}
              limit={srv002Usage.limit ?? 10}
              isUnlimited={srv002Usage.isUnlimited}
            />
          </motion.div>
        )}

        {/* Limit Reached Banner */}
        <AnimatePresence>
          {limitReached && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-amber-950/30 border border-amber-500/30"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-300">Monthly limit reached</p>
                  <p className="text-sm text-neutral-400">
                    You've used all {srv002Usage?.limit} QR codes for this month. Upgrade to Pro for unlimited.
                  </p>
                </div>
              </div>
              <a href="/pricing">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white text-sm gap-2 shrink-0">
                  Upgrade to Pro <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generator Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#111111] border-neutral-800 relative overflow-hidden">
            {!session && (
              <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-neutral-900/80 p-6 rounded-2xl border border-neutral-800 max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="w-12 h-12 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <QrCode className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Sign in to Generate</h3>
                  <p className="text-sm text-neutral-400">
                    You need an account to create, customize, and save QR codes.
                  </p>
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white mt-2 gap-2"
                    onClick={() => navigate("/auth/login")}
                  >
                    Sign In to Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <CardContent className={`p-6 ${!session ? "opacity-30 pointer-events-none select-none blur-sm" : ""}`}>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-neutral-400 mb-2 block">
                    URL or Text to encode
                  </label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="https://yourwebsite.com or any text..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={loading || limitReached}
                      className="flex-1 h-12 text-base"
                    />
                    <Button
                      type="submit"
                      disabled={loading || limitReached || !content.trim()}
                      className="h-12 px-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <><QrCode className="w-4 h-4 mr-2" /> Generate</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Customization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Size (px)
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-9 bg-neutral-900 border border-neutral-700 rounded-md px-2 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value={200}>200 × 200</option>
                      <option value={300}>300 × 300</option>
                      <option value={400}>400 × 400</option>
                      <option value={600}>600 × 600</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" /> QR Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-9 h-9 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-sm text-neutral-400 font-mono">{darkColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" /> Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-9 h-9 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-sm text-neutral-400 font-mono">{lightColor}</span>
                    </div>
                  </div>
                </div>
              </form>

              {/* QR Result */}
              <AnimatePresence>
                {qrResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-6 flex flex-col sm:flex-row items-center gap-6 p-6 bg-neutral-950 rounded-lg border border-neutral-800"
                  >
                    <div className="shrink-0 rounded-lg overflow-hidden border-4 border-neutral-800 shadow-lg">
                      <img
                        src={qrResult.qrImage}
                        alt="Generated QR Code"
                        style={{ width: 160, height: 160 }}
                      />
                    </div>
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <p className="text-sm text-neutral-400 font-medium">QR code ready!</p>
                      <p className="text-sm text-neutral-300 break-all">{qrResult.content}</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Button
                          onClick={handleDownload}
                          className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
                        >
                          <Download className="w-4 h-4" /> Download PNG
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* History */}
        {session && history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent QR Codes</h2>
              <span className="text-sm text-neutral-500">{history.length} codes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((qr) => (
                <Card key={qr.id} className="bg-[#111111] border-neutral-800 group">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate font-medium">{qr.content}</p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {new Date(qr.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(qr.id)}
                      className="h-8 w-8 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

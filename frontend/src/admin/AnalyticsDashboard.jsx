import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Activity, QrCode, Link as LinkIcon,
  RefreshCw, Loader2, ShieldAlert, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/context/sessions";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-[#111111] border-neutral-800 hover:border-neutral-700 transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-md bg-neutral-950 text-neutral-300 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-400 truncate">{label}</p>
            <p className="text-2xl font-bold mt-0.5 tabular-nums">
              {value !== undefined ? value.toLocaleString() : <span className="text-neutral-600">—</span>}
            </p>
            {sub && <p className="text-xs text-neutral-600 mt-0.5">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ServiceBar({ label, value, max, delay = 0 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral-300 font-medium">{label}</span>
        <span className="text-neutral-400 tabular-nums font-mono">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay }}
          className="h-full rounded-full bg-neutral-200"
        />
      </div>
    </motion.div>
  );
}

function ActivityRow({ entry, index }) {
  const time = new Date(entry.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-start gap-3 py-2.5 border-b border-neutral-800 last:border-0"
    >
      <span className="text-xs text-neutral-600 font-mono shrink-0 mt-0.5 w-16">{time}</span>
      <p className="text-sm text-neutral-300 leading-snug">{entry.actionName}</p>
      <span className="text-xs text-neutral-600 ml-auto shrink-0 truncate max-w-[120px]">
        {entry.userIdentifier}
      </span>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();

  const [summary, setSummary]   = useState(null);
  const [feed, setFeed]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [summaryRes, feedRes] = await Promise.all([
        fetch(`${API}/api/admin/analytics/summary`, { credentials: "include" }),
        fetch(`${API}/api/admin/analytics/feed`,    { credentials: "include" }),
      ]);

      if (summaryRes.status === 403 || feedRes.status === 403) {
        toast.error("Access denied. Admin only.");
        navigate("/");
        return;
      }

      const summaryData = await summaryRes.json();
      const feedData    = await feedRes.json();

      if (summaryRes.ok) setSummary(summaryData);
      if (feedRes.ok)    setFeed(feedData.data || []);
      setLastRefresh(new Date());
      if (isRefresh) toast.success("Refreshed!");
    } catch {
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) { navigate("/auth/login"); return; }
    if (session.role !== "admin") { navigate("/"); return; }
    fetchData();
  }, [session, sessionLoading, fetchData, navigate]);

  // ── Derived values ──
  const totalUsers  = summary?.allTime?.totalUsers ?? 0;
  const activeToday = summary?.today?.activeUsers ?? 0;
  const newToday    = summary?.today?.newUsers ?? 0;
  const qrAll       = summary?.allTime?.serviceUsage?.qrGenerator ?? 0;
  const urlAll      = summary?.allTime?.serviceUsage?.shortUrl ?? 0;
  const qrToday     = summary?.today?.serviceUsage?.qrGenerator ?? 0;
  const urlToday    = summary?.today?.serviceUsage?.shortUrl ?? 0;
  const totalApiCalls = qrToday + urlToday;
  const maxService  = Math.max(qrAll, urlAll, 1);

  // ── Loading / guard states ──
  if (sessionLoading || (loading && !summary)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans pb-20">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-200 p-1.5 rounded-md text-neutral-950">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Yo<span className="text-neutral-400">Analytics</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-neutral-800 text-neutral-400 border-neutral-700 text-xs hidden sm:flex">
              <ShieldAlert className="w-3 h-3 mr-1" /> Admin Only
            </Badge>
            {lastRefresh && (
              <span className="text-xs text-neutral-600 hidden md:block">
                Updated {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-neutral-400">
            Platform usage overview · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </motion.div>

        {/* ── Metric Cards (2×2 grid) ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={totalUsers}
            sub="All registered accounts"
            delay={0}
          />
          <StatCard
            icon={Activity}
            label="Active Users (Today)"
            value={activeToday}
            sub={`${newToday} new today`}
            delay={0.05}
          />
          <StatCard
            icon={LinkIcon}
            label="Short URLs Created (Today)"
            value={urlToday}
            sub={`${urlAll.toLocaleString()} all-time`}
            delay={0.1}
          />
          <StatCard
            icon={QrCode}
            label="QR Codes Generated (Today)"
            value={qrToday}
            sub={`${qrAll.toLocaleString()} all-time`}
            delay={0.15}
          />
        </section>

        {/* ── Body: Service Usage + Activity Feed ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Service Popularity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#111111] border-neutral-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-neutral-200">
                  Service Usage — All Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <ServiceBar label="🔗 Short URL"    value={urlAll} max={maxService} delay={0.25} />
                <ServiceBar label="📱 QR Generator" value={qrAll}  max={maxService} delay={0.3}  />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-[#111111] border-neutral-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-neutral-200">
                    Recent Activity
                  </CardTitle>
                  <span className="text-xs text-neutral-600">Last {feed.length} events</span>
                </div>
              </CardHeader>
              <CardContent className="max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {feed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-neutral-600">
                    <Clock className="w-6 h-6" />
                    <p className="text-sm">No activity recorded yet.</p>
                  </div>
                ) : (
                  feed.map((entry, i) => (
                    <ActivityRow key={entry._id || i} entry={entry} index={i} />
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>

      </main>
    </div>
  );
}

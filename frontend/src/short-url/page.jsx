import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link as LinkIcon, Sparkles, Copy, ExternalLink, QrCode, 
  Trash2, Moon, Sun, Settings2, BarChart3, Activity, 
  Globe, Loader2, Check, Crown, AlertTriangle, ArrowRight, Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming standard shadcn/ui paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSession } from "@/context/sessions";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function UsageBar({ used, limit, isUnlimited }) {
  const pct = isUnlimited ? 100 : Math.min((used / limit) * 100, 100);
  const isAtLimit = !isUnlimited && used >= limit;
  const isNear = !isUnlimited && pct >= 70;

  return (
    <div className="space-y-1 w-full max-w-2xl mx-auto mb-6">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Active Links</span>
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
            isUnlimited ? "bg-neutral-200"
              : isAtLimit ? "bg-red-500"
              : isNear ? "bg-amber-500"
              : "bg-neutral-200"
          }`}
        />
      </div>
    </div>
  );
}

export default function ShortUrlService() {
  const { session } = useSession();
  const navigate = useNavigate();

  // ── Per-page SEO ──
  useEffect(() => {
    document.title = 'YoShort — Free URL Shortener with Click Analytics | YoLab';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Shorten long URLs into branded short links. Track clicks, set custom aliases, manage link expiry, and scan QR codes — all free on YoLab.');
  }, []);

  // State
  const [darkMode, setDarkMode] = useState(true);
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // Analytics Dialog State
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!session) return;
    fetchSubscription();
    fetchLinks();
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

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API}/srv001/my-urls`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setRecentLinks(data.data || []);
    } catch {
      // silent fail
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!session) { navigate("/auth/login"); return; }
    if (!longUrl) { toast.error("Please enter a URL to shorten."); return; }
    if (!isValidUrl(longUrl)) { toast.error("Please enter a valid URL (e.g., https://example.com)."); return; }

    setLoading(true);
    setGeneratedUrl(null);
    setGeneratedQr(null);

    try {
      const res = await fetch(`${API}/srv001/url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectURL: longUrl, customAlias: alias }),
      });
      const data = await res.json();

      if (res.status === 429) {
        toast.error(data.message || "Active URL limit reached.");
        setSubscription((prev) => prev ? { ...prev, limitReached: true } : prev);
        return;
      }
      if (!res.ok) {
        toast.error(data.message || "Failed to shorten URL.");
        return;
      }

      setGeneratedUrl(data.data.shortId);
      setGeneratedQr(data.data.qrCodeImage);
      toast.success("URL shortened successfully!");
      setLongUrl("");
      setAlias("");
      fetchLinks();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortId) => {
    const url = `${window.location.origin}/s/${shortId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (shortId, e) => {
    e?.stopPropagation(); // prevent opening dialog
    if (!window.confirm("Are you sure you want to delete this short URL?")) return;
    try {
      const res = await fetch(`${API}/srv001/url/${shortId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRecentLinks(prev => prev.filter(link => link.shortId !== shortId));
        toast.info("Link deleted.");
        fetchLinks(); // refresh count
      } else {
        toast.error("Delete failed.");
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  const openAnalytics = async (link) => {
    setSelectedLink(link);
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API}/srv001/analytics/${link.shortId}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data.data);
      }
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDownloadQr = () => {
    if (!analyticsData?.qrCodeImage) return;
    const a = document.createElement("a");
    a.href = analyticsData.qrCodeImage;
    a.download = `qr-${analyticsData.shortId}.png`;
    a.click();
    toast.success("QR Downloaded!");
  };

  const isPro = subscription?.plan === "pro";
  const activeCount = recentLinks.length;
  const planLimit = isPro ? Infinity : (subscription?.limits?.srv001 || 5);
  const limitReached = !isPro && activeCount >= planLimit;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] transition-colors duration-300 font-sans selection:bg-neutral-700 pb-20">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-200 p-1.5 rounded-md text-neutral-950">
              <LinkIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Yo<span className="text-neutral-400">Short</span></span>
          </div>
          <div className="flex items-center gap-4">
            {!subLoading && subscription && (
              <Badge className={`hidden sm:flex text-xs ${isPro ? "bg-neutral-200 text-neutral-900" : "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                {isPro ? <Crown className="w-3 h-3 mr-1" /> : null}
                {subscription.planLabel || subscription.plan}
              </Badge>
            )}
            <div className="hidden md:flex gap-6 text-sm font-medium text-neutral-400 mr-2">
              <a href="#" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="rounded-full">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
        
        {/* --- HERO & GENERATOR SECTION --- */}
        <section className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Shorten Your Links. <br />
              <span className="text-neutral-300">Expand Your Reach.</span>
            </h1>
            <p className="text-neutral-400 text-lg">
              A powerful, reliable, and secure URL shortener for modern teams. Build branded links and track your performance in real-time.
            </p>
          </div>

          {session && !subLoading && (
            <UsageBar used={activeCount} limit={planLimit} isUnlimited={isPro} />
          )}

          <AnimatePresence>
            {limitReached && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 w-full max-w-2xl rounded-lg bg-amber-950/30 border border-amber-500/30 mb-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-amber-300">Active URL limit reached</p>
                    <p className="text-sm text-neutral-400">
                      You have {activeCount} active URLs. Delete some or upgrade to Pro to create more.
                    </p>
                  </div>
                </div>
                <a href="/pricing">
                  <Button className="bg-neutral-200 hover:bg-white text-neutral-900 text-sm gap-2 shrink-0">
                    Upgrade to Pro <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl relative z-10"
          >
            {/* min-h-[320px] ensures the absolute overlay always has height to fill,
                even on mobile when CardContent is blurred/hidden */}
            <Card className="relative bg-[#111111] border-neutral-800 shadow-xl rounded-md overflow-hidden min-h-[320px]">
              {!session && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-neutral-900/90 p-6 rounded-2xl border border-neutral-800 max-w-sm w-full space-y-4 shadow-2xl">
                    <div className="w-12 h-12 bg-neutral-200 text-neutral-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      <LinkIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Sign in to Shorten</h3>
                    <p className="text-sm text-neutral-400">
                      You need an account to create, customize, and track your links.
                    </p>
                    <Button 
                      className="w-full bg-neutral-200 hover:bg-white text-neutral-900 mt-2 gap-2"
                      onClick={() => navigate("/auth/login")}
                    >
                      Sign In to Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* min-h keeps the card tall enough for the overlay when session is null */}
              <CardContent className={`p-6 min-h-[320px] ${!session ? "opacity-30 pointer-events-none select-none blur-sm" : ""}`}>
                <form onSubmit={handleShorten} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <Input 
                        placeholder="Paste your long URL here... (https://...)" 
                        className="pl-10 h-12 text-base rounded-xl"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        disabled={loading || limitReached}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="h-12 px-8 rounded-md bg-neutral-200 hover:bg-white text-neutral-950 font-semibold transition-all"
                      disabled={loading || limitReached}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" /> Shorten
                        </>
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="grid grid-cols-1 gap-4 p-4 bg-[#0a0a0a] rounded-md border border-neutral-800">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400 text-left block">Custom Alias (Optional)</label>
                            <div className="flex shadow-sm rounded-md">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-700 bg-neutral-900 text-neutral-400 sm:text-sm">
                                {window.location.host}/s/
                              </span>
                              <Input 
                                placeholder="my-campaign" 
                                className="rounded-l-none focus-visible:ring-neutral-500"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                disabled={loading || limitReached}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                      disabled={limitReached}
                    >
                      <Settings2 className="w-4 h-4" /> 
                      {showAdvanced ? "Hide Advanced Options" : "Advanced Options"}
                    </button>
                  </div>
                </form>

                {/* SUCCESS RESULT */}
                <AnimatePresence>
                  {generatedUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mt-6 p-4 rounded-md bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full">
                        {generatedQr && (
                          <div className="shrink-0 bg-white p-1 rounded">
                             <img src={generatedQr} alt="QR" className="w-12 h-12" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm text-neutral-400 font-medium">Ready to share!</p>
                          <a href={`/s/${generatedUrl}`} target="_blank" rel="noreferrer" className="text-lg font-bold text-white truncate block hover:underline">
                            {window.location.host}/s/{generatedUrl}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => handleCopy(generatedUrl)} className="bg-[#111111]">
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy Link</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button variant="default" className="bg-neutral-200 hover:bg-white text-neutral-950 w-full sm:w-auto gap-2" asChild>
                          <a href={`/s/${generatedUrl}`} target="_blank" rel="noreferrer">
                            Open <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* --- STATS SECTION --- */}
        {session && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#111111] border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-md bg-neutral-950 text-neutral-300">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Links</p>
                  <h3 className="text-2xl font-bold mt-1">{recentLinks.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111111] border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-md bg-neutral-950 text-neutral-300">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Clicks</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {recentLinks.reduce((acc, curr) => acc + (curr.totalClicks || 0), 0).toLocaleString()}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111111] border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-md bg-neutral-950 text-neutral-300">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">Active Links</p>
                  <h3 className="text-2xl font-bold mt-1">{activeCount}</h3>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* --- RECENT LINKS TABLE --- */}
        {session && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Recent Links</h2>
            </div>
            <Card className="overflow-hidden bg-[#111111] border-neutral-800 shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-950">
                    <TableRow className="border-neutral-800">
                      <TableHead className="w-[300px]">Original URL</TableHead>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {recentLinks.map((link) => (
                        <motion.tr 
                          key={link.shortId}
                          initial={{ opacity: 0, bg: "transparent" }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="border-neutral-800 group hover:bg-neutral-900 transition-colors cursor-pointer"
                          onClick={() => openAnalytics(link)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2 max-w-[300px]">
                              <img src={`https://www.google.com/s2/favicons?domain=${link.redirectURL}&sz=32`} className="w-4 h-4 rounded-sm opacity-70" alt="" />
                              <span className="truncate text-neutral-300">
                                {link.redirectURL}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white font-medium">
                              {link.shortId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-neutral-400">
                              <BarChart3 className="w-4 h-4" /> {(link.totalClicks || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-neutral-400 text-sm">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCopy(link.shortId); }} className="h-8 w-8 text-neutral-500 hover:text-white">
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => handleDelete(link.shortId, e)} className="h-8 w-8 text-neutral-500 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {recentLinks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                          No recent links found. Create one above!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </section>
        )}
      </main>

      {/* --- ANALYTICS DIALOG --- */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="bg-[#111111] border-neutral-800 text-white sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5 text-neutral-400" /> Link Analytics
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              Performance metrics for <span className="text-white font-mono">{selectedLink?.shortId}</span>
            </DialogDescription>
          </DialogHeader>

          {analyticsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
          ) : analyticsData ? (
            <div className="space-y-6 pt-4">
              
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-col justify-center">
                  <span className="text-neutral-500 text-sm">Total Clicks</span>
                  <span className="text-3xl font-bold mt-1">{analyticsData.totalClicks.toLocaleString()}</span>
                </div>
                
                {analyticsData.qrCodeImage && (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex items-center justify-between gap-4">
                    <img src={analyticsData.qrCodeImage} alt="QR" className="w-16 h-16 rounded bg-white p-1" />
                    <Button variant="outline" size="sm" onClick={handleDownloadQr} className="bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-white">
                      <Download className="w-4 h-4 mr-2" /> QR
                    </Button>
                  </div>
                )}
              </div>

              {/* Referrers */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-400">Top Referrers (from detailed logs)</h4>
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                   {/* compute basic stats from clickLog */}
                   {(() => {
                     const logs = analyticsData.clickLog || [];
                     if (logs.length === 0) return <p className="text-sm text-neutral-600 py-2">No detailed log data available yet.</p>;
                     
                     const refs = logs.reduce((acc, l) => {
                       const r = l.referrer || "Direct / Unknown";
                       acc[r] = (acc[r] || 0) + 1;
                       return acc;
                     }, {});
                     
                     const sorted = Object.entries(refs).sort((a,b) => b[1] - a[1]).slice(0, 5);
                     
                     return (
                       <ul className="space-y-2">
                         {sorted.map(([ref, count], i) => (
                           <li key={i} className="flex justify-between items-center text-sm">
                             <span className="text-neutral-300 truncate max-w-[200px]">{ref}</span>
                             <Badge variant="outline" className="bg-neutral-900 border-neutral-700">{count}</Badge>
                           </li>
                         ))}
                       </ul>
                     );
                   })()}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <div className="text-xs text-neutral-500">
                  Created: {new Date(analyticsData.createdAt).toLocaleDateString()}
                </div>
                {analyticsData.expiresAt && (
                  <div className="text-xs text-amber-500">
                    Expires: {new Date(analyticsData.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">Failed to load data</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

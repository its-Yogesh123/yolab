import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link as LinkIcon, Sparkles, Copy, ExternalLink, QrCode, 
  Trash2, Moon, Sun, Settings2, BarChart3, Activity, 
  Globe, Loader2, Check
} from "lucide-react";

// Assuming standard shadcn/ui paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// --- MOCK DATA ---
const STATS = [
  { title: "Total Links", value: "1,284", icon: Globe, trend: "+12% this month" },
  { title: "Total Clicks", value: "84.2k", icon: BarChart3, trend: "+24% this month" },
  { title: "Active Links", value: "1,102", icon: Activity, trend: "Stable" },
];

const INITIAL_LINKS = [
  { id: 1, original: "https://github.com/shadcn-ui/ui", short: "yo.sh/shdcn", clicks: 1204, date: "May 2, 2026" },
  { id: 2, original: "https://react.dev/reference/react", short: "yo.sh/rctref", clicks: 843, date: "May 1, 2026" },
  { id: 3, original: "https://tailwindcss.com/docs/flex-direction", short: "yo.sh/twflex", clicks: 320, date: "Apr 28, 2026" },
];

export default function ShortUrlService() {
  // State
  const [darkMode, setDarkMode] = useState(true);
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState(INITIAL_LINKS);

  // Toggle Dark Mode (attaches class to HTML root)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // URL Validation Regex
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Mock API Call
  const handleShorten = async (e) => {
    e.preventDefault();
    
    if (!longUrl) {
      toast.error("Please enter a URL to shorten.");
      return;
    }
    if (!isValidUrl(longUrl)) {
      toast.error("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    setLoading(true);
    setGeneratedUrl(null);

    // Simulate network request
    setTimeout(() => {
      const short = alias ? `yo.sh/${alias.replace(/\s+/g, '-').toLowerCase()}` : `yo.sh/${Math.random().toString(36).substring(2, 7)}`;
      setGeneratedUrl(short);
      
      // Add to recent links
      setRecentLinks(prev => [
        { id: Date.now(), original: longUrl, short, clicks: 0, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        ...prev.slice(0, 4) // Keep last 5
      ]);
      
      setLoading(false);
      toast.success("URL shortened successfully!");
      setLongUrl("");
      setAlias("");
    }, 1200);
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(`https://${url}`);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id) => {
    setRecentLinks(prev => prev.filter(link => link.id !== id));
    toast.info("Link deleted.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] transition-colors duration-300 font-sans selection:bg-neutral-700">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-200 p-1.5 rounded-md text-neutral-950">
              <LinkIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Yo<span className="text-neutral-400">Short</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-neutral-400">
              <a href="#" className="hover:text-white transition-colors">Dashboard</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl relative z-10"
          >
            <Card className="relative bg-[#111111] border-neutral-800 shadow-xl rounded-md">
              <CardContent className="p-6">
                <form onSubmit={handleShorten} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <Input 
                        placeholder="Paste your long URL here... (https://...)" 
                        className="pl-10 h-12 text-base rounded-xl"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="h-12 px-8 rounded-md bg-neutral-200 hover:bg-white text-neutral-950 font-semibold transition-all"
                      disabled={loading}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0a0a0a] rounded-md border border-neutral-800">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400 text-left block">Custom Alias (Optional)</label>
                            <div className="flex shadow-sm rounded-md">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-700 bg-neutral-900 text-neutral-400 sm:text-sm">
                                yo.sh/
                              </span>
                              <Input 
                                placeholder="my-campaign" 
                                className="rounded-l-none focus-visible:ring-neutral-500"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400 text-left block">Expiry Date (Optional)</label>
                            <Input type="date" disabled={loading} className="focus-visible:ring-neutral-500" />
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
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2 bg-[#111111] rounded-md shadow-sm border border-neutral-800">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-300 font-medium">Ready to share!</p>
                          <a href={`https://${generatedUrl}`} target="_blank" rel="noreferrer" className="text-lg font-bold text-white truncate block hover:underline">
                            {generatedUrl}
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

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className="bg-[#111111]">
                                <QrCode className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Generate QR Code</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button variant="default" className="bg-neutral-200 hover:bg-white text-neutral-950 w-full sm:w-auto gap-2" asChild>
                          <a href={`https://${generatedUrl}`} target="_blank" rel="noreferrer">
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat, idx) => (
            <Card key={idx} className="bg-[#111111] border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 rounded-md bg-neutral-950 text-neutral-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* --- RECENT LINKS TABLE --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Links</h2>
            <Button variant="outline" size="sm">View All</Button>
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
                        key={link.id}
                        initial={{ opacity: 0, bg: "transparent" }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-neutral-800 group hover:bg-neutral-900 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2 max-w-[300px]">
                            <img src={`https://www.google.com/s2/favicons?domain=${link.original}&sz=32`} className="w-4 h-4 rounded-sm opacity-70" alt="" />
                            <a href={link.original} target="_blank" rel="noreferrer" className="truncate hover:text-white transition-colors">
                              {link.original}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href={`https://${link.short}`} target="_blank" rel="noreferrer" className="text-white font-medium hover:underline">
                            {link.short}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-neutral-400">
                            <BarChart3 className="w-4 h-4" /> {link.clicks.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-400 text-sm">
                          {link.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(link.short)} className="h-8 w-8 text-neutral-500 hover:text-white">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="h-8 w-8 text-neutral-500 hover:text-red-500">
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
      </main>

    </div>
  );
}

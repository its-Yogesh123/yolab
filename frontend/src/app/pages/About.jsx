import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Users,
  Zap,
  Target,
  Rocket,
  Link as LinkIcon,
  QrCode,
  Image as ImageIcon,
  Activity,
  MessageSquarePlus,
  X,
  Loader2,
} from "lucide-react";
import Footer from "@/shared/Footer";
import { useSession } from "@/context/sessions";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Static data that doesn't change ─────────────────────────────────────────

const timeline = [
  {
    year: "2025",
    title: "The Idea",
    description: "yolab was born out of a simple idea — make powerful developer tools accessible to everyone.",
  },
  {
    year: "2026",
    title: "First Launch",
    description: "Launched our MVP with URL shortener & QR code generator, and started growing our community.",
  },
];

const team = [
  {
    name: "Yogesh Kumar",
    role: "Founder & CEO",
    bio: "Final Year NIT Kurukshetra undergraduate in Computer Engineering",
    image: "https://github.com/its-Yogesh123.png",
  },
];

// ── Helper: format big numbers ───────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M+";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K+";
  return n.toLocaleString();
}

// ── Feedback Modal ───────────────────────────────────────────────────────────
function FeedbackModal({ onClose, onSubmitted }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const MAX = 130;
  const remaining = MAX - text.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      toast.success("Thanks for your feedback! 🎉");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Share your feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Tell us what you think about yolab. Your words inspire us! ✨
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              className="w-full min-h-[110px] resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              placeholder="yolab makes my workflow so much faster..."
              value={text}
              maxLength={MAX}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <span
              className={`absolute bottom-2 right-3 text-xs font-mono tabular-nums ${
                remaining <= 15 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {remaining}
            </span>
          </div>

          <Button
            type="submit"
            disabled={submitting || !text.trim()}
            className="w-full gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquarePlus className="h-4 w-4" />
            )}
            {submitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  const [publicStats, setPublicStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch public analytics stats
  useEffect(() => {
    fetch(`${API}/api/admin/analytics/public`)
      .then((r) => r.json())
      .then((d) => setPublicStats(d))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch feedback (and refresh)
  const fetchFeedbacks = () => {
    setFeedbackLoading(true);
    fetch(`${API}/api/feedback`)
      .then((r) => r.json())
      .then((d) => setFeedbacks(d.feedbacks || []))
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Dynamic stats cards
  const totalActivities = statsLoading
    ? null
    : (publicStats?.totalQrCodes ?? 0)
    + (publicStats?.totalShortUrls ?? 0)
    + (publicStats?.totalImagesProcessed ?? 0);

  const stats = [
    {
      id: 1,
      name: "Registered Users",
      value: statsLoading ? null : fmt(publicStats?.totalUsers ?? 0),
      icon: Users,
    },
    {
      id: 2,
      name: "Short URLs Created",
      value: statsLoading ? null : fmt(publicStats?.totalShortUrls ?? 0),
      icon: LinkIcon,
    },
    {
      id: 3,
      name: "QR Codes Generated",
      value: statsLoading ? null : fmt(publicStats?.totalQrCodes ?? 0),
      icon: QrCode,
    },
    {
      id: 4,
      name: "Images Processed",
      value: statsLoading ? null : fmt(publicStats?.totalImagesProcessed ?? 0),
      icon: ImageIcon,
    },
    {
      id: 5,
      name: "Uptime",
      value: "99.9%",
      icon: Zap,
    },
  ];

  // Prepare chart data from daily history
  const chartData = publicStats?.dailyHistory?.map((day) => {
    const qr = day.serviceUsage?.qrGenerator ?? 0;
    const url = day.serviceUsage?.shortUrl ?? 0;
    const img = day.serviceUsage?.imageProcessing ?? 0;
    return {
      date: day.date.slice(5), // Keep only MM-DD for x-axis
      totalActivity: qr + url + img,
      traffic: day.activeUsers ?? 0,
    };
  }) || [];


  const handleFeedbackClick = () => {
    if (!session) {
      toast.info("Please log in to leave feedback.");
      navigate("/auth/login");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-24">

        {/* ── Hero ── */}
        <section className="text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full">
            About yolab
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Empowering the next generation <br className="hidden md:block" />
            of digital creators.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            We are a team of passionate engineers, designers, and problem-solvers.
            At yolab, we believe in breaking down barriers to technology and
            providing seamless, high-performance tools for everyone.
          </p>
        </section>

        {/* ── Real Stats Section ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isViolet = stat.color === "violet";
            return (
              <Card
                key={stat.id}
                className={`border-none shadow-md ${
                  isViolet
                    ? "bg-violet-950/30 ring-1 ring-violet-700/40"
                    : "bg-secondary/20"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle
                    className={`text-sm font-medium ${
                      isViolet ? "text-violet-300" : "text-muted-foreground"
                    }`}
                  >
                    {stat.name}
                  </CardTitle>
                  <Icon
                    className={`h-5 w-5 ${
                      isViolet ? "text-violet-400" : "text-primary"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  {stat.value === null ? (
                    <div className="h-9 w-20 rounded-md bg-secondary/40 animate-pulse" />
                  ) : (
                    <div
                      className={`text-3xl font-bold ${
                        isViolet ? "text-violet-200" : ""
                      }`}
                    >
                      {stat.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* ── Total Activities & Traffic Chart ── */}
        <section className="bg-secondary/10 border border-border/50 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle violet glow in background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
            
            {/* Left: Distinct Total Activities Stat */}
            <div className="w-full lg:w-1/3 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-semibold border border-violet-500/20">
                <Activity className="w-4 h-4" /> Platform Scale
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
                {totalActivities === null ? (
                  <div className="h-12 w-32 bg-secondary/40 rounded-lg animate-pulse" />
                ) : (
                  totalActivities.toLocaleString()
                )}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Total operations processed across URL shortener, QR generator, and Image processing services since launch.
              </p>
            </div>

            {/* Right: Day-wise Traffic & Activity Chart */}
            <div className="w-full lg:w-2/3 h-64 sm:h-80 bg-background/50 rounded-xl p-4 border border-border/40">
              {statsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Not enough historical data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => value > 999 ? (value/1000).toFixed(1)+'k' : value}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', fontSize: '14px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      name="Total Activities" 
                      dataKey="totalActivity" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#8b5cf6' }} 
                    />
                    <Line 
                      type="monotone" 
                      name="Active Users (Traffic)" 
                      dataKey="traffic" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        </section>


        {/* ── Goal & Timeline ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Goal</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our mission is to simplify the complex. We are building an ecosystem
              where performance meets exceptional user experience. Whether you are a
              solo developer or a large enterprise, yolab is designed to scale with
              you, ensuring you spend less time configuring and more time creating.
            </p>
            <div className="flex items-center gap-3 mt-4 text-primary font-semibold">
              <Rocket className="h-5 w-5" />
              <span>Innovating everyday.</span>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Our Journey</h2>
            <div className="space-y-6 border-l-2 border-border pl-6 ml-3">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  <span className="absolute -left-[35px] flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {item.year} <Badge variant="outline">{item.title}</Badge>
                  </h3>
                  <p className="text-muted-foreground mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Meet the Founders</h2>
            <p className="text-muted-foreground">The minds behind yolab.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 max-w-md mx-auto place-items-center">
            {team.map((member, idx) => (
              <Card
                key={idx}
                className="w-full flex flex-col items-center text-center p-6 border-border shadow-sm"
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0 mb-2">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-muted-foreground">
                  {member.bio}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Feedback Section ── */}
        <section className="space-y-10 overflow-hidden py-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Loved by Users Worldwide</h2>
            <p className="text-muted-foreground">
              {feedbacks.length > 0
                ? "Real words from real users."
                : "Be the first to share your experience!"}
            </p>
            <Button
              onClick={handleFeedbackClick}
              className="gap-2 rounded-full px-6"
              size="sm"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {session ? "Add Feedback" : "Login to Add Feedback"}
            </Button>
          </div>

          {/* Marquee — only when there's feedback */}
          {feedbackLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No feedback yet — yours could be the first! 🚀
            </div>
          ) : (
            <div className="relative flex w-full overflow-hidden bg-background">
              <div className="flex animate-marquee gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
                {[...feedbacks, ...feedbacks].map((review, i) => (
                  <Card
                    key={i}
                    className="w-[350px] shrink-0 border shadow-sm backdrop-blur-sm bg-card border-border"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{review.userName}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-wrap">
                        "{review.text}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
      <Footer />

      {/* Feedback Modal */}
      {showModal && (
        <FeedbackModal
          onClose={() => setShowModal(false)}
          onSubmitted={fetchFeedbacks}
        />
      )}
    </div>
  );
}

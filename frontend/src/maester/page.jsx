import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Upload, MessageSquare, Send, Star,
  Trash2, FileText, Loader2, Crown, ArrowRight,
  ChevronDown, X, CheckCircle2, AlertTriangle,
  Bot, User, Paperclip, RotateCcw, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/context/sessions";
import { useNavigate } from "react-router-dom";
import Footer from "@/shared/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const PYTHON_API = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8001";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Maester-specific top navigation */
function MaesterNav({ session }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-200 p-1.5 rounded-md text-neutral-950">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Maester<span className="text-neutral-400 font-normal text-base ml-1">· PDF Chat</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <Badge className="hidden sm:flex bg-neutral-800 text-neutral-300 border-neutral-700 text-xs">
              {session.name?.split(" ")[0] || "Account"}
            </Badge>
          ) : (
            <Button
              size="sm"
              className="bg-neutral-200 hover:bg-white text-neutral-900 text-xs gap-1.5"
              onClick={() => navigate("/auth/login")}
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-neutral-400 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-neutral-800 bg-[#080808]"
          >
            <div className="px-4 py-4 flex flex-col gap-4 text-sm text-neutral-400">
              <button onClick={() => { navigate("/"); setMenuOpen(false); }} className="text-left hover:text-white">Home</button>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-white">How it works</a>
              <a href="/pricing" onClick={() => setMenuOpen(false)} className="hover:text-white">Pricing</a>
              {!session && (
                <Button
                  size="sm"
                  className="bg-neutral-200 hover:bg-white text-neutral-900 w-full"
                  onClick={() => navigate("/auth/login")}
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/** Upload zone */
function UploadDropzone({ onFileSelect, uploading, uploadedDoc }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") onFileSelect(file);
    else toast.error("Please drop a valid PDF file.");
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && !uploadedDoc && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none
        ${dragging ? "border-neutral-400 bg-neutral-800/30" : "border-neutral-700 bg-neutral-900/40 hover:border-neutral-500 hover:bg-neutral-900/60"}
        ${uploadedDoc ? "cursor-default" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-neutral-400 animate-spin mb-3" />
            <p className="text-sm text-neutral-400 font-medium">Processing PDF…</p>
            <p className="text-xs text-neutral-600 mt-1">Extracting text and indexing chunks</p>
          </>
        ) : uploadedDoc ? (
          <>
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-neutral-200" />
            </div>
            <p className="text-sm font-semibold text-neutral-200">{uploadedDoc.name}</p>
            <p className="text-xs text-neutral-500 mt-1">{uploadedDoc.pages} pages · {uploadedDoc.chunks} chunks indexed</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-neutral-800/70 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-300">Drop your PDF here</p>
            <p className="text-xs text-neutral-500 mt-1">or click to browse — max 10 MB</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-neutral-800 text-neutral-400 border-neutral-700 text-xs">Text-based PDF</Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Feedback star widget (1–5 stars) */
function FeedbackWidget({ messageId, onRate }) {
  const [hovered, setHovered] = useState(0);
  const [rated, setRated] = useState(0);

  const handleRate = (val) => {
    if (rated) return;
    setRated(val);
    onRate(messageId, val);
    toast.success("Thanks for your feedback!");
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-neutral-600 mr-1">Rate:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          disabled={!!rated}
          onMouseEnter={() => !rated && setHovered(n)}
          onMouseLeave={() => !rated && setHovered(0)}
          onClick={() => handleRate(n)}
          className={`transition-transform ${!rated ? "hover:scale-125" : ""}`}
          aria-label={`Rate ${n} stars`}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              n <= (hovered || rated)
                ? rated
                  ? "fill-neutral-300 text-neutral-300"
                  : "fill-neutral-200 text-neutral-200"
                : "text-neutral-700"
            }`}
          />
        </button>
      ))}
      {rated > 0 && <span className="text-xs text-neutral-600 ml-1">Saved</span>}
    </div>
  );
}

/** Single chat message bubble */
function ChatMessage({ msg, onRate }) {
  const isBot = msg.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isBot ? "bg-neutral-800 text-neutral-300" : "bg-neutral-200 text-neutral-900"}`}
      >
        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isBot ? "" : "items-end flex flex-col"}`}>
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
            ${isBot
              ? "bg-[#141414] border border-neutral-800 text-neutral-200"
              : "bg-neutral-200 text-neutral-900"
            }`}
        >
          {msg.content}
        </div>

        {/* Context badge + feedback */}
        {isBot && (
          <div className="mt-1 space-y-1">
            {msg.sources?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {msg.sources.map((s, i) => (
                  <Badge key={i} className="text-[10px] bg-neutral-900 border-neutral-700 text-neutral-500">
                    <FileText className="w-2.5 h-2.5 mr-1" />pg {s.page}
                  </Badge>
                ))}
              </div>
            )}
            {!msg.isStreaming && (
              <FeedbackWidget messageId={msg.id} onRate={onRate} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Chat panel */
function ChatPanel({ uploadedDoc, session, navigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    if (!session) { navigate("/auth/login"); return; }

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    const botMsgId = `b-${Date.now()}`;
    const botMsg = {
      id: botMsgId,
      role: "assistant",
      content: "",
      sources: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${PYTHON_API}/query`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: uploadedDoc?.docId,
          query: userMsg.content,
          sessionId: session?._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Query failed");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: data.answer, sources: data.sources || [], isStreaming: false }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, content: "⚠️ Failed to get a response. Please try again.", isStreaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleRate = async (messageId, rating) => {
    try {
      await fetch(`${API}/api/maester/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          docId: uploadedDoc?.docId,
          rating,
          sessionId: session?._id,
        }),
      });
    } catch {
      // silent
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    toast.info("Chat cleared.");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-300">Chat</span>
          {uploadedDoc && (
            <Badge className="text-[10px] bg-neutral-800 border-neutral-700 text-neutral-400 ml-1">
              {uploadedDoc.name}
            </Badge>
          )}
        </div>
        <button
          onClick={clearChat}
          className="text-neutral-600 hover:text-neutral-300 transition-colors"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Bot className="w-7 h-7 text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              {uploadedDoc
                ? "Your PDF is ready. Ask me anything about it!"
                : "Upload a PDF first, then start chatting."}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} onRate={handleRate} />
          ))
        )}
        {/* Streaming indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="bg-[#141414] border border-neutral-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-3 bg-[#0d0d0d]">
        {!session ? (
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <p className="text-xs text-neutral-500">Sign in to start chatting</p>
            <Button
              size="sm"
              className="bg-neutral-200 hover:bg-white text-neutral-900 text-xs gap-1.5"
              onClick={() => navigate("/auth/login")}
            >
              Sign In <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ) : !uploadedDoc ? (
          <div className="px-2 py-1 text-xs text-neutral-600 flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5" /> Upload a PDF to unlock the chat
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your PDF…"
              disabled={loading}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-neutral-200 hover:bg-white text-neutral-900 px-3 rounded-lg shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/** How it works section */
function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Upload PDF",
      desc: "Drop any text-based PDF. Maester extracts and indexes it instantly.",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Ask Questions",
      desc: "Chat naturally. Maester retrieves the most relevant passages and generates precise answers.",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Rate Responses",
      desc: "Give a quick star rating after each answer to help improve accuracy over time.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-t border-neutral-800">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <p className="text-neutral-500 text-sm mt-2">Three steps to unlock your documents</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6 space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              {s.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 font-mono">0{i + 1}</span>
              <h3 className="font-semibold text-neutral-200">{s.title}</h3>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function MaesterPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    document.title = "Maester — RAG PDF Chatbot | YoLab";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "Upload any PDF and chat with it using Maester, YoLab's RAG-powered document AI. Ask questions, get cited answers instantly."
      );
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch(`${API}/api/subscription/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSubscription(d))
      .catch(() => {});
  }, [session]);

  const handleFileSelect = async (file) => {
    if (!session) { navigate("/auth/login"); return; }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10 MB.");
      return;
    }
    setUploading(true);
    setUploadedDoc(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API}/api/maester/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed");

      setUploadedDoc({
        docId: data.docId,
        name: file.name,
        pages: data.pages ?? "?",
        chunks: data.chunks ?? "?",
      });
      toast.success("PDF indexed successfully!");
    } catch (err) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isPro = subscription?.plan === "pro";

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans selection:bg-neutral-700 flex flex-col">
      {/* Own navigation */}
      <MaesterNav session={session} />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        {/* ── Hero ── */}
        <section className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
              RAG · Text-based PDF · Powered by LLM
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Chat with your<br />
              <span className="text-neutral-400">documents.</span>
            </h1>
            <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto">
              Upload any PDF and ask Maester anything about it. Precise, cited answers — instantly.
            </p>
          </motion.div>

          {/* Plan badge */}
          {session && subscription && (
            <div className="flex justify-center">
              <Badge
                className={`text-xs gap-1 ${
                  isPro
                    ? "bg-neutral-200 text-neutral-900"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                {isPro && <Crown className="w-3 h-3" />}
                {subscription.planLabel || subscription.plan} plan
              </Badge>
            </div>
          )}
        </section>

        {/* ── Main two-column layout ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: "580px" }}>
          {/* LEFT: Upload + doc info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <UploadDropzone
              onFileSelect={handleFileSelect}
              uploading={uploading}
              uploadedDoc={uploadedDoc}
            />

            {/* Change document */}
            {uploadedDoc && !uploading && (
              <button
                onClick={() => setUploadedDoc(null)}
                className="text-xs text-neutral-600 hover:text-neutral-400 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Change document
              </button>
            )}

            {/* Tips card */}
            <div className="bg-[#0e0e0e] border border-neutral-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tips</p>
              <ul className="space-y-2">
                {[
                  "Ask specific questions for better answers",
                  "Maester cites the page source for each response",
                  "Rate answers to improve future quality",
                  "Only text-based PDFs are supported for now",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                    <span className="text-neutral-700 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade CTA for free users */}
            {session && !isPro && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-300">Free plan limits apply</p>
                    <p className="text-xs text-neutral-600 mt-0.5">Upgrade to Pro for unlimited PDFs and queries.</p>
                  </div>
                </div>
                <a href="/pricing">
                  <Button size="sm" className="w-full bg-neutral-200 hover:bg-white text-neutral-900 text-xs gap-1.5">
                    Upgrade to Pro <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* RIGHT: Chat panel */}
          <div className="lg:col-span-3 h-[580px] lg:h-auto">
            <ChatPanel
              uploadedDoc={uploadedDoc}
              session={session}
              navigate={navigate}
            />
          </div>
        </section>

        {/* ── How it works ── */}
        <HowItWorks />
      </main>

      {/* Common footer */}
      <Footer />
    </div>
  );
}

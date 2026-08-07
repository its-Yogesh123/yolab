import { useState, useEffect } from "react";
import Navbar from "../shared/Navigation.jsx";
import Footer from "../shared/Footer.jsx";
import { ArrowRight, User, Mail, Lock, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = "Create Account | YoLab";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { window.location.href = "/"; }, 1200);
      } else {
        setError(data.message || data.error || "Registration failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#f5f5f5] mb-2">
              Create your account
            </h1>
            <p className="text-[#a3a3a3] text-sm">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-md border border-[#262626] bg-[#111111] p-8 shadow-xl">

            {/* Success state */}
            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#404040] flex items-center justify-center mx-auto">
                  <span className="text-xl">✓</span>
                </div>
                <p className="text-[#f5f5f5] font-semibold">Account created!</p>
                <p className="text-sm text-[#a3a3a3]">Redirecting you to your dashboard…</p>
              </div>
            ) : (
              <>
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-3 h-11 rounded-md border border-[#333333] bg-[#0f0f0f] text-[#f5f5f5] text-sm font-medium hover:bg-[#1a1a1a] hover:border-[#525252] transition-all duration-200 disabled:opacity-50 mb-6"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-[#262626]" />
                  <span className="text-xs text-[#525252] font-medium uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-[#262626]" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full h-11 pl-10 pr-4 rounded-md bg-[#0a0a0a] border border-[#333333] text-[#f5f5f5] text-sm placeholder:text-[#525252] focus:outline-none focus:border-[#737373] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-11 pl-10 pr-4 rounded-md bg-[#0a0a0a] border border-[#333333] text-[#f5f5f5] text-sm placeholder:text-[#525252] focus:outline-none focus:border-[#737373] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full h-11 pl-10 pr-4 rounded-md bg-[#0a0a0a] border border-[#333333] text-[#f5f5f5] text-sm placeholder:text-[#525252] focus:outline-none focus:border-[#737373] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#a3a3a3] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full h-11 pl-10 pr-4 rounded-md bg-[#0a0a0a] border border-[#333333] text-[#f5f5f5] text-sm placeholder:text-[#525252] focus:outline-none focus:border-[#737373] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-md bg-[#e5e5e5] hover:bg-white text-[#050505] text-sm font-semibold transition-all duration-200 disabled:opacity-50 mt-2"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                {/* Footer link */}
                <p className="text-center text-sm text-[#737373] mt-6">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-[#d4d4d4] hover:text-white font-medium transition-colors">
                    Sign in
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

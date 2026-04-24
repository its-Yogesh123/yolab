"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log(res);
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/about");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-neutral-800/90 bg-neutral-950/80 backdrop-blur-sm p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white-400 dark:text-green-500">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Welcome back to yoLAB
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="signin-email"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="yolab@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="signin-password"
              className="mb-1.5 block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="Password"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            or
          </span>
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-white py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-60"
        >
          <FcGoogle className="h-5 w-5" aria-hidden />
          Login with Google
        </button>
      </div>
    </div>
  );
}

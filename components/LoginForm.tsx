"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4"
    >
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-stone-500 mt-1">
          Log in to your Acme Leather account.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-stone-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400/50"
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-stone-400">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400/50"
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm disabled:opacity-40"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <div className="text-xs text-stone-500 border-t border-white/10 pt-3">
        New here?{" "}
        <Link href="/signup" className="text-amber-400 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}

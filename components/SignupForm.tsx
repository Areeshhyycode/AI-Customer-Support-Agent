"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");

      // auto sign-in after successful registration
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (login?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-stone-500 mt-1">
          Join Acme Leather for faster checkout and order tracking.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-stone-400">Full name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Areesha Khan"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400/50"
          disabled={loading}
        />
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400/50"
          disabled={loading}
          autoComplete="new-password"
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
        {loading ? "Creating account…" : "Sign up"}
      </button>

      <div className="text-xs text-stone-500 border-t border-white/10 pt-3">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-400 hover:underline">
          Log in
        </Link>
      </div>
    </form>
  );
}

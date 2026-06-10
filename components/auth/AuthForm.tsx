"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Loader2, LogIn, UserPlus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/backend/supabase";
import { signInWithEmail, signUpWithEmail } from "@/lib/backend/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    try {
      const result = isLogin
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, fullName || undefined);

      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (!isLogin && result.needsConfirmation) {
        setNotice("Account created. Check your email to confirm, then log in.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-8 shadow-cyan">
      <Brain size={30} className="text-cyan-300" />
      <h1 className="mt-5 text-2xl font-semibold text-white">
        {isLogin ? "Log in to ExamIQ" : "Create your ExamIQ account"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {isLogin
          ? "Log in to save your practice attempts, bookmarks and progress."
          : "Sign up to save attempts and bookmarks across devices. Practice stays free."}
      </p>

      {!configured && (
        <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
          Accounts aren&apos;t enabled in this environment yet. You can still practice freely —
          progress just won&apos;t be saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
        {!isLogin && (
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            placeholder="Full name (optional)"
            autoComplete="name"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          placeholder="Email address"
          type="email"
          required
          autoComplete="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          placeholder="Password"
          type="password"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {error && (
          <p className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-4 py-2.5 text-sm text-rose-200">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !configured}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : isLogin ? <LogIn size={15} /> : <UserPlus size={15} />}
          {isLogin ? "Log in" : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-sm text-slate-500">
        {isLogin ? (
          <>
            New to ExamIQ?{" "}
            <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
              Log in
            </Link>
          </>
        )}
        <span className="px-2 text-slate-700">·</span>
        <Link href="/exams/cat" className="font-medium text-slate-400 hover:text-slate-200">
          Continue without an account
        </Link>
      </div>
    </div>
  );
}

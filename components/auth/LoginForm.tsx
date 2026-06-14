"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthInput, AuthMessage } from "./AuthFields";

function toFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (/confirm|verified|verify/.test(normalized)) {
    return "Please verify your email before logging in.";
  }
  if (/invalid login credentials|invalid email or password/.test(normalized)) {
    return "Invalid email or password.";
  }
  return message || "Invalid email or password.";
}

export function LoginForm({ nextPath = "/dashboard", initialError }: { nextPath?: string; initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setIsPending(false);
      setError(toFriendlyAuthError(signInError.message));
      return;
    }

    // Confirm the session cookie is actually persisted before navigating, so we
    // never redirect to the dashboard with no usable session (the original bug).
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setIsPending(false);

    if (!session) {
      setError("We could not establish your session. Please try again.");
      return;
    }

    // Refresh server components so they pick up the new cookie session, then go.
    router.refresh();
    router.push(nextPath || "/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error ? (
        <AuthMessage tone="error">
          {error} {error.toLowerCase().includes("verify") ? <Link href="/verify-email" className="font-bold underline">Email verification help</Link> : null}
        </AuthMessage>
      ) : null}
      <AuthInput id="login-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <AuthInput id="login-password" label="Password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
        <LogIn size={15} aria-hidden /> {isPending ? "Signing in..." : "Log in"}
      </button>
      <Link href="/forgot-password" className="aurora-focus-ring rounded-md text-sm font-semibold text-[color:var(--aurora-primary)]">
        Forgot password?
      </Link>
    </form>
  );
}

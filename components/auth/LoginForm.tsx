"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { signInWithPassword } from "@/lib/supabase/client";
import { AuthInput, AuthMessage } from "./AuthFields";

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

    const result = await signInWithPassword(email, password);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(nextPath || "/dashboard");
    router.refresh();
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

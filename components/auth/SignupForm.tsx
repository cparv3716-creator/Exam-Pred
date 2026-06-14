"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthInput, AuthMessage } from "./AuthFields";

function getCanonicalAuthOrigin() {
  if (window.location.hostname === "statstrive.com" || window.location.hostname === "www.statstrive.com") {
    return "https://statstrive.com";
  }

  return window.location.origin;
}

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${getCanonicalAuthOrigin()}/auth/callback`,
      },
    });

    if (signUpError) {
      setIsPending(false);
      setError(signUpError.message || "Signup failed. Please try again.");
      return;
    }

    // When email confirmation is disabled, signUp returns an active session and
    // the browser client has already written the session cookie. Confirm it
    // before redirecting so we never land on a protected page without a session.
    if (data.session) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsPending(false);

      if (session) {
        router.refresh();
        router.push("/dashboard");
        return;
      }
    }

    setIsPending(false);
    setMessage("Check your email to verify your account");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <AuthInput id="signup-name" label="Full name" type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      <AuthInput id="signup-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <AuthInput id="signup-password" label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
        <UserPlus size={15} aria-hidden /> {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

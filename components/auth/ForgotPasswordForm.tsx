"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/supabase/client";
import { AuthInput, AuthMessage } from "./AuthFields";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const result = await requestPasswordReset(email);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(result.data.message || "Check your email for the password reset link.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <AuthInput id="forgot-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
        <Mail size={15} aria-hidden /> {isPending ? "Sending..." : "Send reset email"}
      </button>
    </form>
  );
}

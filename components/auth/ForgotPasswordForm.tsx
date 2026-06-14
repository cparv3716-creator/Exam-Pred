"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase/auth-rest-client";
import { AuthInput, AuthMessage } from "./AuthFields";

type ResetStep = "email" | "otp" | "password" | "success";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function sendResetCode(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setIsPending(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(data?.message || "If an account exists for that email, a reset code has been sent.");
    setStep("otp");
  }

  async function verifyResetCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });
    setIsPending(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setMessage("Reset code verified. Choose a new password.");
    setStep("password");
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully.");
    setStep("success");
  }

  return (
    <div className="grid gap-4">
      {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

      {step === "email" ? (
        <form onSubmit={sendResetCode} className="grid gap-4">
          <AuthInput id="forgot-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
            <Mail size={15} aria-hidden /> {isPending ? "Sending code..." : "Send reset code"}
          </button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={verifyResetCode} className="grid gap-4">
          <p className="text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
            Enter the code from your email.
          </p>
          <AuthInput id="forgot-otp" label="Reset code" inputMode="numeric" autoComplete="one-time-code" value={token} onChange={(event) => setToken(event.target.value)} required />
          <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
            <KeyRound size={15} aria-hidden /> {isPending ? "Verifying..." : "Verify code"}
          </button>
          <button type="button" disabled={isPending} onClick={() => sendResetCode()} className="aurora-button-secondary aurora-focus-ring w-full text-sm disabled:opacity-60">
            <RotateCcw size={15} aria-hidden /> Resend code
          </button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={updatePassword} className="grid gap-4">
          <AuthInput id="forgot-new-password" label="New password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <AuthInput id="forgot-confirm-password" label="Confirm password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
            <KeyRound size={15} aria-hidden /> {isPending ? "Setting password..." : "Set new password"}
          </button>
        </form>
      ) : null}

      {step === "success" ? (
        <Link href="/login?reset=success" className="aurora-button-primary aurora-focus-ring w-full text-sm">
          Go to login
        </Link>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { storeAuthSession, updateUserPassword } from "@/lib/supabase/client";
import { AuthInput, AuthMessage } from "./AuthFields";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token") ?? undefined;

    if (!accessToken) {
      return;
    }

    storeAuthSession(accessToken, refreshToken).then((result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Reset session confirmed. Choose a new password.");
      window.history.replaceState(null, "", window.location.pathname);
    });
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    const result = await updateUserPassword(password);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(result.data.message);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {message ? <AuthMessage tone="success">{message} <Link href="/login" className="font-bold underline">Go to login</Link></AuthMessage> : null}
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      <AuthInput id="reset-password" label="New password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
      <AuthInput id="reset-password-confirm" label="Confirm password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
      <button type="submit" disabled={isPending} className="aurora-button-primary aurora-focus-ring w-full text-sm disabled:opacity-60">
        <KeyRound size={15} aria-hidden /> {isPending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

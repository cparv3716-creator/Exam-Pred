"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { storeAuthSession } from "@/lib/supabase/client";
import { AuthMessage } from "./AuthFields";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token") ?? undefined;
    const queryError = searchParams.get("error_description") || searchParams.get("error");
    const code = searchParams.get("code");

    if (queryError) {
      setError(queryError);
      return;
    }

    if (accessToken) {
      storeAuthSession(accessToken, refreshToken).then((result) => {
        if (!result.ok) {
          setError(result.error);
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      });
      return;
    }

    if (code) {
      fetch("/api/auth/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(data?.error ?? "Auth callback failed.");
          }
          router.replace("/dashboard");
          router.refresh();
        })
        .catch((callbackError) => setError(callbackError instanceof Error ? callbackError.message : "Auth callback failed."));
      return;
    }

    setError("Missing auth session. Please log in again.");
  }, [router, searchParams]);

  if (error) {
    return <AuthMessage tone="error">{error}</AuthMessage>;
  }

  return <AuthMessage>Completing sign in...</AuthMessage>;
}

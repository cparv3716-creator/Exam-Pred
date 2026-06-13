import type { Metadata } from "next";
import { Suspense } from "react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";

export const metadata: Metadata = {
  title: "Auth callback",
  description: "Completing your Statstrive sign in.",
};

export default function AuthCallbackPage() {
  return (
    <AuroraPageShell>
      <AuthCard title="Completing sign in" description="We are validating your secure Statstrive session.">
        <Suspense fallback={<p className="text-sm" style={{ color: "var(--aurora-text-secondary)" }}>Completing sign in...</p>}>
          <AuthCallbackHandler />
        </Suspense>
      </AuthCard>
    </AuroraPageShell>
  );
}

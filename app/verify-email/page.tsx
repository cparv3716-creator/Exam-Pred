import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your Statstrive account email.",
};

export default function VerifyEmailPage() {
  return (
    <AuroraPageShell>
      <AuthCard
        title="Check your email"
        description="Open the verification link sent by Statstrive, then return here to log in."
        footer={
          <div className="flex items-center justify-between gap-4">
            <Link href="/login" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
              Log in
            </Link>
            <Link href="/forgot-password" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
              Need a reset?
            </Link>
          </div>
        }
      >
        <div className="rounded-xl border p-4 text-sm leading-6" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-text-secondary)" }}>
          <MailCheck size={18} className="mb-3" style={{ color: "var(--aurora-success)" }} />
          If you do not see the email, check spam or sign up again with the same email to request a new verification message.
        </div>
      </AuthCard>
    </AuroraPageShell>
  );
}

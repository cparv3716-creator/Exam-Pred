import type { Metadata } from "next";
import Link from "next/link";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentUser } from "@/lib/backend/auth";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new Statstrive password.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  return (
    <AuroraPageShell>
      <AuthCard
        title="Choose a new password"
        description="Use the reset link from your email, then save a new password for your account."
        footer={
          <Link href="/login" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
            Return to login
          </Link>
        }
      >
        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="rounded-xl border p-4 text-sm leading-6" style={{ borderColor: "var(--aurora-border-soft)", color: "var(--aurora-text-secondary)" }}>
            <p>Your reset link is invalid or expired. Please request a new password reset link.</p>
            <Link href="/forgot-password" className="mt-4 inline-flex font-bold text-[color:var(--aurora-primary)]">
              Request new reset link
            </Link>
          </div>
        )}
      </AuthCard>
    </AuroraPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new Statstrive password.",
};

export default function ResetPasswordPage() {
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
        <ResetPasswordForm />
      </AuthCard>
    </AuroraPageShell>
  );
}

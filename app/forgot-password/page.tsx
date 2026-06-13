import type { Metadata } from "next";
import Link from "next/link";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Statstrive password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuroraPageShell>
      <AuthCard
        title="Reset your password"
        description="Enter your account email and we will send a secure reset code."
        footer={
          <Link href="/login" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
            Back to login
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuroraPageShell>
  );
}

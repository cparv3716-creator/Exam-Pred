import type { Metadata } from "next";
import Link from "next/link";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Statstrive account.",
};

export default function SignupPage() {
  return (
    <AuroraPageShell>
      <AuthCard
        title="Start free with Statstrive"
        description="Create an account for ISI MSQE PEA practice, CAT DILR practice, and the multi-exam roadmap."
        footer={
          <div className="flex items-center justify-between gap-4">
            <span style={{ color: "var(--aurora-text-secondary)" }}>Already have an account?</span>
            <Link href="/login" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
              Log in
            </Link>
          </div>
        }
      >
        <SignupForm />
      </AuthCard>
    </AuroraPageShell>
  );
}

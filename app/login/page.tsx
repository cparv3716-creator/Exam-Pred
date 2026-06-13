import type { Metadata } from "next";
import Link from "next/link";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to Statstrive.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <AuroraPageShell>
      <AuthCard
        title="Log in to Statstrive"
        description="Access your dashboard, saved practice history, and exam preferences."
        footer={
          <div className="flex items-center justify-between gap-4">
            <span style={{ color: "var(--aurora-text-secondary)" }}>New here?</span>
            <Link href="/signup" className="aurora-focus-ring rounded-md font-semibold text-[color:var(--aurora-primary)]">
              Create account
            </Link>
          </div>
        }
      >
        <LoginForm nextPath={params.next ?? "/dashboard"} initialError={params.error} />
      </AuthCard>
    </AuroraPageShell>
  );
}

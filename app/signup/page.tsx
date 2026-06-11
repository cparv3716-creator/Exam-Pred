import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

export const metadata: Metadata = {
  title: "Signup",
  description: "Demo signup placeholder for Statstrive.",
};

export default function SignupPage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg">
        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-16">
          <div
            className="aurora-glass aurora-fade-slide-up relative w-full overflow-hidden p-8"
            style={{ borderRadius: "var(--aurora-radius-xl)", boxShadow: "var(--aurora-shadow-3), var(--aurora-shadow-glass)" }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
            />

            <span
              aria-hidden
              className="relative grid h-11 w-11 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff, var(--aurora-primary-bright) 55%, var(--aurora-primary) 100%)",
                boxShadow: "var(--aurora-glow-md)",
              }}
            >
              <span className="absolute inset-1 rounded-full border border-white/40" />
              <span className="text-sm font-black text-white">S</span>
            </span>

            <h1 className="mt-5 text-2xl font-bold tracking-tight" style={{ color: "var(--aurora-text-primary)" }}>
              Start free with Statstrive
            </h1>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
              Create a demo account and use role switching to preview free, premium and admin access tiers.
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--aurora-text-muted)" }}
                >
                  Full name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  className="aurora-focus-ring mt-1.5 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--aurora-border-strong)",
                    background: "var(--aurora-surface)",
                    color: "var(--aurora-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="login-email"
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--aurora-text-muted)" }}
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="aurora-focus-ring mt-1.5 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--aurora-border-strong)",
                    background: "var(--aurora-surface)",
                    color: "var(--aurora-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--aurora-text-muted)" }}
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="aurora-focus-ring mt-1.5 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--aurora-border-strong)",
                    background: "var(--aurora-surface)",
                    color: "var(--aurora-text-primary)",
                  }}
                />
              </div>
              <Link href="/dashboard" className="aurora-button-primary aurora-focus-ring w-full text-sm">
                <UserPlus size={15} aria-hidden /> Create demo account
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
              <span className="rounded-full p-0.5" style={{ background: "var(--aurora-text-primary)" }}>
                <RoleSwitcher />
              </span>
              <Link
                href="/login"
                className="aurora-focus-ring rounded-md text-sm font-semibold text-[color:var(--aurora-primary)] transition-colors hover:text-[color:var(--aurora-primary-bright)]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AuroraPageShell>
  );
}

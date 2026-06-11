import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, UserPlus } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

export const metadata: Metadata = {
  title: "Signup",
  description: "Demo signup placeholder for Statstrive.",
};

export default function SignupPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-20">
        <div className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-8 shadow-cyan">
          <Sparkles size={30} className="text-cyan-300" />
          <h1 className="mt-5 text-2xl font-semibold text-white">Start free</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Create a mock account for the demo and use role switching to preview access tiers.
          </p>
          <div className="mt-6 grid gap-3">
            <input className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Full name" />
            <input className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Email address" />
            <input className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600" placeholder="Password" type="password" />
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-3 text-sm font-semibold text-white">
              <UserPlus size={15} /> Create demo account
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <RoleSwitcher />
            <Link href="/login" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              Log in
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

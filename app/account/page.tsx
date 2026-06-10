"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { useAuthUser } from "@/lib/backend/use-practice-progress";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, configured, signOut } = useAuthUser();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <PageShell withGrid>
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-20">
        <div className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-8 shadow-cyan">
          <User size={28} className="text-cyan-300" />
          <h1 className="mt-5 text-2xl font-semibold text-white">Account</h1>

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={15} className="animate-spin" /> Loading…
            </div>
          ) : !configured ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Accounts aren&apos;t enabled in this environment yet. You can still practice freely.
            </p>
          ) : !user ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                You&apos;re not logged in. Log in to view your account and saved progress.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400/30"
                >
                  Create account
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-500">Signed in as</p>
              <p className="text-sm font-semibold text-white">{user.email ?? user.id}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400/30"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-5 py-2.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-400/[0.12]"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

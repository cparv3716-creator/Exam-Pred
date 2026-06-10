import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ProgressDashboard } from "@/components/dashboard/ProgressDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ExamIQ practice progress — attempts, accuracy, sections and bookmarks.",
};

export default function DashboardPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Progress</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your practice dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Attempts, accuracy, section breakdown, recent activity and bookmarks — all in one place.
          </p>
        </header>
        <ProgressDashboard />
      </section>
    </PageShell>
  );
}

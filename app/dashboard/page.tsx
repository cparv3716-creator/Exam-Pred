import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CalendarCheck, Download, Flame, Target } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DilrProgressPanel } from "@/components/dashboard/DilrProgressPanel";
import { PremiumSubscriptionsPanel } from "@/components/dashboard/PremiumSubscriptionsPanel";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { exams } from "@/data/exams";
import { heatmap, practicePlan, topicProbability } from "@/data/analytics";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { getCatDashboardStats, getCatFinalRecommendation } from "@/lib/content/cat";
import { getCurrentProfile, getUserExamPreferences, requireUser } from "@/lib/backend/auth";
import { getUserAccessLevel } from "@/lib/backend/access";
import { getUserExamSubscriptions } from "@/lib/backend/payments";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Statstrive AI exam intelligence cockpit.",
};

export const dynamic = "force-dynamic";

/** Command Mode stat tile — existing placeholder values only, no invented stats. */
function StatTile({
  icon: Icon,
  label,
  value,
  detail,
  accent = "var(--aurora-primary)",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) {
  return (
    <div className="aurora-glass aurora-card-hover p-5">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-text-muted)" }}>
          {label}
        </p>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "var(--aurora-background-soft)", color: accent }}
        >
          <Icon size={15} aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: "var(--aurora-text-primary)" }}>
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--aurora-text-secondary)" }}>
        {detail}
      </p>
    </div>
  );
}

/** Calm meter bar (existing placeholder values; instrument styling). */
function MeterBar({ value, accent = "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))" }: { value: number; accent?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--aurora-background-soft)" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: accent }} />
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [profile, accessLevel, preferences, subscriptions] = await Promise.all([
    getCurrentProfile(user),
    getUserAccessLevel(user),
    getUserExamPreferences(user.id),
    getUserExamSubscriptions(user.id).catch(() => []),
  ]);
  const catStats = getCatDashboardStats();
  const catRecommendation = getCatFinalRecommendation();
  const preferredExam = preferences[0];

  return (
    <DashboardShell
      title="AI exam intelligence cockpit"
      subtitle="Your account, practice links, probability signals, weak areas and quick actions in one command center."
      activeHref="/dashboard"
    >
      <div className="aurora-fade-slide-up mb-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="aurora-surface p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-primary)" }}>
            Account
          </p>
          <h2 className="mt-2 text-xl font-extrabold" style={{ color: "var(--aurora-text-primary)" }}>
            {profile?.full_name || user.email || "Statstrive learner"}
          </h2>
          <div className="mt-4 grid gap-3 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            <p>
              Email: <span className="font-semibold" style={{ color: "var(--aurora-text-primary)" }}>{user.email ?? "Not available"}</span>
            </p>
            <p>
              Access: <span className="font-semibold capitalize" style={{ color: "var(--aurora-text-primary)" }}>{accessLevel}</span>
            </p>
            <p>
              Exam preference:{" "}
              <span className="font-semibold" style={{ color: "var(--aurora-text-primary)" }}>
                {preferredExam ? preferredExam.exam_slug.toUpperCase() : "No selected exam yet"}
              </span>
            </p>
          </div>
        </div>
        <div className="aurora-surface p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-cyan)" }}>
            Quick links
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["ISI MSQE PEA Practice", "/exams/isi/msqe/pyqs/pea"],
              ["CAT DILR Practice", "/exams/cat/dilr"],
              ["Exam Directory", "/exams"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="aurora-glass aurora-card-hover aurora-focus-ring p-4 text-sm font-bold">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <PremiumSubscriptionsPanel subscriptions={subscriptions} />

      {/* readiness-style stat row (existing placeholder values) */}
      <div className="aurora-fade-slide-up mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={BookOpen} label="Followed exams" value="4" detail="CAT, JEE, NEET, GATE" />
        <StatTile icon={BrainCircuit} label="Tracked topics" value="426" detail="Across demo catalog" accent="var(--aurora-cyan)" />
        <StatTile icon={Target} label="Top signal" value="86%" detail="Arithmetic cluster" accent="var(--aurora-violet)" />
        <StatTile icon={Download} label="Downloads" value="12" detail="Mock report actions" accent="var(--aurora-success)" />
      </div>

      {/* continue practice (live local DILR progress) */}
      <DilrProgressPanel />

      {/* trend + priorities */}
      <div className="aurora-fade-slide-up mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" style={{ animationDelay: "200ms" }}>
        <AnalyticsChartCard title="Recent PYQ trend movement" subtitle="Synthetic year-wise signal preview" />
        <div className="aurora-surface p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-primary)" }}>
            Recommended topics
          </p>
          <h2 className="mt-1.5 text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            Next practice priorities
          </h2>
          <div className="mt-6 space-y-4">
            {topicProbability.slice(0, 5).map((topic) => (
              <div key={topic.topic}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span style={{ color: "var(--aurora-text-secondary)" }}>{topic.topic}</span>
                  <span className="font-semibold tabular-nums" style={{ color: "#0E7490" }}>
                    {topic.probability}%
                  </span>
                </div>
                <MeterBar value={topic.probability} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAT live pipeline */}
      <div className="aurora-fade-slide-up mt-8 space-y-6" style={{ animationDelay: "280ms" }}>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            CAT intelligence - live pipeline
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Candidate pool stats, final recommendation, expected overlap and coverage risk - loaded from the real local CAT pipeline.
          </p>
        </div>
        <CatStatsGrid stats={catStats} />
        <CatRecommendationCard stats={catStats} papers={catRecommendation.selectedPapers} />
      </div>

      {/* heatmap + weak-area planner */}
      <div className="aurora-fade-slide-up mt-8 grid gap-6 lg:grid-cols-2" style={{ animationDelay: "340ms" }}>
        <div className="aurora-surface p-6">
          <h3 className="text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            Probability heatmap
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Expected topic clusters over the demo timeline.
          </p>
          <div className="mt-6">
            <TopicHeatmap data={heatmap} />
          </div>
        </div>
        <div className="aurora-surface p-6">
          <h3 className="text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            Weak-area planner preview
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Practice recommendations are synthetic placeholders until your attempts are connected.
          </p>
          <div className="mt-6 space-y-3">
            {practicePlan.map((item) => (
              <div
                key={item.topic}
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--aurora-border-soft)", background: "var(--aurora-background-soft)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--aurora-text-primary)" }}>
                    {item.topic}
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: "var(--aurora-text-muted)" }}>
                    {item.recommended} drills
                  </span>
                </div>
                <div className="mt-3">
                  <MeterBar
                    value={item.strength}
                    accent={
                      item.priority === "high"
                        ? "linear-gradient(90deg, var(--aurora-danger), var(--aurora-warning))"
                        : "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* exam cockpit links */}
      <div className="aurora-fade-slide-up mt-8 grid gap-4 lg:grid-cols-3" style={{ animationDelay: "400ms" }}>
        {exams.slice(0, 3).map((exam) => (
          <Link
            key={exam.slug}
            href={`/dashboard/exams/${exam.slug}/analytics`}
            className="aurora-glass aurora-card-hover aurora-focus-ring group p-5"
          >
            <Flame size={18} aria-hidden style={{ color: "var(--aurora-cyan)" }} />
            <h3 className="mt-4 text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>
              {exam.name} cockpit
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
              {exam.topTopics[0]?.name} is the leading synthetic signal.
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
              style={{ color: "var(--aurora-primary)" }}
            >
              Open <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      {/* plan lock + quick actions */}
      <div className="aurora-fade-slide-up mt-8 grid gap-4 md:grid-cols-2" style={{ animationDelay: "460ms" }}>
        {accessLevel === "premium" || accessLevel === "admin" ? (
          <Link
            href="/dashboard/practice-planner"
            className="aurora-glass aurora-card-hover aurora-focus-ring p-5"
          >
            <Target size={18} aria-hidden style={{ color: "var(--aurora-violet)" }} />
            <h3 className="mt-4 text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>
              Premium practice planner
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
              Build adaptive drills around weak areas and current exam priorities.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--aurora-primary)" }}>
              Open planner <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        ) : (
          <PlanLockCard compact title="Premium practice planner" description="Free users see the preview. Premium unlocks adaptive weak-area planning." />
        )}
        <Link href="/dashboard/downloads" className="aurora-glass aurora-card-hover aurora-focus-ring p-5">
          <CalendarCheck size={18} aria-hidden style={{ color: "var(--aurora-success)" }} />
          <h3 className="mt-4 text-base font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            Quick actions
          </h3>
          <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Review downloads, open exam PYQs, and inspect premium modules.
          </p>
        </Link>
      </div>
    </DashboardShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CalendarCheck, Download, Flame, Play, Target } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CommandPulse } from "@/components/dashboard/CommandPulse";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { exams } from "@/data/exams";
import { heatmap, practicePlan, topicProbability } from "@/data/analytics";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { getCatDashboardStats, getCatFinalRecommendation } from "@/lib/content/cat";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Statstrive AI exam intelligence cockpit.",
};

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

export default function DashboardPage() {
  const catStats = getCatDashboardStats();
  const catRecommendation = getCatFinalRecommendation();

  return (
    <DashboardShell
      title="AI exam intelligence cockpit"
      subtitle="Your followed exams, probability signals, weak areas and quick actions in one command center. Preview data until your attempts are connected."
      activeHref="/dashboard"
    >
      {/* readiness-style stat row (existing placeholder values) */}
      <div className="aurora-fade-slide-up grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={BookOpen} label="Followed exams" value="4" detail="CAT, JEE, NEET, GATE" />
        <StatTile icon={BrainCircuit} label="Tracked topics" value="426" detail="Across demo catalog" accent="var(--aurora-cyan)" />
        <StatTile icon={Target} label="Top signal" value="86%" detail="Arithmetic cluster" accent="var(--aurora-violet)" />
        <StatTile icon={Download} label="Downloads" value="12" detail="Mock report actions" accent="var(--aurora-success)" />
      </div>

      {/* continue practice strip */}
      <div
        className="aurora-glass aurora-fade-slide-up relative mt-6 flex flex-col gap-4 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-md)", animationDelay: "120ms" }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
        />
        <span
          aria-hidden
          className="aurora-scan-x absolute top-0 h-[3px] w-[18%]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)" }}
        />
        <CommandPulse size={120} className="absolute -right-6 -top-3 hidden opacity-60 md:block" />
        <div className="relative">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-cyan)" }}>
            Continue practice
          </p>
          <h2 className="mt-1 text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            No recent attempts yet
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Jump into a DILR set to begin tracking your sessions here.
          </p>
        </div>
        <Link href="/exams/cat/dilr" className="aurora-button-primary aurora-focus-ring shrink-0 px-6 text-sm">
          <Play size={15} aria-hidden /> Start DILR practice
        </Link>
      </div>

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
            CAT intelligence — live pipeline
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            Candidate pool stats, final recommendation, expected overlap and coverage risk — loaded from the real local CAT pipeline.
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
        <PlanLockCard compact title="Premium practice planner" description="Free users see the preview. Premium unlocks adaptive weak-area planning." />
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

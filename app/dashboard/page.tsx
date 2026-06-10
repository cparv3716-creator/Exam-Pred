import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CalendarCheck, Download, Flame, Target } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { exams } from "@/data/exams";
import { heatmap, practicePlan, topicProbability } from "@/data/analytics";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { getCatDashboardStats, getCatFinalRecommendation } from "@/lib/content/cat";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "ExamIQ AI exam intelligence cockpit demo.",
};

export default function DashboardPage() {
  const catStats = getCatDashboardStats();
  const catRecommendation = getCatFinalRecommendation();

  return (
    <DashboardShell
      title="AI exam intelligence cockpit"
      subtitle="Mock role-based dashboard for followed exams, probability signals, weak areas and quick actions."
      activeHref="/dashboard"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Followed exams" value="4" detail="CAT, JEE, NEET, GATE" />
        <StatCard icon={BrainCircuit} label="Tracked topics" value="426" detail="Across demo catalog" tone="blue" />
        <StatCard icon={Target} label="Top signal" value="86%" detail="Arithmetic cluster" tone="purple" />
        <StatCard icon={Download} label="Downloads" value="12" detail="Mock report actions" tone="emerald" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AnalyticsChartCard title="Recent PYQ trend movement" subtitle="Synthetic year-wise signal preview" />
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
          <SectionHeader eyebrow="Recommended topics" title="Next practice priorities" />
          <div className="mt-6 space-y-4">
            {topicProbability.slice(0, 5).map((topic) => (
              <div key={topic.topic}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{topic.topic}</span>
                  <span className="text-cyan-300">{topic.probability}%</span>
                </div>
                <ProbabilityBar value={topic.probability} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">CAT local content integration</h2>
          <p className="mt-1 text-sm text-slate-500">
            Candidate pool stats, final recommendation, expected overlap and Circles coverage risk loaded from local files.
          </p>
        </div>
        <CatStatsGrid stats={catStats} />
        <CatRecommendationCard stats={catStats} papers={catRecommendation.selectedPapers} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
          <h3 className="text-base font-semibold text-white">Probability heatmap</h3>
          <p className="mt-1 text-sm text-slate-500">Expected topic clusters over the demo timeline.</p>
          <div className="mt-6">
            <TopicHeatmap data={heatmap} />
          </div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
          <h3 className="text-base font-semibold text-white">Weak-area planner preview</h3>
          <p className="mt-1 text-sm text-slate-500">Practice recommendations are synthetic placeholders.</p>
          <div className="mt-6 space-y-3">
            {practicePlan.map((item) => (
              <div key={item.topic} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{item.topic}</span>
                  <span className="text-xs text-slate-500">{item.recommended} drills</span>
                </div>
                <div className="mt-3">
                  <ProbabilityBar value={item.strength} accent={item.priority === "high" ? "#f43f5e" : "#22d3ee"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {exams.slice(0, 3).map((exam) => (
          <Link key={exam.slug} href={`/dashboard/exams/${exam.slug}/analytics`} className="rounded-xl border border-white/8 bg-white/[0.025] p-5 hover:border-cyan-400/30">
            <Flame size={18} className="text-cyan-300" />
            <h3 className="mt-4 text-base font-semibold text-white">{exam.name} cockpit</h3>
            <p className="mt-2 text-sm text-slate-500">{exam.topTopics[0]?.name} is the leading synthetic signal.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <PlanLockCard compact title="Premium practice planner" description="Free users see the preview. Premium unlocks adaptive weak-area planning." />
        <Link href="/dashboard/downloads" className="rounded-xl border border-white/8 bg-white/[0.025] p-5 hover:border-cyan-400/30">
          <CalendarCheck size={18} className="text-emerald-300" />
          <h3 className="mt-4 text-base font-semibold text-white">Quick actions</h3>
          <p className="mt-2 text-sm text-slate-500">Review downloads, open exam PYQs, and inspect premium modules.</p>
        </Link>
      </div>
    </DashboardShell>
  );
}

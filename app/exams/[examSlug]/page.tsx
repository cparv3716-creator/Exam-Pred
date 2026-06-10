import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Download, FileText, FlaskConical, Layers, Lock, Target } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OutlinePill, SoftPill } from "@/components/ui/Badge";
import { ProbabilityBar } from "@/components/ui/ProbabilityMeter";
import { PlanLockCard } from "@/components/ui/PlanLockCard";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { exams, getExamBySlug } from "@/data/exams";
import { topicProbability } from "@/data/analytics";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { getCatDashboardStats, getCatFinalRecommendation } from "@/lib/content/cat";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  // CAT has a dedicated premium dashboard at /exams/cat (static segment),
  // so it is excluded here to avoid a duplicate-route conflict at build time.
  return exams.filter((exam) => exam.slug !== "cat").map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return {
    title: exam ? `${exam.name} Intelligence` : "Exam Intelligence",
    description: exam?.description,
  };
}

export default async function ExamDetailPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const isCat = exam.slug === "cat";
  const catStats = isCat ? getCatDashboardStats() : null;
  const catRecommendation = isCat ? getCatFinalRecommendation() : null;

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SoftPill>{exam.category} intelligence</SoftPill>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{exam.name}</h1>
            <p className="mt-3 text-lg text-slate-300">{exam.fullName}</p>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">{exam.description}</p>
            <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {isCat ? "Real local CAT pipeline data" : "Demo preview"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {isCat
                  ? "This CAT workspace reads local pipeline markdown, CSV, JSON and PDF outputs from content/cat and public/downloads/cat."
                  : "This exam pipeline is not uploaded yet, so the page uses demo previews until local outputs are added."}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {exam.sections.map((section) => (
                <OutlinePill key={section.code}>{section.name}</OutlinePill>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/exams/${exam.slug}/pyqs`} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
                View PYQs <ArrowRight size={15} />
              </Link>
              {[
                ["Analytics", `/dashboard/exams/${exam.slug}/analytics`],
                ["Mocks", `/dashboard/exams/${exam.slug}/mocks`],
                ["Reports", `/dashboard/exams/${exam.slug}/reports`],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: FileText, label: "PYQs", value: exam.pyqCount.toLocaleString() },
                { icon: Layers, label: "Topics", value: String(exam.topicCount) },
                { icon: Download, label: "Years", value: exam.yearsCovered },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <stat.icon size={17} className="text-cyan-300" />
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {exam.topTopics.slice(0, 5).map((topic) => (
                <div key={topic.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{topic.name}</span>
                    <span className="text-cyan-300">{topic.weight}%</span>
                  </div>
                  <ProbabilityBar value={topic.weight} accent={exam.accent} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {catStats && catRecommendation && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <SectionHeader
              eyebrow="Live CAT content integration"
              title="Stage 9 predicted paper portfolio"
              description="Real local CAT pipeline data loaded from markdown, CSV, JSON and PDF files. Pattern-based practice only, with explicit risk provenance."
            />
          </div>
          <CatStatsGrid stats={catStats} />
          <div className="mt-8">
            <CatRecommendationCard stats={catStats} papers={catRecommendation.selectedPapers} />
          </div>
        </section>
      )}

      <section className="bg-white/[0.015] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Trend cards"
            title="Recent signal preview"
            description={isCat ? "CAT combines local pipeline stats with demo charts where visualization data is still pending." : "Demo preview metadata demonstrates how ExamIQ will communicate topic shifts after this pipeline is uploaded."}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: Target, title: "High-probability topic preview", text: isCat ? `${exam.topTopics[0]?.name ?? "Core topics"} is paired with the local CAT recommendation portfolio.` : `${exam.topTopics[0]?.name ?? "Core topics"} is currently the highest demo preview signal.` },
              { icon: BarChart3, title: "Topic frequency mini chart", text: "Frequency shifts are shown as transparent weighted signals." },
              { icon: Lock, title: "Premium locked widgets", text: "Guests and free users see lock cards before premium analytics." },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
                <card.icon size={20} className="text-cyan-300" />
                <h3 className="mt-4 text-base font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <AnalyticsChartCard title={`${exam.name} topic frequency`} subtitle="Synthetic trend chart" />
            <PlanLockCard
              title="Premium prediction widget"
              description="Unlock probability dashboards, expected topic clusters and downloadable reports."
              features={topicProbability.slice(0, 3).map((topic) => topic.topic)}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

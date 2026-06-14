import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, BarChart3, BrainCircuit, Target } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnalyticsChartCard } from "@/components/dashboard/AnalyticsChartCard";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { StatCard } from "@/components/ui/StatCard";
import { exams, getExamBySlug } from "@/data/exams";
import { heatmap } from "@/data/analytics";
import { CatRecommendationCard, CatStatsGrid } from "@/components/content/CatContentCards";
import { getCatBacktestSummary, getCatDashboardStats, getCatFinalRecommendation, getCatPortfolioWeights } from "@/lib/content/cat";
import { requireActiveExamSubscription } from "@/lib/backend/access";
import { getPaymentExamIdForSlug } from "@/lib/payments/plans";

type Params = Promise<{ examSlug: string }>;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Analytics` : "Analytics" };
}

export default async function AnalyticsPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const paymentExamId = getPaymentExamIdForSlug(exam.slug);
  if (paymentExamId) {
    await requireActiveExamSubscription(
      paymentExamId,
      `/dashboard/exams/${exam.slug}/analytics`,
    );
  }
  const isCat = exam.slug === "cat";
  const catStats = isCat ? getCatDashboardStats() : null;
  const catRecommendation = isCat ? getCatFinalRecommendation() : null;
  const backtest = isCat ? getCatBacktestSummary() : null;
  const portfolioWeights = isCat ? getCatPortfolioWeights() : {};

  return (
    <DashboardShell title={`${exam.name} analytics`} subtitle="Premium trend, heatmap and probability analytics preview." activeHref="/dashboard/exams">
      {catStats && catRecommendation && (
          <div className="mb-8 space-y-6">
            <CatStatsGrid stats={catStats} />
            <CatRecommendationCard stats={catStats} papers={catRecommendation.selectedPapers} />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
                <h3 className="text-base font-semibold text-white">CAT backtest summary</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {backtest?.rowCount ?? 0} rows. Average score {backtest?.averageTotalScore ?? "N/A"}. Best variant {backtest?.bestVariantId || "N/A"}.
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
                <h3 className="text-base font-semibold text-white">Portfolio weights</h3>
                <div className="mt-4 grid gap-2">
                  {Object.entries(portfolioWeights).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{key.replace(/_/g, " ")}</span>
                      <span className="font-semibold text-cyan-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} label="Topics analyzed" value={String(exam.topicCount)} />
          <StatCard icon={Target} label="Top topic" value={`${exam.topTopics[0]?.weight ?? 0}%`} tone="blue" />
          <StatCard icon={BrainCircuit} label="Signals" value="18" detail="Synthetic models" tone="purple" />
          <StatCard icon={Activity} label="Trend delta" value="+12%" tone="emerald" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <AnalyticsChartCard title="Year-wise trend movement" subtitle="Synthetic frequency timeline" />
          <AnalyticsChartCard title="Probability distribution" subtitle="Top topic likelihood" variant="bar" />
      </div>
      <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-6">
          <h3 className="text-base font-semibold text-white">Topic heatmap</h3>
          <div className="mt-6">
            <TopicHeatmap data={heatmap} />
          </div>
      </div>
    </DashboardShell>
  );
}

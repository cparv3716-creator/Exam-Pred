import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PremiumGuard } from "@/components/ui/PremiumGuard";
import { RiskBadge } from "@/components/ui/Badge";
import { ProbabilityBar, ProbabilityRing } from "@/components/ui/ProbabilityMeter";
import { exams, getExamBySlug } from "@/data/exams";
import { topicProbability } from "@/data/analytics";
import { getCatPredictionSpecs, getCatPortfolioWeights } from "@/lib/content/cat";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return { title: exam ? `${exam.name} Topic Probability` : "Topic Probability" };
}

export default async function TopicProbabilityPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const isCat = exam.slug === "cat";
  const catSpecs = isCat ? getCatPredictionSpecs() : null;
  const portfolioWeights = isCat ? getCatPortfolioWeights() : {};

  return (
    <DashboardShell title={`${exam.name} topic probability`} subtitle="Premium topic likelihood, frequency and risk indicators." activeHref="/dashboard/exams">
      <PremiumGuard title="Topic probability is Premium" description="Upgrade to reveal probability meters, risk flags and topic cluster recommendations.">
        {catSpecs && (
          <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h3 className="text-base font-semibold text-white">CAT prediction specs</h3>
              <p className="mt-2 text-sm text-slate-500">{catSpecs.count} local specs loaded from prediction_specs.csv.</p>
              <div className="mt-5 space-y-3">
                {catSpecs.topSpecs.slice(0, 5).map((spec) => (
                  <div key={spec.spec_id} className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-white">{spec.target_topic} / {spec.target_subtopic}</span>
                      <span className="text-xs text-cyan-300">{spec.spec_priority_score}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{spec.target_archetype}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <h3 className="text-base font-semibold text-white">Portfolio weight model</h3>
              <div className="mt-5 space-y-2">
                {Object.entries(portfolioWeights).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{key.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-cyan-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {topicProbability.map((topic) => (
            <div key={topic.topic} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{topic.topic}</h3>
                  <p className="mt-1 text-sm text-slate-500">Frequency score {topic.frequency}%</p>
                </div>
                <ProbabilityRing value={topic.probability} size={70} />
              </div>
              <div className="mt-5">
                <ProbabilityBar value={topic.probability} />
              </div>
              <div className="mt-4">
                <RiskBadge risk={topic.risk} />
              </div>
            </div>
          ))}
        </div>
      </PremiumGuard>
    </DashboardShell>
  );
}

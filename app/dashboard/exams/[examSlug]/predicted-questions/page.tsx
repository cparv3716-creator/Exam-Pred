import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DifficultyBadge } from "@/components/ui/Badge";
import { ProbabilityRing } from "@/components/ui/ProbabilityMeter";
import { exams, getExamBySlug } from "@/data/exams";
import { predictedQuestions } from "@/data/analytics";
import { getCatCandidateScores } from "@/lib/content/cat";
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
  return { title: exam ? `${exam.name} Predicted Practice` : "Predicted Practice" };
}

export default async function PredictedQuestionsPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const paymentExamId = getPaymentExamIdForSlug(exam.slug);
  if (paymentExamId) {
    await requireActiveExamSubscription(
      paymentExamId,
      `/dashboard/exams/${exam.slug}/predicted-questions`,
    );
  }
  const catCandidates = exam.slug === "cat" ? getCatCandidateScores() : null;

  return (
    <DashboardShell title={`${exam.name} predicted practice`} subtitle="Synthetic high-probability practice archetypes, not guaranteed questions." activeHref="/dashboard/exams">
      {catCandidates && (
          <div className="mb-8 rounded-xl border border-white/8 bg-white/[0.025] p-5">
            <h3 className="text-base font-semibold text-white">CAT selected candidate pool</h3>
            <p className="mt-2 text-sm text-slate-500">
              {catCandidates.selectedPoolCount} selected rows, {catCandidates.paperEligibleCount} paper-eligible, {catCandidates.uniqueSpecsRepresented} specs represented.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {catCandidates.topCandidates.slice(0, 6).map((candidate) => (
                <div key={candidate.candidate_id} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-white">{candidate.topic} / {candidate.subtopic}</span>
                    <span className="text-xs text-cyan-300">{candidate.final_question_value_score}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{candidate.question_text}</p>
                </div>
              ))}
            </div>
          </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
          {predictedQuestions.map((question) => (
            <div key={question.id} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{question.topic}</h3>
                  <p className="mt-1 text-sm text-slate-500">{question.subtopic}</p>
                </div>
                <ProbabilityRing value={question.probability} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <DifficultyBadge level={question.difficulty} />
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">
                  {question.archetype}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{question.rationale}</p>
            </div>
          ))}
      </div>
    </DashboardShell>
  );
}

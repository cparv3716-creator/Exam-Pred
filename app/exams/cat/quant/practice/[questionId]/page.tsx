import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Timer } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeQuestionViewer } from "@/components/practice/PracticeQuestionViewer";
import { OutlinePill } from "@/components/ui/Badge";
import { getCatQuantPracticeById } from "@/lib/content/practice/cat-quant-practice";

/** Rendered on demand — per-question pre-rendering is too heavy for deploys. */
export const dynamic = "force-dynamic";

const LEVEL_HREF: Record<string, string> = {
  Beginner: "/exams/cat/quant/beginner",
  Intermediate: "/exams/cat/quant/intermediate",
  Advanced: "/exams/cat/quant/advanced",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ questionId: string }>;
}): Promise<Metadata> {
  const { questionId } = await params;
  const question = getCatQuantPracticeById(questionId);
  if (!question) return { title: "Question not found" };
  return { title: `${question.topic} — ${question.practice_level} Practice` };
}

export default async function PracticeQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getCatQuantPracticeById(questionId);
  if (!question) notFound();

  const backHref = LEVEL_HREF[question.practice_level] ?? "/exams/cat/quant";
  const backLabel = `${question.practice_level} Practice`;

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          <ArrowLeft size={14} /> Back to {backLabel}
        </Link>

        {/* Question header */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <OutlinePill>{question.practice_level}</OutlinePill>
          <OutlinePill>{question.difficulty}</OutlinePill>
          <OutlinePill>{question.question_type}</OutlinePill>
          {question.estimated_time && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
              <Timer size={11} /> {question.estimated_time}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span>{question.topic}</span>
          <span>/</span>
          <span>{question.subtopic}</span>
        </div>

        {/* Attempt experience */}
        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <PracticeQuestionViewer question={question} />
        </div>

        {/* Footer nav */}
        <div className="mt-6 flex justify-start">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft size={14} /> Back to {backLabel}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

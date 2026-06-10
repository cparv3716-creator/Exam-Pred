import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourceQuestionViewer } from "@/components/practice/LatexSourceQuestionViewer";
import { QuestionAttemptControls } from "@/components/backend/QuestionAttemptControls";
import { resolveQuantAttemptMeta } from "@/lib/backend/attempt-mapping";
import { OutlinePill } from "@/components/ui/Badge";
import { getCatQuantLatexSourceById, getCatQuantLatexSourceQuestions } from "@/lib/content/practice/cat-quant-latex-source";

const LEVEL_HREF: Record<string, string> = {
  Beginner: "/exams/cat/quant/latex-source/beginner",
  Intermediate: "/exams/cat/quant/latex-source/intermediate",
  Advanced: "/exams/cat/quant/latex-source/advanced",
};

export function generateStaticParams() {
  return getCatQuantLatexSourceQuestions().map((question) => ({ questionId: question.question_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ questionId: string }> }): Promise<Metadata> {
  const { questionId } = await params;
  const question = getCatQuantLatexSourceById(questionId);
  if (!question) return { title: "LaTeX source question not found" };
  return { title: `${question.topic} - CAT Quant LaTeX Source` };
}

export default async function CatQuantLatexSourceQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const question = getCatQuantLatexSourceById(questionId);
  if (!question) notFound();
  const backHref = LEVEL_HREF[question.practice_level] ?? "/exams/cat/quant/latex-source";
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
          <ArrowLeft size={14} /> Back to {question.practice_level} source practice
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <OutlinePill>{question.practice_level}</OutlinePill>
          <OutlinePill>{question.difficulty}</OutlinePill>
          <OutlinePill>{question.question_type}</OutlinePill>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
            <FileText size={11} /> Source: LaTeX
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span>{question.topic}</span>
          <span>/</span>
          <span>{question.subtopic}</span>
        </div>

        <div className="mt-8">
          <QuestionAttemptControls meta={resolveQuantAttemptMeta(question)} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <LatexSourceQuestionViewer question={question} />
        </div>

        <div className="mt-6 flex justify-start">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
            <ArrowLeft size={14} /> Back to {question.practice_level} source practice
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
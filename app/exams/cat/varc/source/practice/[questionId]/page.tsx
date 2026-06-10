import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourceQuestionViewer } from "@/components/practice/VarcSourceQuestionViewer";
import { QuestionAttemptControls } from "@/components/backend/QuestionAttemptControls";
import { resolveVarcAttemptMeta } from "@/lib/backend/attempt-mapping";
import { OutlinePill } from "@/components/ui/Badge";
import { getCatVarcSourceById, getCatVarcSourceQuestions } from "@/lib/content/practice/cat-varc-source";

const LEVEL_HREF: Record<string, string> = {
  Beginner: "/exams/cat/varc/source/beginner",
  Intermediate: "/exams/cat/varc/source/intermediate",
  Advanced: "/exams/cat/varc/source/advanced",
};

export function generateStaticParams() {
  return getCatVarcSourceQuestions().map((q) => ({ questionId: q.question_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ questionId: string }> }): Promise<Metadata> {
  const { questionId } = await params;
  const question = getCatVarcSourceById(questionId);
  if (!question) return { title: "Question not found" };
  return { title: `${question.varc_type} – CAT VARC Source` };
}

export default async function CatVarcSourcePracticePage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const question = getCatVarcSourceById(questionId);
  if (!question) notFound();

  const backHref = LEVEL_HREF[question.practice_level] ?? "/exams/cat/varc/source";
  const isRc = question.varc_type === "RC";

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
          <ArrowLeft size={14} /> Back to {question.practice_level} source practice
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <OutlinePill>{question.practice_level}</OutlinePill>
          {question.difficulty && <OutlinePill>{question.difficulty}</OutlinePill>}
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
            {isRc && <BookOpen size={10} />}
            {question.varc_type}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
            Source: PDF
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span>{question.subtopic}</span>
          <span>/</span>
          <span>Set {question.source_set_number} · Q{question.source_question_number}</span>
        </div>

        <div className="mt-8">
          <QuestionAttemptControls meta={resolveVarcAttemptMeta(question)} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <VarcSourceQuestionViewer question={question} />
        </div>

        <div className="mt-6">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
            <ArrowLeft size={14} /> Back to {question.practice_level} source practice
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourceQuestionViewer } from "@/components/practice/LatexSourceQuestionViewer";
import { OutlinePill } from "@/components/ui/Badge";
import { Breadcrumb, DifficultyBadge, QuestionPager } from "@/components/ui/premium";
import {
  getCatQuantLatexSourceById,
  getCatQuantLatexSourceNeighbors,
  getCatQuantLatexSourceQuestions,
} from "@/lib/content/practice/cat-quant-latex-source";

const QUESTION_HREF = (id: string) => `/exams/cat/quant/latex-source/practice/${id}`;

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
  if (!question) return { title: "Question not found" };
  return { title: `${question.topic} — CAT Quant practice` };
}

export default async function CatQuantLatexSourceQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const question = getCatQuantLatexSourceById(questionId);
  if (!question) notFound();
  const backHref = LEVEL_HREF[question.practice_level] ?? "/exams/cat/quant/latex-source";
  const neighbors = getCatQuantLatexSourceNeighbors(questionId);

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "Quant", href: "/exams/cat/quant/latex-source" },
            { label: question.practice_level, href: backHref },
            { label: question.topic },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <OutlinePill>{question.practice_level}</OutlinePill>
          <DifficultyBadge level={question.difficulty} />
          <OutlinePill>{question.question_type}</OutlinePill>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-400">{question.topic}</span>
          <span className="text-slate-700">/</span>
          <span>{question.subtopic}</span>
        </div>

        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <LatexSourceQuestionViewer question={question} />
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <QuestionPager
            prevHref={neighbors.prevId ? QUESTION_HREF(neighbors.prevId) : null}
            nextHref={neighbors.nextId ? QUESTION_HREF(neighbors.nextId) : null}
            label={neighbors.index >= 0 ? `Question ${neighbors.index + 1} of ${neighbors.total}` : undefined}
          />
          <div className="mt-5">
            <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
              <ArrowLeft size={15} /> Back to {question.practice_level} Quant practice
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourceQuestionViewer } from "@/components/practice/VarcSourceQuestionViewer";
import { OutlinePill } from "@/components/ui/Badge";
import { Breadcrumb, DifficultyBadge, QuestionPager } from "@/components/ui/premium";
import {
  getCatVarcPassagePosition,
  getCatVarcPassageText,
  getCatVarcSourceById,
  getCatVarcSourceNeighbors,
  getCatVarcSourceQuestions,
} from "@/lib/content/practice/cat-varc-source";

const LEVEL_HREF: Record<string, string> = {
  Beginner: "/exams/cat/varc/source/beginner",
  Intermediate: "/exams/cat/varc/source/intermediate",
  Advanced: "/exams/cat/varc/source/advanced",
};

const QUESTION_HREF = (id: string) => `/exams/cat/varc/source/practice/${id}`;

export function generateStaticParams() {
  return getCatVarcSourceQuestions().map((q) => ({ questionId: q.question_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ questionId: string }> }): Promise<Metadata> {
  const { questionId } = await params;
  const question = getCatVarcSourceById(questionId);
  if (!question) return { title: "Question not found" };
  return { title: `${question.varc_type} — CAT VARC practice` };
}

export default async function CatVarcSourcePracticePage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const question = getCatVarcSourceById(questionId);
  if (!question) notFound();

  const backHref = LEVEL_HREF[question.practice_level] ?? "/exams/cat/varc/source";
  const isRc = question.varc_type === "RC";
  const passageText = getCatVarcPassageText(question);
  const passagePosition = getCatVarcPassagePosition(question);
  const passageNav = passagePosition
    ? {
        current: passagePosition.current,
        total: passagePosition.total,
        prevHref: passagePosition.prevId ? QUESTION_HREF(passagePosition.prevId) : null,
        nextHref: passagePosition.nextId ? QUESTION_HREF(passagePosition.nextId) : null,
      }
    : null;
  const neighbors = getCatVarcSourceNeighbors(questionId);

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "VARC", href: "/exams/cat/varc/source" },
            { label: question.practice_level, href: backHref },
            { label: question.varc_type },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <OutlinePill>{question.practice_level}</OutlinePill>
          {question.difficulty && <DifficultyBadge level={question.difficulty} />}
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
            {isRc && <BookOpen size={10} />}
            {question.varc_type}
          </span>
        </div>

        {question.subtopic && (
          <div className="mt-2 text-xs text-slate-500">{question.subtopic}</div>
        )}

        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <VarcSourceQuestionViewer question={question} passageText={passageText} passageNav={passageNav} />
        </div>

        <div className="mt-8 border-t border-white/5 pt-6">
          <QuestionPager
            prevHref={neighbors.prevId ? QUESTION_HREF(neighbors.prevId) : null}
            nextHref={neighbors.nextId ? QUESTION_HREF(neighbors.nextId) : null}
            label={neighbors.index >= 0 ? `Question ${neighbors.index + 1} of ${neighbors.total}` : undefined}
          />
          <div className="mt-5">
            <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
              <ArrowLeft size={15} /> Back to {question.practice_level} VARC practice
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

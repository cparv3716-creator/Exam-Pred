import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function LatexSourceQuestionViewer({ question }: { question: LatexSourcePracticeQuestion }) {
  const options = [question.option_a_markdown, question.option_b_markdown, question.option_c_markdown, question.option_d_markdown];
  const hasOptions = options.some((option) => option.trim());
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer content={question.question_text_markdown || question.raw_latex_block} className="mt-4" />
      </section>

      {hasOptions && (
        <section className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Options</p>
          {options.map((option, index) => option.trim() ? (
            <div key={OPTION_LABELS[index]} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-xs font-bold text-cyan-200">{OPTION_LABELS[index]}</span>
                <RichMathRenderer content={option} compact className="min-w-0 flex-1" />
              </div>
            </div>
          ) : null)}
        </section>
      )}

      {question.correct_answer_markdown && (
        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Answer</p>
          <RichMathRenderer content={question.correct_answer_markdown} compact className="mt-3" />
        </section>
      )}

      {question.detailed_solution_markdown && (
        <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">Detailed solution</p>
          <RichMathRenderer content={question.detailed_solution_markdown} className="mt-4" />
        </section>
      )}
    </div>
  );
}
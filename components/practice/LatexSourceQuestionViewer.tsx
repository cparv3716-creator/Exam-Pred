"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CircleCheckBig, Sparkles } from "lucide-react";
import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function LatexSourceQuestionViewer({ question }: { question: LatexSourcePracticeQuestion }) {
  const [revealed, setRevealed] = useState(false);
  const options = [question.option_a_markdown, question.option_b_markdown, question.option_c_markdown, question.option_d_markdown];
  const hasOptions = options.some((option) => option.trim());
  const hasAnswer = Boolean(question.correct_answer_markdown?.trim());
  const hasSolution = Boolean(question.detailed_solution_markdown?.trim());
  const canReveal = hasAnswer || hasSolution;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer
          content={question.question_text_markdown || question.raw_latex_block}
          className="mt-4 text-[15px] sm:text-base"
        />
      </section>

      {hasOptions && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Options</p>
          <div className="grid gap-3">
            {options.map((option, index) =>
              option.trim() ? (
                <div
                  key={OPTION_LABELS[index]}
                  className="group flex gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 transition-colors hover:border-white/15"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] text-xs font-bold text-cyan-200">
                    {OPTION_LABELS[index]}
                  </span>
                  <RichMathRenderer content={option} compact className="min-w-0 flex-1" />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {canReveal && (
        <section>
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-expanded={revealed}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/[0.12]"
          >
            {revealed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {revealed ? "Hide answer & solution" : "Reveal answer & solution"}
          </button>

          {revealed && (
            <div className="mt-4 space-y-4 animate-fade-up">
              {hasAnswer && (
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    <CircleCheckBig size={14} /> Answer
                  </p>
                  <RichMathRenderer content={question.correct_answer_markdown} compact className="mt-3 text-emerald-50" />
                </div>
              )}
              {hasSolution && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">
                    <Sparkles size={14} /> Detailed solution
                  </p>
                  <RichMathRenderer content={question.detailed_solution_markdown} className="mt-4" />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

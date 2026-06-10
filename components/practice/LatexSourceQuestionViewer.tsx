"use client";

import { useState } from "react";
import { CircleCheckBig, Eye, Sparkles } from "lucide-react";
import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";
import { PracticeOptions, type PracticeChoice } from "@/components/practice/PracticeOptions";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

/** Pull a leading option letter (A–D) out of an answer string like "(B) $18.5$." */
function extractOptionLetter(answer: string): string | null {
  const trimmed = (answer ?? "").trim();
  const match =
    trimmed.match(/^\(?\s*([A-Da-d])\s*[).:\-]/) ?? trimmed.match(/^\(?\s*([A-Da-d])\)?\.?$/);
  return match ? match[1].toUpperCase() : null;
}

export function LatexSourceQuestionViewer({ question }: { question: LatexSourcePracticeQuestion }) {
  const [resolved, setResolved] = useState(false);

  const rawOptions = [
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
  ];
  const choices: PracticeChoice[] = rawOptions
    .map((markdown, index) => ({ key: OPTION_LABELS[index], label: OPTION_LABELS[index], markdown }))
    .filter((choice) => choice.markdown.trim());
  const hasOptions = choices.length > 0;

  const letter = hasOptions ? extractOptionLetter(question.correct_answer_markdown) : null;
  const correctKey = letter && choices.some((choice) => choice.key === letter) ? letter : null;

  const hasAnswer = Boolean(question.correct_answer_markdown?.trim());
  const hasSolution = Boolean(question.detailed_solution_markdown?.trim());

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer
          content={question.question_text_markdown || question.raw_latex_block}
          className="mt-4 text-[15px] sm:text-base"
        />
      </section>

      {hasOptions ? (
        <PracticeOptions choices={choices} correctKey={correctKey} onResolved={() => setResolved(true)} />
      ) : (
        (hasAnswer || hasSolution) && !resolved && (
          <button
            type="button"
            onClick={() => setResolved(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/[0.12]"
          >
            <Eye size={15} /> Reveal answer
          </button>
        )
      )}

      {resolved && hasAnswer && (
        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5 animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <CircleCheckBig size={14} /> Answer
          </p>
          <RichMathRenderer content={question.correct_answer_markdown} compact className="mt-3 text-emerald-50" />
        </section>
      )}

      {resolved && hasSolution && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">
            <Sparkles size={14} /> Detailed solution
          </p>
          <RichMathRenderer content={question.detailed_solution_markdown} className="mt-4" />
        </section>
      )}
    </div>
  );
}

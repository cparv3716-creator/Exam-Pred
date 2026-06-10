"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, CircleCheckBig, Sparkles } from "lucide-react";
import type { VarcSourceQuestion } from "@/types/varc-practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

export function VarcSourceQuestionViewer({ question }: { question: VarcSourceQuestion }) {
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const isRc = question.varc_type === "RC";
  const isTita = question.varc_type === "Para Jumble" || question.varc_type === "Odd Sentence Out";
  const options = [
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
    question.option_e_markdown,
  ];
  const hasOptions = options.some((o) => o.trim());

  const answerLabel = buildAnswerLabel(question.correct_answer, options, isTita, question.varc_type);
  const hasSolution = Boolean(question.detailed_solution_markdown?.trim());

  return (
    <div className="space-y-8">
      {/* RC Passage — premium reading interface */}
      {isRc && question.passage_text_markdown && (
        <section>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            <BookOpen size={14} /> Passage
          </p>
          <div className="mt-4 rounded-2xl border border-white/8 bg-ink-900/40 p-6 sm:p-8">
            <div className="mx-auto max-w-[68ch]">
              <RichMathRenderer content={question.passage_text_markdown} reading />
            </div>
          </div>
        </section>
      )}

      {/* Question */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer
          content={question.question_text_markdown || question.source_raw_block}
          className="mt-4 text-[15px] sm:text-base"
        />
      </section>

      {/* Options */}
      {hasOptions && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isTita ? "Sentences" : "Options"}
          </p>
          <div className="grid gap-3">
            {options.map((opt, i) =>
              opt.trim() ? (
                <div
                  key={OPTION_LABELS[i]}
                  className="group flex gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 transition-colors hover:border-white/15"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] text-xs font-bold text-cyan-200">
                    {isTita ? i + 1 : OPTION_LABELS[i]}
                  </span>
                  <RichMathRenderer content={opt} compact className="min-w-0 flex-1" />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* Answer reveal */}
      <section>
        <button
          type="button"
          onClick={() => setAnswerRevealed((v) => !v)}
          aria-expanded={answerRevealed}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/[0.12]"
        >
          {answerRevealed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {answerRevealed ? "Hide answer" : "Reveal answer"}
        </button>

        {answerRevealed && (
          <div className="mt-4 space-y-4 animate-fade-up">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <CircleCheckBig size={14} /> Answer
              </p>
              <p className="mt-2 font-semibold text-emerald-50">{answerLabel}</p>
            </div>

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
    </div>
  );
}

function buildAnswerLabel(answer: string, options: string[], isTita: boolean, varcType: string): string {
  if (!answer) return "—";

  if (isTita) {
    if (varcType === "Odd Sentence Out") return `Sentence ${answer} is the odd one out`;
    if (varcType === "Para Jumble") {
      const seq = answer.split("").map((d) => `Sentence ${d}`).join(" → ");
      return `${answer}   (${seq})`;
    }
    return answer;
  }

  // MCQ: map A/B/C/D to option text
  const idx = ["A", "B", "C", "D", "E"].indexOf(answer.toUpperCase());
  const optText = idx >= 0 ? options[idx]?.trim() : "";
  if (optText) {
    const preview = optText.slice(0, 120);
    return `Option ${answer.toUpperCase()}${preview ? `: ${preview}${optText.length > 120 ? "…" : ""}` : ""}`;
  }

  // Sentence placement bare letter
  return `Position ${answer.toUpperCase()}`;
}

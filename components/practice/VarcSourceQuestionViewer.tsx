"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* RC Passage */}
      {isRc && question.passage_text_markdown && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Passage</p>
          <div className="mt-4 rounded-xl border border-white/6 bg-white/[0.02] p-5 sm:p-6">
            <RichMathRenderer content={question.passage_text_markdown} />
          </div>
        </section>
      )}

      {/* Question */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer content={question.question_text_markdown || question.source_raw_block} className="mt-4" />
      </section>

      {/* Options */}
      {hasOptions && (
        <section className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isTita ? "Sentences" : "Options"}
          </p>
          {options.map((opt, i) =>
            opt.trim() ? (
              <div key={OPTION_LABELS[i]} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-xs font-bold text-cyan-200">
                    {isTita ? i + 1 : OPTION_LABELS[i]}
                  </span>
                  <RichMathRenderer content={opt} compact className="min-w-0 flex-1" />
                </div>
              </div>
            ) : null,
          )}
        </section>
      )}

      {/* Answer reveal */}
      <section>
        <button
          onClick={() => setAnswerRevealed((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/[0.09]"
        >
          {answerRevealed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {answerRevealed ? "Hide answer" : "Reveal answer"}
        </button>

        {answerRevealed && (
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Answer</p>
            <p className="mt-2 font-semibold text-emerald-100">{answerLabel}</p>
          </div>
        )}
      </section>

      {/* Detailed solution */}
      {question.detailed_solution_markdown && (
        <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">Detailed solution</p>
          <RichMathRenderer content={question.detailed_solution_markdown} className="mt-4" />
        </section>
      )}
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

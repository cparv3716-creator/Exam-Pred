"use client";

import { useState } from "react";
import { Check, ChevronRight, Pencil } from "lucide-react";
import type { GeneratedPracticeQuestion } from "@/types/practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";
import { formatOptionToMarkdown, formatQuestionToMarkdown, formatSolutionToMarkdown } from "@/lib/content/practice/solution-formatting";
import { cn } from "@/lib/utils";

const OPTION_KEYS = ["option_a", "option_b", "option_c", "option_d"] as const;
const OPTION_DISPLAY_KEYS = ["option_a_display", "option_b_display", "option_c_display", "option_d_display"] as const;
const OPTION_MARKDOWN_KEYS = ["option_a_markdown", "option_b_markdown", "option_c_markdown", "option_d_markdown"] as const;
const OPTION_REPAIRED_KEYS = ["option_a_repaired", "option_b_repaired", "option_c_repaired", "option_d_repaired"] as const;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function PracticeQuestionViewer({
  question,
  onNext,
}: {
  question: GeneratedPracticeQuestion;
  onNext?: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [titaValue, setTitaValue] = useState("");
  const [checked, setChecked] = useState(false);

  const isMCQ = question.question_type === "MCQ" || question.question_type === "MSQ";
  const correctAnswer = question.correct_answer.trim();
  const correctAnswerDisplay = question.correct_answer_markdown ?? formatOptionToMarkdown(question.correct_answer_display ?? correctAnswer);
  const questionMarkdown = question.question_text_markdown ?? formatQuestionToMarkdown(question.question_text_repaired ?? question.question_text_display ?? question.question_text);
  const solutionMarkdown = question.detailed_solution_markdown ?? formatSolutionToMarkdown(question.detailed_solution_repaired ?? question.detailed_solution_display ?? question.detailed_solution);

  function checkCorrect(): boolean {
    if (isMCQ) return selectedOption !== null && correctAnswer.toUpperCase().includes(selectedOption);
    return titaValue.trim().toLowerCase() === correctAnswer.toLowerCase();
  }

  const canCheck = isMCQ ? selectedOption !== null : titaValue.trim().length > 0;
  const isCorrect = checked ? checkCorrect() : false;

  function reset() {
    setSelectedOption(null);
    setTitaValue("");
    setChecked(false);
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <RichMathRenderer content={questionMarkdown} className="text-base" />

      {/* MCQ options */}
      {isMCQ && (
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTION_KEYS.map((key, index) => {
            const text = question[OPTION_MARKDOWN_KEYS[index]] ?? formatOptionToMarkdown(question[OPTION_REPAIRED_KEYS[index]] ?? question[OPTION_DISPLAY_KEYS[index]] ?? question[key]);
            if (!text) return null;
            const label = OPTION_LABELS[index];
            const isSelected = selectedOption === label;
            const isCorrectOption = checked && correctAnswer.toUpperCase().includes(label);
            const isWrong = checked && isSelected && !isCorrectOption;

            return (
              <button
                key={key}
                disabled={checked}
                onClick={() => setSelectedOption(label)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  isCorrectOption
                    ? "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-200"
                    : isWrong
                      ? "border-rose-400/40 bg-rose-400/[0.06] text-rose-200"
                      : isSelected
                        ? "border-cyan-400/35 bg-cyan-400/[0.08] text-white"
                        : "border-white/8 bg-white/[0.025] text-slate-300 hover:border-cyan-400/20 hover:bg-white/[0.04] disabled:cursor-default",
                )}
              >
                <span className="mr-2 font-semibold text-slate-500">{label}.</span>
                <RichMathRenderer content={text} compact />
              </button>
            );
          })}
        </div>
      )}

      {/* TITA input */}
      {!isMCQ && (
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Pencil size={11} /> Enter your answer
          </label>
          <input
            value={titaValue}
            onChange={(e) => setTitaValue(e.target.value)}
            disabled={checked}
            placeholder="Type your numerical answer…"
            className="w-full rounded-lg border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/30 disabled:opacity-60"
          />
        </div>
      )}

      {/* Check Answer */}
      {!checked && (
        <button
          onClick={() => setChecked(true)}
          disabled={!canCheck}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={15} /> Check Answer
        </button>
      )}

      {/* Result + Solution */}
      {checked && (
        <div className="space-y-4">
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm font-semibold",
              isCorrect
                ? "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300"
                : "border-rose-400/30 bg-rose-400/[0.06] text-rose-300",
            )}
          >
            {isCorrect ? (
              "Correct!"
            ) : (
              <>
                Incorrect — correct answer:{" "}
                <span className="font-semibold"><RichMathRenderer content={correctAnswerDisplay} compact /></span>
              </>
            )}
          </div>

          <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Solution</p>
            <RichMathRenderer content={solutionMarkdown} className="mt-4 text-sm" />
          </div>

          {onNext && (
            <button
              onClick={() => { reset(); onNext(); }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-cyan-400/25 hover:bg-white/[0.07]"
            >
              Next Question <ChevronRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

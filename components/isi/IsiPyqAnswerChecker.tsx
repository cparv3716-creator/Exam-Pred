"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, CircleAlert, Eye, RotateCcw, XCircle } from "lucide-react";
import type { IsiQuestionOption } from "@/types/isi";
import { IsiMathRenderer } from "@/components/isi/IsiMathRenderer";
import { IsiSolutionSteps } from "@/components/isi/IsiSolutionSteps";

export function IsiPyqAnswerChecker({
  options,
  answer,
  solution,
  needsReview,
}: {
  options: IsiQuestionOption[];
  answer?: string | null;
  solution?: string | null;
  needsReview: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const correctAnswer = useMemo(() => normalizeAnswer(answer), [answer]);
  const canCheck = Boolean(correctAnswer) && !needsReview;
  const showSolution = Boolean(solution) && (revealed || checked);
  const answerUnderReview = !canCheck;
  const isCorrect = checked && selected === correctAnswer;
  const isIncorrect = checked && selected !== null && selected !== correctAnswer;

  return (
    <div className="mt-7 space-y-5">
      {options.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selected === option.label;
            const isCorrectOption = checked && correctAnswer === option.label;
            const isWrongSelected = checked && isSelected && correctAnswer !== option.label;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setSelected(option.label);
                  setChecked(false);
                }}
                className="aurora-focus-ring flex min-h-[5.5rem] items-start gap-3 rounded-2xl border p-4 text-left transition"
                style={{
                  borderColor: isCorrectOption
                    ? "var(--aurora-success)"
                    : isWrongSelected
                      ? "rgb(248 113 113)"
                      : isSelected
                        ? "var(--aurora-primary)"
                        : "var(--aurora-border-soft)",
                  background: isCorrectOption
                    ? "rgba(16,185,129,0.12)"
                    : isWrongSelected
                      ? "rgba(254,226,226,0.74)"
                      : isSelected
                        ? "rgba(37,99,235,0.08)"
                        : "var(--aurora-background-soft)",
                }}
                aria-pressed={isSelected}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold shadow-sm" style={{ color: isWrongSelected ? "rgb(185 28 28)" : "var(--aurora-primary)" }}>
                  {option.label}
                </span>
                <IsiMathRenderer content={option.text} className="min-w-0" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          Answer under review. The available source does not include a complete option block for this item.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!canCheck || !selected}
          className="aurora-button-primary aurora-focus-ring px-5 text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          <CheckCircle2 size={15} /> Check answer
        </button>
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          disabled={!solution}
          className="aurora-button-secondary aurora-focus-ring px-5 text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Eye size={15} /> {revealed ? "Hide solution" : "Reveal solution"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setChecked(false);
            setRevealed(false);
          }}
          className="aurora-button-secondary aurora-focus-ring px-4 text-sm"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {answerUnderReview && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          <span className="inline-flex items-center gap-2"><CircleAlert size={16} /> Answer under review</span>
        </div>
      )}

      {checked && canCheck && (
        <div
          className="rounded-2xl border p-4 text-sm font-semibold leading-6"
          style={{
            borderColor: isCorrect ? "color-mix(in srgb, var(--aurora-success) 35%, transparent)" : "rgb(252 165 165)",
            background: isCorrect ? "rgba(16,185,129,0.10)" : "rgba(254,226,226,0.65)",
            color: isCorrect ? "rgb(6 95 70)" : "rgb(153 27 27)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isCorrect ? `Correct. Option ${correctAnswer} is the answer.` : `Incorrect. The correct option is ${correctAnswer}.`}
          </span>
        </div>
      )}

      {(checked || revealed || answerUnderReview) && (
        <section className="rounded-2xl border bg-white/85 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.05)]" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-emerald-800"><BookOpenCheck size={15} /> Final answer</h2>
          <p className="mt-3 text-2xl font-extrabold" style={{ color: correctAnswer ? "var(--aurora-text-primary)" : "var(--aurora-text-muted)" }}>
            {correctAnswer ? `Option ${correctAnswer}` : "Answer under review"}
          </p>
        </section>
      )}

      {showSolution ? (
        <section className="rounded-2xl border bg-white/85 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.05)]" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-emerald-800"><Eye size={15} /> Solution</h2>
          <IsiSolutionSteps content={solution ?? ""} />
        </section>
      ) : !solution ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Solution is not available for this item yet.</p>
      ) : null}
    </div>
  );
}

function normalizeAnswer(answer?: string | null): string | null {
  if (!answer) return null;
  const normalized = answer
    .replace(/\\boxed\s*\{\s*([^}]+)\s*\}/gi, "$1")
    .replace(/\\text\s*\{\s*([^}]+)\s*\}/gi, "$1")
    .replace(/[()]/g, " ")
    .replace(/\boption\b/gi, " ")
    .trim()
    .toUpperCase();
  const match = normalized.match(/\b([A-D])\b/);
  return match ? match[1] : null;
}

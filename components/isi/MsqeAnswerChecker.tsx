"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, RotateCcw, XCircle } from "lucide-react";
import type { IsiQuestionOption } from "@/types/isi";
import { IsiMathRenderer } from "@/components/isi/IsiMathRenderer";

export function MsqeAnswerChecker({
  options,
  answer,
  needsReview,
}: {
  options: IsiQuestionOption[];
  answer?: string | null;
  needsReview: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correctAnswer = useMemo(() => answer?.trim().toUpperCase() || null, [answer]);
  const isCorrect = checked && selected && correctAnswer && selected === correctAnswer;
  const isIncorrect = checked && selected && correctAnswer && selected !== correctAnswer;

  if (!options.length) {
    return (
      <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        The available source text does not include a full option block for this item, so the question is marked needsReview.
      </div>
    );
  }

  return (
    <section className="mt-7">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option.label;
          const isRightOption = checked && correctAnswer === option.label;
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
                borderColor: isRightOption
                  ? "var(--aurora-success)"
                  : isWrongSelected
                    ? "rgb(248 113 113)"
                    : isSelected
                      ? "var(--aurora-primary)"
                      : "var(--aurora-border-soft)",
                background: isRightOption
                  ? "rgba(16,185,129,0.12)"
                  : isWrongSelected
                    ? "rgba(254,226,226,0.75)"
                    : isSelected
                      ? "rgba(37,99,235,0.08)"
                      : "var(--aurora-background-soft)",
              }}
              aria-pressed={isSelected}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold shadow-sm"
                style={{ color: isWrongSelected ? "rgb(185 28 28)" : "var(--aurora-primary)" }}
              >
                {option.label}
              </span>
              <IsiMathRenderer content={option.text} className="min-w-0" />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!selected}
          className="aurora-button-primary aurora-focus-ring px-5 text-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          <CheckCircle2 size={15} /> Check answer
        </button>
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setChecked(false);
          }}
          className="aurora-button-secondary aurora-focus-ring px-4 text-sm"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {checked && (
        <div
          className="mt-4 rounded-2xl border p-4 text-sm font-semibold leading-6"
          style={{
            borderColor: isCorrect
              ? "color-mix(in srgb, var(--aurora-success) 35%, transparent)"
              : isIncorrect
                ? "rgb(252 165 165)"
                : "rgb(251 191 36)",
            background: isCorrect
              ? "rgba(16,185,129,0.10)"
              : isIncorrect
                ? "rgba(254,226,226,0.65)"
                : "rgba(254,243,199,0.72)",
            color: isCorrect ? "rgb(6 95 70)" : isIncorrect ? "rgb(153 27 27)" : "rgb(146 64 14)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            {isCorrect ? <CheckCircle2 size={16} /> : isIncorrect ? <XCircle size={16} /> : <CircleAlert size={16} />}
            {!correctAnswer
              ? "The answer key for this item needs review, so automatic feedback is paused."
              : isCorrect
                ? `Correct. Option ${correctAnswer} matches the current answer key.`
                : `Not quite. The current answer key is option ${correctAnswer}.`}
          </span>
          {needsReview && <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">Source review is still required for this item.</p>}
        </div>
      )}
    </section>
  );
}

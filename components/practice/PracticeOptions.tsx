"use client";

import { useState } from "react";
import { Check, CircleCheckBig, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";

export type PracticeChoice = { key: string; label: string; markdown: string };

/**
 * Selectable option list with an attempt flow:
 *  - pick an option, press "Check answer", get Correct/Incorrect
 *  - correct option is highlighted; a wrong selection is also highlighted
 *  - "Reveal answer" is offered as a secondary fallback (and is the only
 *    action when the item is not gradable, e.g. sequence answers)
 *
 * `onResolved` fires once the attempt is checked or the answer is revealed, so
 * the parent can disclose the answer/solution blocks.
 */
export function PracticeOptions({
  choices,
  correctKey,
  heading = "Options",
  onResolved,
}: {
  choices: PracticeChoice[];
  correctKey: string | null;
  heading?: string;
  onResolved?: (resolved: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const gradable = Boolean(correctKey);
  const resolved = checked || revealed;
  const isCorrect = checked && selected === correctKey;

  function handleCheck() {
    if (!selected || !gradable) return;
    setChecked(true);
    onResolved?.(true);
  }

  function handleReveal() {
    setRevealed(true);
    onResolved?.(true);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</p>
        {gradable && !resolved && (
          <p className="text-xs text-slate-600">Select an option, then check</p>
        )}
      </div>

      <div className="grid gap-3">
        {choices.map((choice) => {
          const isSelected = selected === choice.key;
          const isCorrectChoice = resolved && correctKey === choice.key;
          const isWrongSelected = checked && isSelected && selected !== correctKey;
          return (
            <button
              key={choice.key}
              type="button"
              disabled={!gradable || resolved}
              aria-pressed={isSelected}
              onClick={() => setSelected(choice.key)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                gradable && !resolved && "cursor-pointer hover:border-white/20 hover:bg-white/[0.04]",
                !gradable && "cursor-default",
                isCorrectChoice
                  ? "border-emerald-400/50 bg-emerald-400/[0.1]"
                  : isWrongSelected
                    ? "border-rose-400/50 bg-rose-400/[0.1]"
                    : isSelected && !resolved
                      ? "border-cyan-400/50 bg-cyan-400/[0.08]"
                      : "border-white/8 bg-white/[0.025]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  isCorrectChoice
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                    : isWrongSelected
                      ? "border-rose-400/40 bg-rose-400/15 text-rose-100"
                      : isSelected && !resolved
                        ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-50"
                        : "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200",
                )}
              >
                {isCorrectChoice ? <Check size={14} /> : isWrongSelected ? <X size={14} /> : choice.label}
              </span>
              <RichMathRenderer content={choice.markdown} compact className="min-w-0 flex-1" />
            </button>
          );
        })}
      </div>

      {!resolved && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          {gradable && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selected}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-cyan transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CircleCheckBig size={15} /> Check answer
            </button>
          )}
          <button
            type="button"
            onClick={handleReveal}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            <Eye size={14} /> Reveal answer
          </button>
        </div>
      )}

      {checked && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
            isCorrect
              ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200"
              : "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",
          )}
        >
          {isCorrect ? (
            <>
              <CircleCheckBig size={16} /> Correct
            </>
          ) : (
            <>
              <X size={16} /> Incorrect — the correct answer is highlighted, with the full solution below.
            </>
          )}
        </div>
      )}

      {revealed && !checked && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08] px-4 py-3 text-sm font-semibold text-emerald-200">
          <CircleCheckBig size={16} /> Answer revealed below.
        </div>
      )}
    </section>
  );
}

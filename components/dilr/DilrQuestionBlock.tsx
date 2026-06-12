"use client";

import { useState } from "react";
import { Bookmark, Check, X } from "lucide-react";
import type { DilrAnswerKey, DilrQuestion } from "@/types/dilr";
import { DilrMarkdown } from "@/components/dilr/DilrMarkdown";
import { isAnswerCorrect, type DilrAttemptRecord } from "@/components/dilr/useDilrProgress";

const MCQ_LETTERS = ["A", "B", "C", "D"];

/**
 * Focus Mode interactive question card — opaque, airy, no glow under text.
 * MCQ answers via A–D selectors, TITA via input; explicit "Check answer";
 * correct/incorrect feedback with the correct answer revealed after checking.
 * Answers come exclusively from the loaded answer key (never hardcoded).
 */
export function DilrQuestionBlock({
  question,
  answerKey,
  attempt,
  bookmarked,
  onCheck,
  onToggleBookmark,
}: {
  question: DilrQuestion;
  answerKey: DilrAnswerKey;
  attempt?: DilrAttemptRecord;
  bookmarked?: boolean;
  onCheck?: (questionId: string, answer: string, correct: boolean) => void;
  onToggleBookmark?: (questionId: string) => void;
}) {
  const keyEntry = answerKey.answers.find((item) => item.question_id === question.id);
  const isMcq = (keyEntry?.type ?? question.type).toUpperCase() === "MCQ";
  const [selected, setSelected] = useState<string>(attempt?.answer ?? "");
  const [typed, setTyped] = useState<string>(attempt?.answer ?? "");
  const [justChecked, setJustChecked] = useState(false);

  const letters =
    keyEntry && /^[Ee]$/.test(keyEntry.answer.trim()) ? [...MCQ_LETTERS, "E"] : MCQ_LETTERS;
  const given = isMcq ? selected : typed;
  const canCheck = Boolean(keyEntry) && given.trim().length > 0;
  const checked = Boolean(attempt);
  const correctAnswer = keyEntry?.answer ?? "";

  const handleCheck = () => {
    if (!keyEntry || !onCheck || !given.trim()) return;
    const correct = isAnswerCorrect(given, keyEntry.answer);
    onCheck(question.id, given.trim(), correct);
    setJustChecked(true);
  };

  const optionState = (letter: string): "correct" | "wrong" | "selected" | "idle" => {
    if (checked) {
      if (isAnswerCorrect(letter, correctAnswer)) return "correct";
      if (attempt && isAnswerCorrect(letter, attempt.answer) && !attempt.correct) return "wrong";
      return "idle";
    }
    return selected === letter ? "selected" : "idle";
  };

  return (
    <article className="aurora-reading-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: "var(--aurora-text-primary)" }}>
            {question.id}
          </h2>
          <span className="aurora-badge">{keyEntry?.type ?? question.type}</span>
          {checked && (
            <span
              className="aurora-badge"
              style={
                attempt?.correct
                  ? { color: "var(--aurora-success)", borderColor: "color-mix(in srgb, var(--aurora-success) 45%, transparent)" }
                  : { color: "var(--aurora-danger)", borderColor: "color-mix(in srgb, var(--aurora-danger) 45%, transparent)" }
              }
            >
              {attempt?.correct ? <Check size={11} aria-hidden /> : <X size={11} aria-hidden />}
              {attempt?.correct ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
        {onToggleBookmark && (
          <button
            type="button"
            aria-pressed={bookmarked}
            aria-label={bookmarked ? `Remove bookmark from ${question.id}` : `Bookmark ${question.id}`}
            onClick={() => onToggleBookmark(question.id)}
            className="aurora-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
            style={{
              borderColor: bookmarked ? "var(--aurora-primary-bright)" : "var(--aurora-border-soft)",
              color: bookmarked ? "var(--aurora-primary)" : "var(--aurora-text-muted)",
              background: bookmarked ? "var(--aurora-background-soft)" : "transparent",
            }}
          >
            <Bookmark size={16} aria-hidden fill={bookmarked ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <DilrMarkdown content={question.markdown || "Question text pending final review upload."} />
      </div>

      {/* answer controls */}
      {keyEntry && (
        <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
          {isMcq ? (
            <div role="radiogroup" aria-label={`Answer options for ${question.id}`} className="flex flex-wrap gap-2.5">
              {letters.map((letter) => {
                const state = optionState(letter);
                const palette =
                  state === "correct"
                    ? { borderColor: "var(--aurora-success)", background: "color-mix(in srgb, var(--aurora-success) 12%, transparent)", color: "#047857" }
                    : state === "wrong"
                      ? { borderColor: "var(--aurora-danger)", background: "color-mix(in srgb, var(--aurora-danger) 10%, transparent)", color: "var(--aurora-danger)" }
                      : state === "selected"
                        ? { borderColor: "var(--aurora-primary-bright)", background: "var(--aurora-background-soft)", color: "var(--aurora-primary)", boxShadow: "var(--aurora-glow-sm)" }
                        : { borderColor: "var(--aurora-border-strong)", color: "var(--aurora-text-secondary)" };
                return (
                  <button
                    key={letter}
                    type="button"
                    role="radio"
                    aria-checked={selected === letter}
                    onClick={() => {
                      setSelected(letter);
                      setJustChecked(false);
                    }}
                    className="aurora-focus-ring inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border px-4 text-sm font-bold transition-colors"
                    style={palette}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label htmlFor={`tita-${answerKey.set_id}-${question.id}`} className="sr-only">
                Your answer for {question.id}
              </label>
              <input
                id={`tita-${answerKey.set_id}-${question.id}`}
                type="text"
                inputMode="decimal"
                placeholder="Type your answer"
                value={typed}
                onChange={(event) => {
                  setTyped(event.target.value);
                  setJustChecked(false);
                }}
                className="aurora-focus-ring w-full max-w-[14rem] rounded-xl border px-4 py-2.5 text-sm font-semibold tabular-nums"
                style={{
                  borderColor: "var(--aurora-border-strong)",
                  background: "var(--aurora-surface)",
                  color: "var(--aurora-text-primary)",
                }}
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheck}
              disabled={!canCheck}
              aria-disabled={!canCheck}
              className="aurora-button-primary aurora-focus-ring px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: 40 }}
            >
              {checked ? "Check again" : "Check answer"}
            </button>
            <div aria-live="polite" className="text-sm font-medium">
              {checked && (
                <span style={{ color: attempt?.correct ? "#047857" : "var(--aurora-danger)" }}>
                  {attempt?.correct
                    ? justChecked
                      ? "Correct — well done."
                      : "Answered correctly."
                    : `Incorrect — correct answer: ${correctAnswer}`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

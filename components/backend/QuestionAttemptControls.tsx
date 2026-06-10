"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, CheckCircle2, CircleCheckBig, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttemptMeta } from "@/lib/backend/attempt-mapping";
import { useAttemptRecorder, useBookmark, useCurrentUserId } from "@/lib/backend/use-practice-progress";

/**
 * Attempt + bookmark controls for a question detail page.
 *
 * - Logged in: "Check answer" grades and saves an attempt; the bookmark button
 *   persists to Supabase.
 * - Anonymous / unconfigured: everything still works locally (grading happens
 *   client-side, bookmark toggles in memory) and a gentle "Log in to save
 *   progress" hint is shown. Never crashes.
 */
export function QuestionAttemptControls({ meta }: { meta: AttemptMeta }) {
  const { userId } = useCurrentUserId();
  const { record } = useAttemptRecorder();
  const { bookmarked, toggle, pending } = useBookmark({
    exam: meta.exam,
    section: meta.section,
    questionId: meta.questionId,
    questionSource: meta.questionSource,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const mountedAt = useRef<number>(Date.now());

  const isCorrect = useMemo(
    () => checked && meta.correctKey != null && selected === meta.correctKey,
    [checked, selected, meta.correctKey],
  );

  async function handleCheck() {
    if (!selected || !meta.gradable || checked) return;
    setChecked(true);
    const correct = selected === meta.correctKey;
    const timeSpentSeconds = Math.max(0, Math.round((Date.now() - mountedAt.current) / 1000));
    // Fire-and-forget; never blocks the UI and never throws.
    void record({
      exam: meta.exam,
      section: meta.section,
      questionId: meta.questionId,
      questionSource: meta.questionSource,
      selectedAnswer: selected,
      correctAnswer: meta.correctKey ?? meta.correctAnswerDisplay,
      isCorrect: correct,
      timeSpentSeconds,
      difficulty: meta.difficulty,
      topic: meta.topic,
      subtopic: meta.subtopic,
    });
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          {meta.gradable ? "Attempt this question" : "Save this question"}
        </p>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={bookmarked}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            bookmarked
              ? "border-cyan-400/30 bg-cyan-400/[0.1] text-cyan-200"
              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/30 hover:text-white",
          )}
        >
          {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      {meta.gradable ? (
        <>
          <p className="mt-4 text-xs text-slate-500">Select your answer, then check it.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {meta.optionKeys.map((key) => {
              const isSel = selected === key;
              const isCorrectKey = checked && key === meta.correctKey;
              const isWrongSel = checked && isSel && key !== meta.correctKey;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-all",
                    isCorrectKey
                      ? "border-emerald-400/50 bg-emerald-400/[0.12] text-emerald-100"
                      : isWrongSel
                        ? "border-rose-400/50 bg-rose-400/[0.12] text-rose-100"
                        : isSel
                          ? "border-cyan-400/50 bg-cyan-400/[0.12] text-cyan-50"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25",
                    !checked && "cursor-pointer",
                  )}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {!checked && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selected}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CircleCheckBig size={15} /> Check answer
            </button>
          )}

          {checked && (
            <div
              className={cn(
                "mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
                isCorrect
                  ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200"
                  : "border-rose-400/30 bg-rose-400/[0.08] text-rose-200",
              )}
            >
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? "Correct" : `Incorrect — correct answer is ${meta.correctKey}`}
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          Use “Reveal answer” below to check the solution. Bookmark it to revisit later.
        </p>
      )}

      {!userId && (
        <p className="mt-4 text-xs text-slate-500">
          <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>{" "}
          to save your progress and bookmarks.
        </p>
      )}
    </div>
  );
}

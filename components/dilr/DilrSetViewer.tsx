"use client";

import { Bookmark } from "lucide-react";
import type { DilrSetContent } from "@/types/dilr";
import { DilrMetadataCard } from "@/components/dilr/DilrMetadataCard";
import { DilrQuestionBlock } from "@/components/dilr/DilrQuestionBlock";
import { DilrSolutionPanel } from "@/components/dilr/DilrSolutionPanel";
import { DilrMarkdown } from "@/components/dilr/DilrMarkdown";
import { useDilrSetProgress } from "@/components/dilr/useDilrProgress";

/** Difficulty → accent token (shared with the Library mapping). */
function difficultyColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("very") || l.includes("expert")) return "var(--aurora-danger)";
  if (l.includes("hard")) return "var(--aurora-violet)";
  if (l.includes("med")) return "var(--aurora-cyan)";
  if (l.includes("easy")) return "var(--aurora-success)";
  return "var(--aurora-primary)";
}

/**
 * Aurora Glass Intelligence — Focus Mode practice viewer with local-first
 * progress. Calm reading lab: opaque surfaces, no decorative motion near
 * text. Attempts/bookmarks persist on this device via useDilrSetProgress.
 */
export function DilrSetViewer({ set }: { set: DilrSetContent }) {
  const { metadata } = set;
  const { setProgress, recordAttempt, toggleQuestionBookmark, toggleSetBookmark } =
    useDilrSetProgress({
      setId: metadata.set_id,
      title: metadata.title,
      questionCount: set.questions.length || metadata.question_count,
    });

  const attemptedCount = setProgress ? Object.keys(setProgress.attempts).length : 0;
  const correctCount = setProgress
    ? Object.values(setProgress.attempts).filter((a) => a.correct).length
    : 0;
  const totalQuestions = set.questions.length || metadata.question_count;

  return (
    <div style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}>
      {/* Thin aurora hairline — the only edge accent allowed in Focus mode. */}
      <div
        aria-hidden
        className="h-[3px] w-full"
        style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Title + metadata badges + set-level progress */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-cyan)" }}>
            {metadata.exam} · {metadata.section}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--aurora-text-primary)" }}>
              {metadata.title}
            </h1>
            <button
              type="button"
              aria-pressed={setProgress?.bookmarked ?? false}
              onClick={toggleSetBookmark}
              className="aurora-focus-ring inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors"
              style={{
                borderColor: setProgress?.bookmarked ? "var(--aurora-primary-bright)" : "var(--aurora-border-strong)",
                color: setProgress?.bookmarked ? "var(--aurora-primary)" : "var(--aurora-text-secondary)",
                background: setProgress?.bookmarked ? "var(--aurora-background-soft)" : "var(--aurora-surface)",
              }}
            >
              <Bookmark size={15} aria-hidden fill={setProgress?.bookmarked ? "currentColor" : "none"} />
              {setProgress?.bookmarked ? "Bookmarked" : "Bookmark set"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className="aurora-badge"
              style={{ color: difficultyColor(metadata.difficulty_label), borderColor: difficultyColor(metadata.difficulty_label) }}
            >
              {metadata.difficulty_label}
            </span>
            <span className="aurora-badge">{metadata.surface_family}</span>
            <span className="aurora-badge">{metadata.question_count} questions</span>
            <span className="aurora-badge">{metadata.estimated_time_min} min</span>
            <span className="aurora-badge tabular-nums">
              {attemptedCount}/{totalQuestions} attempted · {correctCount} correct
            </span>
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--aurora-text-muted)" }}>
            Progress is stored on this device. Sign-in sync will be added later.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 space-y-6">
            {/* Calm passage / set card */}
            <section className="aurora-reading-surface p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-primary)" }}>
                Set passage
              </p>
              <div className="mt-4 overflow-x-auto">
                <DilrMarkdown
                  content={set.passageMarkdown || set.setMarkdown || "Set passage pending final review upload."}
                />
              </div>
            </section>

            {/* Questions */}
            <section className="space-y-4">
              {set.questions.length > 0 ? (
                set.questions.map((question) => (
                  <DilrQuestionBlock
                    key={question.id}
                    question={question}
                    answerKey={set.answerKey}
                    attempt={setProgress?.attempts[question.id]}
                    bookmarked={setProgress?.bookmarkedQuestions.includes(question.id) ?? false}
                    onCheck={recordAttempt}
                    onToggleBookmark={toggleQuestionBookmark}
                  />
                ))
              ) : (
                <div
                  className="rounded-2xl border p-5 text-sm"
                  style={{
                    borderColor: "color-mix(in srgb, var(--aurora-warning) 35%, transparent)",
                    background: "color-mix(in srgb, var(--aurora-warning) 8%, transparent)",
                    color: "var(--aurora-text-secondary)",
                  }}
                >
                  Questions pending final review upload.
                </div>
              )}
            </section>

            <DilrSolutionPanel answerKey={set.answerKey} solutionMarkdown={set.solutionMarkdown} />
          </main>

          {/* Sticky side panel on desktop; stacks (non-sticky) on mobile. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <DilrMetadataCard metadata={set.metadata} />
          </div>
        </div>
      </div>
    </div>
  );
}

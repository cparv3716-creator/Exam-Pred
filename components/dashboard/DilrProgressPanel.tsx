"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, CheckCircle2, ListChecks, Play } from "lucide-react";
import { CommandPulse } from "@/components/dashboard/CommandPulse";
import { summarizeProgress, useDilrProgressStore } from "@/components/dilr/useDilrProgress";

/**
 * DilrProgressPanel — Command Mode "continue practice" strip backed by real
 * local DILR progress. Clean empty state when nothing has been attempted.
 */
export function DilrProgressPanel() {
  const store = useDilrProgressStore();
  const summary = store ? summarizeProgress(store) : null;
  const hasProgress = Boolean(summary && summary.lastSet && summary.attempted > 0);

  return (
    <div
      className="aurora-glass aurora-fade-slide-up relative mt-6 overflow-hidden p-6"
      style={{ boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-md)", animationDelay: "120ms" }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
      />
      <span
        aria-hidden
        className="aurora-scan-x absolute top-0 h-[3px] w-[18%]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)" }}
      />
      <CommandPulse size={120} className="absolute -right-6 -top-3 hidden opacity-60 md:block" />

      {hasProgress && summary && summary.lastSet ? (
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-cyan)" }}>
                Continue practice
              </p>
              <h2 className="mt-1 truncate text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
                {summary.lastSet.title}
              </h2>
              <p className="mt-1 text-sm tabular-nums" style={{ color: "var(--aurora-text-secondary)" }}>
                {summary.lastSet.attemptedCount}/{summary.lastSet.questionCount} questions attempted ·{" "}
                {summary.lastSet.completionPct}% of set
              </p>
            </div>
            <Link
              href={`/exams/cat/dilr/practice/${summary.lastSet.setId}`}
              className="aurora-button-primary aurora-focus-ring shrink-0 px-6 text-sm"
            >
              <Play size={15} aria-hidden /> Resume set
            </Link>
          </div>

          {/* completion bar */}
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--aurora-background-soft)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${summary.lastSet.completionPct}%`,
                background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))",
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="aurora-badge px-3 py-1.5 tabular-nums">
              <ListChecks size={12} aria-hidden /> {summary.attempted} attempted
            </span>
            <span
              className="aurora-badge px-3 py-1.5 tabular-nums"
              style={{ color: "var(--aurora-success)", borderColor: "color-mix(in srgb, var(--aurora-success) 40%, transparent)" }}
            >
              <CheckCircle2 size={12} aria-hidden /> {summary.correct} correct
            </span>
            <span className="aurora-badge px-3 py-1.5 tabular-nums">
              <Bookmark size={12} aria-hidden /> {summary.bookmarks} bookmarked
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>
            Progress is stored on this device. Sign-in sync will be added later.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-cyan)" }}>
              Continue practice
            </p>
            <h2 className="mt-1 text-lg font-bold" style={{ color: "var(--aurora-text-primary)" }}>
              Start a DILR set to unlock your progress cockpit.
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
              Attempts, accuracy and bookmarks will appear here. Progress is stored on this
              device — sign-in sync will be added later.
            </p>
          </div>
          <Link href="/exams/cat/dilr" className="aurora-button-primary aurora-focus-ring shrink-0 px-6 text-sm">
            Start DILR practice <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { summarizeProgress, useDilrProgressStore } from "@/components/dilr/useDilrProgress";

/**
 * DilrHubResume — small client add-on for the CAT hub DILR card. Shows a
 * resume line when local practice progress exists; renders nothing otherwise.
 */
export function DilrHubResume() {
  const store = useDilrProgressStore();
  if (!store) return null;
  const summary = summarizeProgress(store);
  if (!summary.lastSet || summary.attempted === 0) return null;

  return (
    <Link
      href={`/exams/cat/dilr/practice/${summary.lastSet.setId}`}
      className="aurora-focus-ring mt-3 inline-flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
      style={{
        borderColor: "var(--aurora-border-soft)",
        background: "var(--aurora-background-soft)",
        color: "var(--aurora-primary)",
      }}
    >
      <span className="truncate">
        Resume: {summary.lastSet.title}
        <span className="ml-2 tabular-nums" style={{ color: "var(--aurora-text-muted)" }}>
          {summary.lastSet.completionPct}% attempted
        </span>
      </span>
      <ArrowRight size={15} aria-hidden className="shrink-0" />
    </Link>
  );
}

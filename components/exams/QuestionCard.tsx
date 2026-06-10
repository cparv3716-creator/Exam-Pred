"use client";

import { BookOpen, ChevronDown, Tag } from "lucide-react";
import { useState } from "react";
import type { DemoQuestion } from "@/types/examiq";
import { DifficultyBadge, OutlinePill } from "@/components/ui/Badge";
import { ProbabilityRing } from "@/components/ui/ProbabilityMeter";
import { cn } from "@/lib/utils";

export function QuestionCard({
  question,
  showSolution = true,
  showAnalytics = false,
}: {
  question: DemoQuestion;
  showSolution?: boolean;
  showAnalytics?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <OutlinePill>{question.section}</OutlinePill>
            <OutlinePill>{question.year}</OutlinePill>
            <OutlinePill>{question.slot}</OutlinePill>
            <DifficultyBadge level={question.difficulty} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{question.questionText}</p>
        </div>
        {showAnalytics && <ProbabilityRing value={question.probability} label="prob" />}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(["a", "b", "c", "d"] as const).map((key) => {
          const isCorrect = showSolution && question.correct === key;
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                isCorrect
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                  : "border-white/8 bg-white/[0.02] text-slate-300",
              )}
            >
              <span className="font-semibold uppercase text-slate-500">{key}.</span>
              <span>{question.options[key]}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Tag size={12} /> {question.topic}
        </span>
        <span className="text-slate-700">/</span>
        <span>{question.subtopic}</span>
        <span className="text-slate-700">/</span>
        <span className="italic">{question.archetype}</span>
      </div>

      {showSolution && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen size={15} className="text-cyan-300" /> Detailed solution
          </span>
          <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
        </button>
      )}

      {open && showSolution && (
        <div className="mt-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04] p-4 text-sm leading-relaxed text-slate-300 animate-fade-up">
          {question.solution}
        </div>
      )}
    </div>
  );
}

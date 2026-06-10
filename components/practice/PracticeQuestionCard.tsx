"use client";

import Link from "next/link";
import { ArrowRight, Crown, Lock, Timer } from "lucide-react";
import type { GeneratedPracticeQuestion } from "@/types/practice";
import { OutlinePill } from "@/components/ui/Badge";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";
import { formatQuestionToMarkdown } from "@/lib/content/practice/solution-formatting";
import { cn } from "@/lib/utils";

export function PracticeQuestionCard({
  question,
  locked = false,
}: {
  question: GeneratedPracticeQuestion;
  locked?: boolean;
}) {
  const href = `/exams/cat/quant/practice/${question.question_id}`;
  const previewMarkdown =
    question.question_text_markdown ??
    formatQuestionToMarkdown(question.question_text_repaired ?? question.question_text_display ?? question.question_text);

  return (
    <article className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-cyan-400/25 hover:bg-white/[0.045]">
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/64 p-5 backdrop-blur-[5px]">
          <div className="max-w-xs text-center">
            {question.practice_level === "Advanced" ? (
              <Crown size={20} className="mx-auto text-purple-300" />
            ) : (
              <Lock size={20} className="mx-auto text-purple-300" />
            )}
            <p className="mt-2 text-sm font-semibold text-white">
              {question.practice_level === "Advanced"
                ? "Advanced practice is Premium only"
                : "Sign up to unlock practice"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {question.practice_level === "Advanced"
                ? "Upgrade to Premium to access tough CAT-level simulations."
                : "Create a free account to start practicing."}
            </p>
          </div>
        </div>
      )}

      <div className={cn(locked && "blur-[2px] select-none")}>
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <OutlinePill>{question.difficulty}</OutlinePill>
          <OutlinePill>{question.question_type}</OutlinePill>
          {question.estimated_time && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
              <Timer size={11} /> {question.estimated_time}
            </span>
          )}
        </div>

        {/* Topic breadcrumb */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-400">{question.topic}</span>
          <span>/</span>
          <span>{question.subtopic}</span>
        </div>

        <RichMathRenderer content={previewMarkdown} compact className="mt-3 text-sm leading-relaxed text-slate-300" />

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-600">{question.practice_level}</span>
          {locked ? (
            <Link
              href={question.practice_level === "Advanced" ? "/pricing" : "/signup"}
              className="inline-flex items-center gap-1 rounded-lg border border-purple-400/25 bg-purple-400/[0.06] px-3 py-1.5 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-400/[0.1]"
            >
              {question.practice_level === "Advanced" ? <Crown size={11} /> : <Lock size={11} />}
              {question.practice_level === "Advanced" ? "Upgrade" : "Sign up"}
            </Link>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/[0.1]"
            >
              Practice <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

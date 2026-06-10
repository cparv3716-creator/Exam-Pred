"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, CircleCheckBig, Eye, Sparkles } from "lucide-react";
import type { VarcSourceQuestion } from "@/types/varc-practice";
import { RichMathRenderer } from "@/components/practice/RichMathRenderer";
import { PracticeOptions, type PracticeChoice } from "@/components/practice/PracticeOptions";

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

export type PassageNav = {
  current: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
};

export function VarcSourceQuestionViewer({
  question,
  passageText,
  passageNav,
}: {
  question: VarcSourceQuestion;
  passageText?: string;
  passageNav?: PassageNav | null;
}) {
  const [resolved, setResolved] = useState(false);

  const isRc = question.varc_type === "RC";
  const isTita = question.varc_type === "Para Jumble" || question.varc_type === "Odd Sentence Out";
  const passage = (passageText ?? question.passage_text_markdown ?? "").trim();

  const rawOptions = [
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
    question.option_e_markdown,
  ];
  const choices: PracticeChoice[] = rawOptions
    .map((markdown, index) => {
      const label = isTita ? String(index + 1) : OPTION_LABELS[index];
      return { key: label, label, markdown };
    })
    .filter((choice) => choice.markdown.trim());
  const hasOptions = choices.length > 0;

  const correctKey = resolveCorrectKey(question, choices);
  const answerLabel = buildAnswerLabel(question.correct_answer, rawOptions, isTita, question.varc_type);
  const hasSolution = Boolean(question.detailed_solution_markdown?.trim());

  return (
    <div className="space-y-8">
      {/* RC passage — premium reading interface */}
      {isRc && passage && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              <BookOpen size={14} /> Passage
            </p>
            {passageNav && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Question {passageNav.current} of {passageNav.total} in this passage
                </span>
                <PassageStep href={passageNav.prevHref} direction="prev" />
                <PassageStep href={passageNav.nextHref} direction="next" />
              </div>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-white/8 bg-ink-900/40 p-6 sm:p-8">
            <div className="mx-auto max-w-[68ch]">
              <RichMathRenderer content={passage} reading />
            </div>
          </div>
        </section>
      )}

      {/* Question */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Question</p>
        <RichMathRenderer
          content={question.question_text_markdown || question.source_raw_block}
          className="mt-4 text-[15px] sm:text-base"
        />
      </section>

      {/* Options / attempt */}
      {hasOptions ? (
        <PracticeOptions
          choices={choices}
          correctKey={correctKey}
          heading={isTita ? "Sentences" : "Options"}
          onResolved={() => setResolved(true)}
        />
      ) : (
        !resolved && (
          <button
            type="button"
            onClick={() => setResolved(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/[0.12]"
          >
            <Eye size={15} /> Reveal answer
          </button>
        )
      )}

      {/* Answer */}
      {resolved && (
        <section className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5 animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <CircleCheckBig size={14} /> Answer
          </p>
          <p className="mt-2 font-semibold text-emerald-50">{answerLabel}</p>
        </section>
      )}

      {/* Solution */}
      {resolved && hasSolution && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 animate-fade-up">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-purple-300">
            <Sparkles size={14} /> Detailed solution
          </p>
          <RichMathRenderer content={question.detailed_solution_markdown} className="mt-4" />
        </section>
      )}
    </div>
  );
}

function PassageStep({ href, direction }: { href: string | null; direction: "prev" | "next" }) {
  const label = direction === "prev" ? "Previous question in passage" : "Next question in passage";
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  if (!href) {
    return (
      <span
        aria-disabled
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/[0.02] text-slate-700"
      >
        <Icon size={15} />
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
    >
      <Icon size={15} />
    </Link>
  );
}

function resolveCorrectKey(question: VarcSourceQuestion, choices: PracticeChoice[]): string | null {
  const answer = (question.correct_answer ?? "").trim();
  if (!answer) return null;
  if (question.varc_type === "Para Jumble") return null; // sequence answer — not single-select
  if (question.varc_type === "Odd Sentence Out") {
    return choices.some((choice) => choice.key === answer) ? answer : null;
  }
  const letter = answer.toUpperCase();
  return /^[A-E]$/.test(letter) && choices.some((choice) => choice.key === letter) ? letter : null;
}

function buildAnswerLabel(answer: string, options: string[], isTita: boolean, varcType: string): string {
  if (!answer) return "—";

  if (isTita) {
    if (varcType === "Odd Sentence Out") return `Sentence ${answer} is the odd one out`;
    if (varcType === "Para Jumble") {
      const seq = answer.split("").map((d) => `Sentence ${d}`).join(" → ");
      return `${answer}   (${seq})`;
    }
    return answer;
  }

  // MCQ: map A/B/C/D to option text
  const idx = ["A", "B", "C", "D", "E"].indexOf(answer.toUpperCase());
  const optText = idx >= 0 ? options[idx]?.trim() : "";
  if (optText) {
    const preview = optText.slice(0, 120);
    return `Option ${answer.toUpperCase()}${preview ? `: ${preview}${optText.length > 120 ? "…" : ""}` : ""}`;
  }

  // Sentence placement bare letter
  return `Position ${answer.toUpperCase()}`;
}

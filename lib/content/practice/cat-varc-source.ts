import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { PracticeLevel } from "@/types/practice";
import type { VarcSourceQuestion, VarcSourceStats, VarcType } from "@/types/varc-practice";

const bankPath = path.join(process.cwd(), "content/cat/practice/generated/cat_varc_source_practice.json");

export function getCatVarcSourceQuestions(): VarcSourceQuestion[] {
  if (!fs.existsSync(bankPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(bankPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isVarcSourceQuestion).filter((q) => !isDuplicatePhantomRow(q));
  } catch {
    return [];
  }
}

/**
 * The source bank contains phantom duplicate rows whose `question_id` ends in
 * `_DUP`, `_DUP2`, … . They repeat an existing base question and frequently
 * carry that question's *solution* in the `question_text` field (so a stray
 * "Answer: 5. …" shows up as if it were a new question) and duplicate RC rows
 * within a passage set. Every such row has a non-suffixed base row, so hiding
 * them loses no content. The underlying JSON is never modified — this is a
 * read-time, student-facing filter only.
 */
function isDuplicatePhantomRow(q: VarcSourceQuestion): boolean {
  return /_DUP\d*$/i.test(q.question_id ?? "");
}

export function getCatVarcSourceByLevel(level: PracticeLevel): VarcSourceQuestion[] {
  return getCatVarcSourceQuestions().filter((q) => q.practice_level === level);
}

export function getCatVarcSourceById(questionId: string): VarcSourceQuestion | null {
  return getCatVarcSourceQuestions().find((q) => q.question_id === questionId) ?? null;
}

export function getCatVarcSourceByType(varcType: VarcType): VarcSourceQuestion[] {
  return getCatVarcSourceQuestions().filter((q) => q.varc_type === varcType);
}

/** Stable grouping key for an RC passage: prefer passage_id, fall back to file + set. */
function passageKey(q: VarcSourceQuestion): string {
  const id = (q.passage_id ?? "").trim();
  if (id) return id;
  return `${q.source_file ?? ""}#${q.source_set_number ?? ""}`;
}

/** All visible RC questions that belong to the same passage, in source order. */
export function getCatVarcPassageGroup(question: VarcSourceQuestion): VarcSourceQuestion[] {
  if (question.varc_type !== "RC") return [question];
  const key = passageKey(question);
  return getCatVarcSourceQuestions()
    .filter((q) => q.varc_type === "RC" && passageKey(q) === key)
    .sort(
      (a, b) =>
        (a.source_question_number ?? 0) - (b.source_question_number ?? 0) ||
        a.question_id.localeCompare(b.question_id),
    );
}

/** Resolve the full passage text for a question, falling back across its passage group. */
export function getCatVarcPassageText(question: VarcSourceQuestion): string {
  if ((question.passage_text_markdown ?? "").trim()) return question.passage_text_markdown;
  const fromGroup = getCatVarcPassageGroup(question).find((q) => (q.passage_text_markdown ?? "").trim());
  return fromGroup?.passage_text_markdown ?? "";
}

/** Resolve a passage title from the question or its group. */
export function getCatVarcPassageTitle(question: VarcSourceQuestion): string {
  if ((question.passage_title ?? "").trim()) return question.passage_title;
  const fromGroup = getCatVarcPassageGroup(question).find((q) => (q.passage_title ?? "").trim());
  return fromGroup?.passage_title ?? "";
}

/**
 * Position of a question within its passage set, with in-passage prev/next ids.
 * Returns null when the question is not part of a multi-question RC passage.
 */
export function getCatVarcPassagePosition(question: VarcSourceQuestion): {
  current: number;
  total: number;
  prevId: string | null;
  nextId: string | null;
} | null {
  if (question.varc_type !== "RC") return null;
  const group = getCatVarcPassageGroup(question);
  if (group.length <= 1) return null;
  const idx = group.findIndex((q) => q.question_id === question.question_id);
  if (idx === -1) return null;
  return {
    current: idx + 1,
    total: group.length,
    prevId: idx > 0 ? group[idx - 1].question_id : null,
    nextId: idx < group.length - 1 ? group[idx + 1].question_id : null,
  };
}

/** Prev/next ids in the visible source-bank order for whole-bank navigation. */
export function getCatVarcSourceNeighbors(questionId: string): {
  prevId: string | null;
  nextId: string | null;
  index: number;
  total: number;
} {
  const all = getCatVarcSourceQuestions();
  const i = all.findIndex((q) => q.question_id === questionId);
  if (i === -1) return { prevId: null, nextId: null, index: -1, total: all.length };
  return {
    prevId: i > 0 ? all[i - 1].question_id : null,
    nextId: i < all.length - 1 ? all[i + 1].question_id : null,
    index: i,
    total: all.length,
  };
}

export function getCatVarcSourceStats(): VarcSourceStats {
  const all = getCatVarcSourceQuestions();
  const rc = all.filter((q) => q.varc_type === "RC");
  const va = all.filter((q) => q.varc_type !== "RC");
  const passages = unique(all.map((q) => q.passage_id).filter(Boolean));
  const visible = all.filter((q) => q.student_visible);

  return {
    total: all.length,
    beginner: countBy(all, (q) => q.practice_level === "Beginner"),
    intermediate: countBy(all, (q) => q.practice_level === "Intermediate"),
    advanced: countBy(all, (q) => q.practice_level === "Advanced"),
    rcPassages: passages.length,
    rcQuestions: rc.length,
    vaQuestions: va.length,
    studentVisible: visible.length,
    hiddenOrReview: all.length - visible.length,
    completeRcSet: countBy(all, (q) => q.parse_status === "complete_rc_set"),
    completeVaQuestion: countBy(all, (q) => q.parse_status === "complete_va_question"),
    rawBlockFallback: countBy(all, (q) => q.parse_status === "raw_block_fallback"),
    missingAnswer: countBy(all, (q) => q.parse_status === "missing_answer"),
    missingOptions: countBy(all, (q) => q.parse_status === "missing_options"),
    parseStatusCounts: toCounts(all.map((q) => q.parse_status)),
    varcTypeCounts: toCounts(all.map((q) => q.varc_type)),
    sourceFiles: unique(all.map((q) => q.source_file)),
  };
}

function isVarcSourceQuestion(input: unknown): input is VarcSourceQuestion {
  if (!input || typeof input !== "object") return false;
  const q = input as Partial<VarcSourceQuestion>;
  return Boolean(q.question_id && q.section === "VARC" && q.student_visible === true);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function countBy<T>(items: T[], pred: (v: T) => boolean): number {
  return items.filter(pred).length;
}

function toCounts(values: string[]): Array<{ label: string; count: number }> {
  const m: Record<string, number> = {};
  for (const v of values) m[v || "Unmapped"] = (m[v || "Unmapped"] ?? 0) + 1;
  return Object.entries(m)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

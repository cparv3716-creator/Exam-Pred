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
    return parsed.filter(isVarcSourceQuestion);
  } catch {
    return [];
  }
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

import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { LocalPyqCleanRow } from "@/lib/content/validators/types";

export type PyqStats = {
  rowCount: number;
  topicCount: number;
  subtopicCount: number;
  yearCount: number;
  freeCount: number;
  premiumCount: number;
  files: string[];
};

export function getExamPyqs(examSlug: string): LocalPyqCleanRow[] {
  const files = getValidatedPyqFiles(examSlug);
  return files.flatMap((file) => readValidatedFile(file));
}

export function getPyqFilters(examSlug: string) {
  const rows = getExamPyqs(examSlug);
  return {
    topics: unique(rows.map((row) => row.topic).filter(Boolean)),
    subtopics: unique(rows.map((row) => row.subtopic).filter(Boolean)),
    years: unique(rows.map((row) => String(row.year ?? "")).filter(Boolean)),
    difficulties: unique(rows.map((row) => row.difficulty).filter(Boolean)),
    questionTypes: unique(rows.map((row) => row.question_type).filter(Boolean)),
  };
}

export function getPyqStats(examSlug: string): PyqStats {
  const rows = getExamPyqs(examSlug);
  const files = getValidatedPyqFiles(examSlug).map((file) => path.relative(process.cwd(), file).replace(/\\/g, "/"));

  return {
    rowCount: rows.length,
    topicCount: unique(rows.map((row) => row.topic).filter(Boolean)).length,
    subtopicCount: unique(rows.map((row) => row.subtopic).filter(Boolean)).length,
    yearCount: unique(rows.map((row) => String(row.year ?? "")).filter(Boolean)).length,
    freeCount: rows.filter((row) => row.is_free).length,
    premiumCount: rows.filter((row) => row.is_premium).length,
    files,
  };
}

export function getPyqsByTopic(examSlug: string, topic: string) {
  const normalizedTopic = topic.trim().toLowerCase();
  return getExamPyqs(examSlug).filter((row) => row.topic.trim().toLowerCase() === normalizedTopic);
}

export function getPyqCoverageSummary(examSlug: string) {
  const rows = getExamPyqs(examSlug);
  const byTopic = new Map<string, { topic: string; count: number; freeCount: number; premiumCount: number; subtopics: Set<string> }>();

  for (const row of rows) {
    const key = row.topic || "Unmapped";
    const current = byTopic.get(key) ?? {
      topic: key,
      count: 0,
      freeCount: 0,
      premiumCount: 0,
      subtopics: new Set<string>(),
    };
    current.count += 1;
    if (row.is_free) current.freeCount += 1;
    if (row.is_premium) current.premiumCount += 1;
    if (row.subtopic) current.subtopics.add(row.subtopic);
    byTopic.set(key, current);
  }

  return Array.from(byTopic.values())
    .map((item) => ({
      topic: item.topic,
      count: item.count,
      freeCount: item.freeCount,
      premiumCount: item.premiumCount,
      subtopicCount: item.subtopics.size,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getValidatedPyqFiles(examSlug: string) {
  const directory = path.join(process.cwd(), "content", examSlug, "pyqs", "validated");
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .map((file) => path.join(directory, file));
}

function readValidatedFile(absolutePath: string): LocalPyqCleanRow[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalPyqRow);
  } catch {
    return [];
  }
}

function isLocalPyqRow(input: unknown): input is LocalPyqCleanRow {
  if (!input || typeof input !== "object") return false;
  const row = input as Partial<LocalPyqCleanRow>;
  return Boolean(row.exam_slug && row.question_id && row.question_text && row.question_type);
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

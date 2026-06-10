import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { PracticeLevel } from "@/types/practice";
import type { LatexSourcePracticeQuestion, LatexSourcePracticeStats } from "@/types/latex-practice";

const bankPath = path.join(process.cwd(), "content/cat/practice/generated/cat_quant_latex_source_practice.json");
const latexDir = path.join(process.cwd(), "content/cat/practice/latex_sources");

export function getCatQuantLatexSourceQuestions(): LatexSourcePracticeQuestion[] {
  if (!fs.existsSync(bankPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(bankPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLatexSourceQuestion);
  } catch {
    return [];
  }
}

export function getCatQuantLatexSourceByLevel(level: PracticeLevel) {
  return getCatQuantLatexSourceQuestions().filter((question) => question.practice_level === level);
}

export function getCatQuantLatexSourceById(questionId: string) {
  return getCatQuantLatexSourceQuestions().find((question) => question.question_id === questionId) ?? null;
}

export function getCatQuantLatexSourceStats(): LatexSourcePracticeStats {
  const questions = getCatQuantLatexSourceQuestions();
  const sourceFiles = unique(questions.map((question) => question.source_tex_file));
  return {
    total: questions.length,
    beginner: countBy(questions, (question) => question.practice_level === "Beginner"),
    intermediate: countBy(questions, (question) => question.practice_level === "Intermediate"),
    advanced: countBy(questions, (question) => question.practice_level === "Advanced"),
    fullParse: countBy(questions, (question) => question.parse_status === "full_parse"),
    rawFallback: countBy(questions, (question) => question.parse_status === "raw_block_render"),
    missingOptions: countBy(questions, hasMissingOptions),
    missingSolutions: countBy(questions, (question) => !question.detailed_solution_markdown.trim()),
    filesFound: getTexFileCount(),
    sourceFiles,
    topicCount: unique(questions.map((question) => question.topic)).length,
    subtopicCount: unique(questions.map((question) => question.subtopic)).length,
    parseStatusCounts: toCounts(questions.map((question) => question.parse_status)),
  };
}

export function getCatQuantLatexSourceFilters() {
  const questions = getCatQuantLatexSourceQuestions();
  return {
    topics: unique(questions.map((question) => question.topic)),
    subtopics: unique(questions.map((question) => question.subtopic)),
    difficulties: unique(questions.map((question) => question.difficulty)),
    questionTypes: unique(questions.map((question) => question.question_type)),
    sourceFiles: unique(questions.map((question) => question.source_tex_file)),
  };
}

function isLatexSourceQuestion(input: unknown): input is LatexSourcePracticeQuestion {
  if (!input || typeof input !== "object") return false;
  const question = input as Partial<LatexSourcePracticeQuestion>;
  return Boolean(question.question_id && question.display_source === "latex_source_direct" && question.student_visible === true);
}

function hasMissingOptions(question: LatexSourcePracticeQuestion) {
  return question.question_type === "MCQ" && ![question.option_a_markdown, question.option_b_markdown, question.option_c_markdown, question.option_d_markdown].every((option) => option.trim());
}

function getTexFileCount() {
  if (!fs.existsSync(latexDir)) return 0;
  return fs.readdirSync(latexDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".tex")).length;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function countBy<T>(items: T[], predicate: (item: T) => boolean) {
  return items.filter(predicate).length;
}

function toCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((record, value) => {
    record[value || "Unmapped"] = (record[value || "Unmapped"] ?? 0) + 1;
    return record;
  }, {});
  return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}
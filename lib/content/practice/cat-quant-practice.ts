import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeManifest, GeneratedPracticeQuestion, PracticeLevel } from "@/types/practice";
import { topicToSlug } from "@/lib/content/practice/topic-slugs";
import { hasSeriousMathResidue } from "@/lib/content/practice/solution-formatting";

const practicePath = path.join(process.cwd(), "content/cat/practice/generated/cat_quant_generated_practice.json");
const manifestPath = path.join(process.cwd(), "content/cat/practice/manifests/cat_quant_practice_manifest.json");
const sourcePath = path.join(process.cwd(), "content/cat/practice/imports/generated_question_pool_combined_recalibrated_for_website.csv");
const reportPath = path.join(process.cwd(), "reports/local_imports/cat_quant_generated_practice_import_report.md");

export type CatQuantPracticeStats = {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  freeAccess: number;
  freeLimited: number;
  premiumOnly: number;
  advancedPremiumOnly: number;
  pncProbability: number;
  topicCount: number;
  subtopicCount: number;
  qualityTierCounts: Array<{ label: string; count: number }>;
  levelCounts: Array<{ label: PracticeLevel; count: number }>;
  difficultyCountsByLevel: Array<{ level: PracticeLevel; difficulty: string; count: number }>;
  hardVeryHardInBeginner: number;
  easyMediumInAdvanced: number;
  rowsNeedingCleanup: number;
  cleanupWarningCount: number;
  lastImportTime: string;
  sourceFileExists: boolean;
  generatedFileExists: boolean;
  manifestExists: boolean;
  reportExists: boolean;
};

export function getCatQuantPracticeQuestions(options: { includeReview?: boolean } = {}): GeneratedPracticeQuestion[] {
  if (!fs.existsSync(practicePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(practicePath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    const questions = parsed.filter(isGeneratedPracticeQuestion);
    return options.includeReview ? questions : questions.filter(isStudentSafeQuestion);
  } catch {
    return [];
  }
}

export function getCatQuantPracticeByLevel(level: PracticeLevel) {
  return getCatQuantPracticeQuestions().filter((question) => question.practice_level === level);
}

export function getCatQuantPracticeById(questionId: string, options: { includeReview?: boolean } = {}): GeneratedPracticeQuestion | null {
  return getCatQuantPracticeQuestions(options).find((q) => q.question_id === questionId) ?? null;
}

export function getCatQuantPracticeByTopic(topic: string) {
  const decodedTopic = decodeURIComponent(topic).trim().toLowerCase();
  return getCatQuantPracticeQuestions().filter((question) => {
    return (
      question.topic.trim().toLowerCase() === decodedTopic ||
      question.topic_group.trim().toLowerCase() === decodedTopic ||
      topicToSlug(question.topic) === decodedTopic ||
      topicToSlug(question.topic_group) === decodedTopic
    );
  });
}

export function getCatQuantPracticeStats(): CatQuantPracticeStats {
  const questions = getCatQuantPracticeQuestions({ includeReview: true });
  const manifest = getCatQuantPracticeManifest();

  return {
    total: questions.length,
    beginner: countBy(questions, (question) => question.practice_level === "Beginner"),
    intermediate: countBy(questions, (question) => question.practice_level === "Intermediate"),
    advanced: countBy(questions, (question) => question.practice_level === "Advanced"),
    freeAccess: countBy(questions, (question) => question.access_tier === "free"),
    freeLimited: countBy(questions, (question) => question.access_tier === "free_limited"),
    premiumOnly: countBy(questions, (question) => question.access_tier === "premium"),
    advancedPremiumOnly: countBy(questions, (question) => question.practice_level === "Advanced" && question.access_tier === "premium"),
    pncProbability: countBy(questions, (question) => question.topic_group === "P&C / Probability"),
    topicCount: unique(questions.map((question) => question.topic)).length,
    subtopicCount: unique(questions.map((question) => question.subtopic)).length,
    qualityTierCounts: toCounts(questions.map((question) => question.quality_tier)),
    levelCounts: [
      { label: "Beginner", count: countBy(questions, (question) => question.practice_level === "Beginner") },
      { label: "Intermediate", count: countBy(questions, (question) => question.practice_level === "Intermediate") },
      { label: "Advanced", count: countBy(questions, (question) => question.practice_level === "Advanced") },
    ],
    difficultyCountsByLevel: getDifficultyCountsByLevel(questions),
    hardVeryHardInBeginner: countBy(questions, (question) => question.practice_level === "Beginner" && /hard/i.test(question.difficulty)),
    easyMediumInAdvanced: countBy(questions, (question) => question.practice_level === "Advanced" && /^(Easy|Medium)$/i.test(question.difficulty)),
    rowsNeedingCleanup: questions.filter((question) => question.cleanup_notes.length > 0).length,
    cleanupWarningCount: questions.reduce((count, question) => count + question.cleanup_notes.length, 0),
    lastImportTime: manifest?.imported_at ?? "",
    sourceFileExists: fs.existsSync(sourcePath),
    generatedFileExists: fs.existsSync(practicePath),
    manifestExists: fs.existsSync(manifestPath),
    reportExists: fs.existsSync(reportPath),
  };
}

export function getCatQuantPracticeFilters() {
  const questions = getCatQuantPracticeQuestions();
  return {
    topics: unique(questions.map((question) => question.topic)),
    subtopics: unique(questions.map((question) => question.subtopic)),
    questionTypes: unique(questions.map((question) => question.question_type)),
    difficulties: unique(questions.map((question) => question.difficulty)),
    qualityTiers: unique(questions.map((question) => question.quality_tier)),
    practiceLevels: unique(questions.map((question) => question.practice_level)),
  };
}

export function getCatQuantPracticeCoverage(options: { includeReview?: boolean } = {}) {
  const byTopic = new Map<string, {
    topic: string;
    count: number;
    beginner: number;
    intermediate: number;
    advanced: number;
    premiumOnly: number;
    subtopics: Set<string>;
  }>();

  for (const question of getCatQuantPracticeQuestions(options)) {
    const current = byTopic.get(question.topic) ?? {
      topic: question.topic,
      count: 0,
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      premiumOnly: 0,
      subtopics: new Set<string>(),
    };
    current.count += 1;
    if (question.practice_level === "Beginner") current.beginner += 1;
    if (question.practice_level === "Intermediate") current.intermediate += 1;
    if (question.practice_level === "Advanced") current.advanced += 1;
    if (question.access_tier === "premium") current.premiumOnly += 1;
    if (question.subtopic) current.subtopics.add(question.subtopic);
    byTopic.set(question.topic, current);
  }

  return Array.from(byTopic.values())
    .map((item) => ({
      topic: item.topic,
      count: item.count,
      beginner: item.beginner,
      intermediate: item.intermediate,
      advanced: item.advanced,
      premiumOnly: item.premiumOnly,
      subtopicCount: item.subtopics.size,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getCatQuantPracticeManifest(): GeneratedPracticeManifest | null {
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as GeneratedPracticeManifest;
  } catch {
    return null;
  }
}

function isGeneratedPracticeQuestion(input: unknown): input is GeneratedPracticeQuestion {
  if (!input || typeof input !== "object") return false;
  const question = input as Partial<GeneratedPracticeQuestion>;
  return Boolean(question.question_id && question.question_text && question.practice_level && question.content_type === "generated_practice");
}

function isStudentSafeQuestion(question: GeneratedPracticeQuestion) {
  if (question.completeness_status === "likely_incomplete") return false;
  if (question.completeness_status === "source_not_found") return false;
  if (question.completeness_status === "needs_manual_review") return false;
  if (question.completeness_status === "hide_until_repaired") return false;
  if (question.content_status === "hide_from_student") return false;
  if (question.content_status === "incomplete_question" || question.content_status === "broken_options") return false;
  if (question.content_status === "needs_math_review") return false;
  // Defensive runtime guard: never expose a question/option/answer whose markdown is
  // still raw-damaged, even if the stored status drifted out of date.
  if (hasSeriousStudentResidue(question)) return false;
  if (question.content_status === "needs_solution_review") return hasRequiredStudentContent(question);
  return question.math_review_status === "clean" || question.math_review_status === "safe_display";
}

function hasSeriousStudentResidue(question: GeneratedPracticeQuestion) {
  const fields = [
    question.question_text_markdown,
    question.correct_answer_markdown,
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
  ];
  return fields.some((field) => field && hasSeriousMathResidue(field));
}

function hasRequiredStudentContent(question: GeneratedPracticeQuestion) {
  const hasQuestion = Boolean((question.question_text_repaired ?? question.question_text_display ?? question.question_text)?.trim());
  const hasAnswer = Boolean((question.correct_answer_display ?? question.correct_answer)?.trim());
  const hasSolution = Boolean((question.detailed_solution_repaired ?? question.detailed_solution_display ?? question.detailed_solution)?.trim());
  const hasOptions =
    question.question_type !== "MCQ" && question.question_type !== "MSQ"
      ? true
      : [question.option_a_repaired ?? question.option_a_display ?? question.option_a,
          question.option_b_repaired ?? question.option_b_display ?? question.option_b,
          question.option_c_repaired ?? question.option_c_display ?? question.option_c,
          question.option_d_repaired ?? question.option_d_display ?? question.option_d].every((option) => option?.trim());
  return hasQuestion && hasAnswer && hasSolution && hasOptions;
}

function countBy<T>(items: T[], predicate: (item: T) => boolean) {
  return items.filter(predicate).length;
}

function toCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((record, value) => {
    const label = value || "Unmapped";
    record[label] = (record[label] ?? 0) + 1;
    return record;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function getDifficultyCountsByLevel(questions: GeneratedPracticeQuestion[]) {
  const counts = new Map<string, { level: PracticeLevel; difficulty: string; count: number }>();
  for (const question of questions) {
    const key = `${question.practice_level}::${question.difficulty}`;
    const current = counts.get(key) ?? { level: question.practice_level, difficulty: question.difficulty || "Unmapped", count: 0 };
    current.count += 1;
    counts.set(key, current);
  }
  return Array.from(counts.values()).sort((a, b) => levelOrder(a.level) - levelOrder(b.level) || a.difficulty.localeCompare(b.difficulty));
}

function levelOrder(level: PracticeLevel) {
  if (level === "Beginner") return 0;
  if (level === "Intermediate") return 1;
  return 2;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

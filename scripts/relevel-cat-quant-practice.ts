import fs from "node:fs";
import path from "node:path";
import { cleanGeneratedPracticeQuestion } from "../lib/content/practice/leveling";
import type { GeneratedPracticeManifest, GeneratedPracticeQuestion, PracticeLevel } from "../types/practice";

type ChangeRow = {
  question_id: string;
  old_level: PracticeLevel;
  new_level: PracticeLevel;
  old_access_tier: string;
  new_access_tier: string;
  difficulty: string;
  quality_tier: string;
  pool_type: string;
  fields_cleaned: string;
  cleanup_notes: string;
};

type RelevelStats = {
  total: number;
  beginnerToIntermediate: number;
  beginnerToAdvanced: number;
  intermediateToAdvanced: number;
  hardVeryHardInBeginner: number;
  easyMediumInAdvanced: number;
  rowsCleanedForLeakage: number;
  rowsStillNeedingManualCleanup: number;
  advancedPremiumOnly: number;
};

const practiceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const manifestRelativePath = "content/cat/practice/manifests/cat_quant_practice_manifest.json";
const reportRelativePath = "reports/local_imports/CAT_QUANT_RELEVELING_REPORT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_releveling_changes.csv";

const practicePath = path.join(process.cwd(), practiceRelativePath);
const manifestPath = path.join(process.cwd(), manifestRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const csvPath = path.join(process.cwd(), csvRelativePath);

if (!fs.existsSync(practicePath)) {
  console.error(`Generated practice JSON not found: ${practiceRelativePath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const importedAt = new Date().toISOString();
const originalQuestions = readQuestions(practicePath);
const oldCounts = countLevels(originalQuestions);
const changes: ChangeRow[] = [];

const nextQuestions = originalQuestions.map((question) => {
  const before = structuredClone(question);
  const after = cleanGeneratedPracticeQuestion(question);
  const fieldsCleaned = changedFields(before, after);

  changes.push({
    question_id: after.question_id,
    old_level: before.practice_level,
    new_level: after.practice_level,
    old_access_tier: before.access_tier,
    new_access_tier: after.access_tier,
    difficulty: after.difficulty,
    quality_tier: after.quality_tier,
    pool_type: after.pool_type,
    fields_cleaned: fieldsCleaned.join("; "),
    cleanup_notes: after.cleanup_notes.join("; "),
  });

  return after;
});

nextQuestions.sort((a, b) => levelOrder(a.practice_level) - levelOrder(b.practice_level) || a.topic.localeCompare(b.topic) || a.question_id.localeCompare(b.question_id));

const newCounts = countLevels(nextQuestions);
const stats = {
  total: nextQuestions.length,
  beginnerToIntermediate: changes.filter((row) => row.old_level === "Beginner" && row.new_level === "Intermediate").length,
  beginnerToAdvanced: changes.filter((row) => row.old_level === "Beginner" && row.new_level === "Advanced").length,
  intermediateToAdvanced: changes.filter((row) => row.old_level === "Intermediate" && row.new_level === "Advanced").length,
  hardVeryHardInBeginner: nextQuestions.filter((question) => question.practice_level === "Beginner" && /hard/i.test(question.difficulty)).length,
  easyMediumInAdvanced: nextQuestions.filter((question) => question.practice_level === "Advanced" && /^(Easy|Medium)$/i.test(question.difficulty)).length,
  rowsCleanedForLeakage: changes.filter((row) => row.fields_cleaned).length,
  rowsStillNeedingManualCleanup: nextQuestions.filter((question) => question.cleanup_notes.length > 0).length,
  advancedPremiumOnly: nextQuestions.filter((question) => question.practice_level === "Advanced" && question.access_tier === "premium").length,
};

fs.writeFileSync(practicePath, JSON.stringify(nextQuestions, null, 2), "utf8");
fs.writeFileSync(manifestPath, JSON.stringify(buildManifest(nextQuestions, importedAt), null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(oldCounts, newCounts, stats), "utf8");
fs.writeFileSync(csvPath, toCsv(changes), "utf8");

console.log(`Releveled CAT Quant practice questions: ${stats.total}`);
console.log(`Beginner: ${newCounts.Beginner}`);
console.log(`Intermediate: ${newCounts.Intermediate}`);
console.log(`Advanced: ${newCounts.Advanced}`);
console.log(`Hard/Very Hard in Beginner: ${stats.hardVeryHardInBeginner}`);
console.log(`Advanced premium-only: ${stats.advancedPremiumOnly}`);
console.log(`Cleanup warning rows: ${stats.rowsStillNeedingManualCleanup}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`CSV: ${csvRelativePath}`);

function readQuestions(filePath: string) {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Generated practice JSON must be an array.");
  return parsed as GeneratedPracticeQuestion[];
}

function buildManifest(questions: GeneratedPracticeQuestion[], timestamp: string): GeneratedPracticeManifest {
  return {
    exam_slug: "cat",
    section: "QA",
    content_type: "generated_practice",
    source_file: "content/cat/practice/imports/generated_question_pool_combined_recalibrated_for_website.csv",
    output_file: practiceRelativePath,
    imported_at: timestamp,
    total_questions: questions.length,
    beginner_count: questions.filter((question) => question.practice_level === "Beginner").length,
    intermediate_count: questions.filter((question) => question.practice_level === "Intermediate").length,
    advanced_count: questions.filter((question) => question.practice_level === "Advanced").length,
    free_access_count: questions.filter((question) => question.access_tier === "free").length,
    free_limited_count: questions.filter((question) => question.access_tier === "free_limited").length,
    premium_only_count: questions.filter((question) => question.access_tier === "premium").length,
    pnc_probability_count: questions.filter((question) => question.topic_group === "P&C / Probability").length,
    rows_needing_cleanup: questions.filter((question) => question.cleanup_notes.length > 0).length,
    hard_very_hard_in_beginner: questions.filter((question) => question.practice_level === "Beginner" && /hard/i.test(question.difficulty)).length,
    easy_medium_in_advanced: questions.filter((question) => question.practice_level === "Advanced" && /^(Easy|Medium)$/i.test(question.difficulty)).length,
    cleanup_warning_count: questions.reduce((count, question) => count + question.cleanup_notes.length, 0),
  };
}

function buildReport(oldCounts: Record<PracticeLevel, number>, newCounts: Record<PracticeLevel, number>, stats: RelevelStats) {
  return `# CAT Quant Releveling Report

Generated: ${importedAt}

Source: \`${practiceRelativePath}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | ${stats.total} |
| Old Beginner count | ${oldCounts.Beginner} |
| Old Intermediate count | ${oldCounts.Intermediate} |
| Old Advanced count | ${oldCounts.Advanced} |
| New Beginner count | ${newCounts.Beginner} |
| New Intermediate count | ${newCounts.Intermediate} |
| New Advanced count | ${newCounts.Advanced} |
| Beginner -> Intermediate | ${stats.beginnerToIntermediate} |
| Beginner -> Advanced | ${stats.beginnerToAdvanced} |
| Intermediate -> Advanced | ${stats.intermediateToAdvanced} |
| Hard/Very Hard still in Beginner | ${stats.hardVeryHardInBeginner} |
| Advanced questions that are Easy/Medium | ${stats.easyMediumInAdvanced} |
| Rows cleaned for leakage | ${stats.rowsCleanedForLeakage} |
| Rows still needing manual cleanup | ${stats.rowsStillNeedingManualCleanup} |

## Rule Notes

- \`ACCEPT_BASIC_PRACTICE\` no longer maps to Beginner.
- Very Hard questions are always Advanced.
- Hard questions with basic/CAT-level quality tiers are Intermediate unless tough/simulation metadata escalates them.
- Topic probability is not used for practice level assignment.

## Artifacts

- Updated JSON: \`${practiceRelativePath}\`
- Updated manifest: \`${manifestRelativePath}\`
- Change CSV: \`${csvRelativePath}\`
`;
}

function changedFields(before: GeneratedPracticeQuestion, after: GeneratedPracticeQuestion) {
  const fields = ["question_text", "option_a", "option_b", "option_c", "option_d", "detailed_solution", "topic", "subtopic"] as const;
  return fields.filter((field) => before[field] !== after[field]);
}

function countLevels(questions: GeneratedPracticeQuestion[]) {
  return {
    Beginner: questions.filter((question) => question.practice_level === "Beginner").length,
    Intermediate: questions.filter((question) => question.practice_level === "Intermediate").length,
    Advanced: questions.filter((question) => question.practice_level === "Advanced").length,
  };
}

function toCsv(rows: ChangeRow[]) {
  const headers = ["question_id", "old_level", "new_level", "old_access_tier", "new_access_tier", "difficulty", "quality_tier", "pool_type", "fields_cleaned", "cleanup_notes"] as const;
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function levelOrder(level: PracticeLevel) {
  if (level === "Beginner") return 0;
  if (level === "Intermediate") return 1;
  return 2;
}

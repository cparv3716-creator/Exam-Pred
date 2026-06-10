import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "../lib/content/csv";
import {
  assignPracticeAccessTier,
  assignPracticeLevel,
  cleanGeneratedPracticeQuestion,
  getProbabilityMeta,
  getTopicGroup,
} from "../lib/content/practice/leveling";
import type { GeneratedPracticeManifest, GeneratedPracticeQuestion, PracticeLevel } from "../types/practice";

const defaultInput = "content/cat/practice/imports/generated_question_pool_combined_recalibrated_for_website.csv";
const inputPath = process.argv[2] ?? defaultInput;
const absoluteInputPath = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
const outputRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const manifestRelativePath = "content/cat/practice/manifests/cat_quant_practice_manifest.json";
const reportRelativePath = "reports/local_imports/cat_quant_generated_practice_import_report.md";

const requiredFields = [
  "exam_slug",
  "section",
  "content_type",
  "pool_type",
  "batch_id",
  "question_id",
  "question_text",
  "question_type",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_answer",
  "detailed_solution",
  "topic",
  "subtopic",
  "difficulty",
  "estimated_time",
  "source_reference",
  "quality_tier",
  "is_free",
  "is_premium",
  "tags",
] as const;

type ImportIssue = {
  row: number;
  question_id: string;
  severity: "error" | "warning";
  field: string;
  message: string;
};

if (!fs.existsSync(absoluteInputPath)) {
  console.error(`Input CSV not found: ${absoluteInputPath}`);
  process.exit(1);
}

ensureDir("content/cat/practice/generated");
ensureDir("content/cat/practice/manifests");
ensureDir("content/cat/practice/reports");
ensureDir("reports/local_imports");

const importedAt = new Date().toISOString();
const rows = parseCsv(fs.readFileSync(absoluteInputPath, "utf8"));
const issues: ImportIssue[] = [];
const questions: GeneratedPracticeQuestion[] = [];

rows.forEach((row, index) => {
  const rowNumber = index + 2;
  for (const field of requiredFields) {
    if (!(field in row)) {
      issues.push(issue(rowNumber, row.question_id, "error", field, `${field} column is missing.`));
    }
  }

  const questionType = text(row.question_type).toUpperCase();
  const cleanupNotes: string[] = [];

  for (const field of ["exam_slug", "section", "content_type", "pool_type", "batch_id", "question_id", "question_text", "question_type", "correct_answer", "detailed_solution", "topic", "difficulty", "source_reference", "quality_tier", "tags"]) {
    if (!text(row[field])) issues.push(issue(rowNumber, row.question_id, "error", field, `${field} is required.`));
  }

  if (row.exam_slug !== "cat") issues.push(issue(rowNumber, row.question_id, "error", "exam_slug", "Only cat generated practice is supported by this importer."));
  if (row.section !== "QA") issues.push(issue(rowNumber, row.question_id, "error", "section", "Only CAT Quant / QA generated practice is supported."));
  if (!["MCQ", "TITA", "MSQ", "DESCRIPTIVE"].includes(questionType)) {
    issues.push(issue(rowNumber, row.question_id, "error", "question_type", "question_type must be MCQ, TITA, MSQ, or descriptive."));
  }

  if (questionType === "MCQ" || questionType === "MSQ") {
    const filledOptions = ["option_a", "option_b", "option_c", "option_d"].filter((field) => text(row[field])).length;
    if (filledOptions < 2) issues.push(issue(rowNumber, row.question_id, "error", "options", `${questionType} requires answer options.`));
  }

  if (!text(row.estimated_time)) {
    cleanupNotes.push("estimated_time missing");
    issues.push(issue(rowNumber, row.question_id, "warning", "estimated_time", "Estimated time is blank; UI will show Not timed."));
  }
  if (!text(row.subtopic)) {
    cleanupNotes.push("subtopic missing");
    issues.push(issue(rowNumber, row.question_id, "warning", "subtopic", "Subtopic is blank; importer assigned Unmapped."));
  }

  const normalizedDifficulty = normalizeDifficulty(row.difficulty);
  if (normalizedDifficulty !== row.difficulty) cleanupNotes.push(`difficulty normalized from "${row.difficulty}" to "${normalizedDifficulty}"`);

  const tags = parseTags(row.tags);
  const questionBase = {
    difficulty: normalizedDifficulty,
    quality_tier: cleanToken(row.quality_tier),
    pool_type: cleanToken(row.pool_type),
    question_text: cleanText(row.question_text),
    subtopic: cleanText(row.subtopic) || "Unmapped",
    tags,
    is_free: parseBoolean(row.is_free),
    is_premium: parseBoolean(row.is_premium),
  };
  const practiceLevel = assignPracticeLevel(questionBase);
  const probability = getProbabilityMeta(row);

  const cleaned: GeneratedPracticeQuestion = {
    exam_slug: cleanToken(row.exam_slug),
    section: cleanToken(row.section),
    content_type: cleanToken(row.content_type),
    pool_type: questionBase.pool_type,
    batch_id: cleanToken(row.batch_id),
    question_id: cleanToken(row.question_id),
    question_text: questionBase.question_text,
    question_type: questionType === "DESCRIPTIVE" ? "descriptive" : questionType,
    option_a: cleanText(row.option_a),
    option_b: cleanText(row.option_b),
    option_c: cleanText(row.option_c),
    option_d: cleanText(row.option_d),
    correct_answer: cleanText(row.correct_answer),
    detailed_solution: cleanSolution(row.detailed_solution),
    topic: cleanText(row.topic),
    subtopic: questionBase.subtopic,
    topic_group: getTopicGroup(row.topic, row.subtopic, tags),
    difficulty: normalizedDifficulty,
    estimated_time: cleanText(row.estimated_time),
    source_reference: text(row.source_reference),
    quality_tier: questionBase.quality_tier,
    is_free: assignPracticeAccessTier({ ...questionBase, practice_level: practiceLevel }) === "free",
    is_premium: assignPracticeAccessTier({ ...questionBase, practice_level: practiceLevel }) === "premium",
    tags,
    practice_level: practiceLevel,
    access_tier: assignPracticeAccessTier({ ...questionBase, practice_level: practiceLevel }),
    topic_probability_score: probability.topic_probability_score,
    topic_probability_bucket: probability.topic_probability_bucket,
    exam_likelihood_label: probability.exam_likelihood_label,
    cleanup_notes: cleanupNotes,
  };

  if (!issues.some((item) => item.row === rowNumber && item.severity === "error")) {
    questions.push(cleanGeneratedPracticeQuestion(cleaned));
  }
});

questions.sort((a, b) => levelOrder(a.practice_level) - levelOrder(b.practice_level) || a.topic.localeCompare(b.topic) || a.question_id.localeCompare(b.question_id));

const stats = buildStats(questions);
const outputPath = path.join(process.cwd(), outputRelativePath);
const manifestPath = path.join(process.cwd(), manifestRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), "utf8");

const manifest: GeneratedPracticeManifest = {
  exam_slug: "cat",
  section: "QA",
  content_type: "generated_practice",
  source_file: path.relative(process.cwd(), absoluteInputPath).replace(/\\/g, "/"),
  output_file: outputRelativePath,
  imported_at: importedAt,
  total_questions: questions.length,
  beginner_count: stats.beginner,
  intermediate_count: stats.intermediate,
  advanced_count: stats.advanced,
  free_access_count: stats.free,
  premium_only_count: stats.premium,
  free_limited_count: stats.freeLimited,
  pnc_probability_count: stats.pncProbability,
  rows_needing_cleanup: questions.filter((question) => question.cleanup_notes.length > 0).length,
  hard_very_hard_in_beginner: questions.filter((question) => question.practice_level === "Beginner" && /hard/i.test(question.difficulty)).length,
  easy_medium_in_advanced: questions.filter((question) => question.practice_level === "Advanced" && /^(Easy|Medium)$/i.test(question.difficulty)).length,
  cleanup_warning_count: questions.filter((question) => question.cleanup_notes.length > 0).length,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(manifest, issues, questions), "utf8");

console.log(`Imported generated CAT Quant practice questions: ${questions.length}`);
console.log(`Beginner: ${stats.beginner}`);
console.log(`Intermediate: ${stats.intermediate}`);
console.log(`Advanced: ${stats.advanced}`);
console.log(`Free access: ${stats.free}`);
console.log(`Free limited: ${stats.freeLimited}`);
console.log(`Premium only: ${stats.premium}`);
console.log(`P&C/Probability: ${stats.pncProbability}`);
console.log(`Report: ${reportRelativePath}`);

if (issues.some((item) => item.severity === "error")) {
  console.error(`Import completed with ${issues.filter((item) => item.severity === "error").length} validation errors; invalid rows were skipped.`);
  process.exitCode = 1;
}

function buildStats(items: GeneratedPracticeQuestion[]) {
  return {
    beginner: items.filter((item) => item.practice_level === "Beginner").length,
    intermediate: items.filter((item) => item.practice_level === "Intermediate").length,
    advanced: items.filter((item) => item.practice_level === "Advanced").length,
    free: items.filter((item) => item.access_tier === "free").length,
    freeLimited: items.filter((item) => item.access_tier === "free_limited").length,
    premium: items.filter((item) => item.access_tier === "premium").length,
    pncProbability: items.filter((item) => item.topic_group === "P&C / Probability").length,
  };
}

function buildReport(manifest: GeneratedPracticeManifest, importIssues: ImportIssue[], items: GeneratedPracticeQuestion[]) {
  const warnings = importIssues.filter((item) => item.severity === "warning");
  const errors = importIssues.filter((item) => item.severity === "error");
  const byQuality = groupCounts(items.map((item) => item.quality_tier));
  const byTopic = groupCounts(items.map((item) => item.topic));

  return `# CAT Quant Generated Practice Import Report

Generated: ${manifest.imported_at}

Source: \`${manifest.source_file}\`

Output: \`${manifest.output_file}\`

## Summary

| Metric | Count |
| --- | ---: |
| Imported questions | ${manifest.total_questions} |
| Beginner | ${manifest.beginner_count} |
| Intermediate | ${manifest.intermediate_count} |
| Advanced | ${manifest.advanced_count} |
| Free access | ${manifest.free_access_count} |
| Free limited | ${manifest.free_limited_count ?? 0} |
| Premium only | ${manifest.premium_only_count} |
| P&C / Probability | ${manifest.pnc_probability_count} |
| Rows needing cleanup | ${manifest.rows_needing_cleanup} |
| Warnings | ${warnings.length} |
| Errors skipped | ${errors.length} |

## Quality Tier Counts

${formatCounts(byQuality)}

## Topic Counts

${formatCounts(byTopic)}

## Validation Notes

${importIssues.length ? importIssues.slice(0, 120).map((item) => `- Row ${item.row} ${item.severity.toUpperCase()} ${item.field}: ${item.message}`).join("\n") : "- No validation issues."}

## Provenance

These are generated CAT Quant practice questions, not PYQs. They must not be displayed as previous-year questions.
`;
}

function groupCounts(values: string[]) {
  return values.reduce<Record<string, number>>((groups, value) => {
    groups[value || "Unmapped"] = (groups[value || "Unmapped"] ?? 0) + 1;
    return groups;
  }, {});
}

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `- ${label}: ${count}`)
    .join("\n");
}

function issue(row: number, questionId: string, severity: ImportIssue["severity"], field: string, message: string): ImportIssue {
  return { row, question_id: questionId || "missing id", severity, field, message };
}

function normalizeDifficulty(input: string) {
  const value = cleanText(input);
  const normalized = value.toLowerCase().replace(/\s+/g, " ");
  if (normalized === "very" || normalized === "very-hard") return "Very Hard";
  if (normalized === "medium-" || normalized === "medium hard") return "Medium-Hard";
  if (normalized === "medium-hard") return "Medium-Hard";
  if (normalized === "hard") return "Hard";
  if (normalized === "medium") return "Medium";
  if (normalized === "easy") return "Easy";
  return value || "Medium";
}

function cleanSolution(input: string) {
  return cleanText(input)
    .replace(/\s+(Step\s+\d+:)/g, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanText(input: string) {
  return text(input)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function cleanToken(input: string) {
  return cleanText(input).replace(/\s+/g, "_");
}

function parseTags(input: string) {
  return cleanText(input)
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseBoolean(input: string) {
  return ["true", "1", "yes", "y"].includes(text(input).toLowerCase());
}

function levelOrder(level: PracticeLevel) {
  if (level === "Beginner") return 0;
  if (level === "Intermediate") return 1;
  return 2;
}

function text(input: unknown) {
  if (input === null || input === undefined) return "";
  return String(input).trim();
}

function ensureDir(relativePath: string) {
  fs.mkdirSync(path.join(process.cwd(), relativePath), { recursive: true });
}

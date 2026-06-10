import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion, PracticeContentStatus } from "../types/practice";

type IssueRow = {
  question_id: string;
  practice_level: string;
  topic: string;
  difficulty: string;
  content_status: string;
  math_review_status: string;
  issue_types: string;
  cleanup_notes: string;
  recommended_action: string;
};

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const summaryRelativePath = "content/cat/practice/reports/cat_quant_rendering_normalization_summary.json";
const reportRelativePath = "reports/local_imports/CAT_QUANT_FULL_RENDERING_QUALITY_AUDIT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_rendering_quality_issues.csv";

const sourcePath = path.join(process.cwd(), sourceRelativePath);
const summaryPath = path.join(process.cwd(), summaryRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const csvPath = path.join(process.cwd(), csvRelativePath);

if (!fs.existsSync(sourcePath)) {
  console.error(`Generated practice JSON not found: ${sourceRelativePath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const questions = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as GeneratedPracticeQuestion[];
const summary = readSummary();
const issueRows = questions
  .filter((question) => shouldAuditList(question))
  .map(toIssueRow)
  .sort((a, b) => priority(b) - priority(a))
  .slice(0, 50);

const hidden = questions.filter(isHidden);
const clean = countStatus("clean");
const safeDisplay = countStatus("safe_display");
const needsMathReview = countStatus("needs_math_review");
const needsSolutionReview = countStatus("needs_solution_review");
const incomplete = countStatus("incomplete_question") + countIssue("incomplete_question");
const brokenOptions = countStatus("broken_options") + countIssue("broken_options");
const hiddenAfter = hidden.length;
const hiddenBefore = Number(summary.hidden_before ?? hiddenAfter);
const unhidden = Number(summary.unhidden_after_repair ?? Math.max(0, hiddenBefore - hiddenAfter));

fs.writeFileSync(reportPath, buildReport(), "utf8");
fs.writeFileSync(csvPath, toCsv(issueRows), "utf8");

console.log(`Total questions: ${questions.length}`);
console.log(`Clean: ${clean}`);
console.log(`Safe display: ${safeDisplay}`);
console.log(`Needs math review: ${needsMathReview}`);
console.log(`Needs solution review: ${needsSolutionReview}`);
console.log(`Hidden before: ${hiddenBefore}`);
console.log(`Hidden after: ${hiddenAfter}`);
console.log(`Unhidden after repair: ${unhidden}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`CSV: ${csvRelativePath}`);

function buildReport() {
  const repairedExamples = questions
    .filter((question) => question.content_issue_types?.some((issue) => issue.includes("repaired") || issue === "unhidden_after_repair"))
    .slice(0, 5)
    .map((question, index) => [
      `### ${index + 1}. ${question.question_id}`,
      "",
      "**Raw question**",
      "",
      fenced(question.question_text),
      "",
      "**Question Markdown**",
      "",
      fenced(question.question_text_markdown ?? ""),
      "",
      "**Option Markdown**",
      "",
      fenced(["A: " + (question.option_a_markdown ?? ""), "B: " + (question.option_b_markdown ?? ""), "C: " + (question.option_c_markdown ?? ""), "D: " + (question.option_d_markdown ?? "")].join("\n")),
    ].join("\n"))
    .join("\n\n");

  const hiddenExamples = hidden.slice(0, 10).map((question, index) => {
    const why = recommend(question);
    return `${index + 1}. \`${question.question_id}\` - ${why}`;
  }).join("\n");

  const topRows = issueRows.map((row, index) => `${index + 1}. \`${row.question_id}\` [${row.content_status}/${row.math_review_status}] ${row.issue_types || "no issue_types"} - ${row.recommended_action}`).join("\n");

  return `# CAT Quant Full Rendering Quality Audit

Generated: ${new Date().toISOString()}

Source: \`${sourceRelativePath}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | ${questions.length} |
| Clean questions | ${clean} |
| Safe display questions | ${safeDisplay} |
| Needs math review | ${needsMathReview} |
| Needs solution review | ${needsSolutionReview} |
| Incomplete question | ${incomplete} |
| Broken options | ${brokenOptions} |
| Hide from student before | ${hiddenBefore} |
| Hide from student after | ${hiddenAfter} |
| Questions unhidden after repair | ${unhidden} |
| Questions still hidden | ${hiddenAfter} |

## Top 50 Remaining Issue Rows

${topRows || "- None"}

## Examples Of Repaired Markdown/LaTeX

${repairedExamples || "- No repaired examples found."}

## Examples Kept Hidden And Why

${hiddenExamples || "- No hidden rows remain."}

## Artifacts

- CSV: \`${csvRelativePath}\`
- Normalization summary: \`${summaryRelativePath}\`
`;
}

function readSummary() {
  if (!fs.existsSync(summaryPath)) return {} as Record<string, unknown>;
  try {
    return JSON.parse(fs.readFileSync(summaryPath, "utf8")) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function countStatus(status: PracticeContentStatus) {
  return questions.filter((question) => question.content_status === status).length;
}

function countIssue(issue: string) {
  return questions.filter((question) => question.content_issue_types?.includes(issue)).length;
}

function shouldAuditList(question: GeneratedPracticeQuestion) {
  return (
    isHidden(question) ||
    question.content_status === "needs_math_review" ||
    question.content_status === "needs_solution_review" ||
    question.math_review_status === "needs_review" ||
    Boolean(question.content_issue_types?.length) ||
    Boolean(question.math_cleanup_notes?.length)
  );
}

function isHidden(question: GeneratedPracticeQuestion) {
  return question.content_status === "hide_from_student" || question.content_status === "incomplete_question" || question.content_status === "broken_options";
}

function toIssueRow(question: GeneratedPracticeQuestion): IssueRow {
  return {
    question_id: question.question_id,
    practice_level: question.practice_level,
    topic: question.topic,
    difficulty: question.difficulty,
    content_status: question.content_status ?? "clean",
    math_review_status: question.math_review_status ?? "clean",
    issue_types: (question.content_issue_types ?? []).join("; "),
    cleanup_notes: (question.math_cleanup_notes ?? []).join("; "),
    recommended_action: recommend(question),
  };
}

function recommend(question: GeneratedPracticeQuestion) {
  const issues = question.content_issue_types ?? [];
  if (isHidden(question) && issues.includes("incomplete_question")) return "Keep hidden until source text restores missing conditions.";
  if (isHidden(question) && issues.includes("broken_options")) return "Keep hidden until options can be recovered safely.";
  if (question.content_status === "needs_solution_review") return "Visible, but solution should receive manual review before premium export.";
  if (question.content_status === "needs_math_review") return "Review math notation before exposing to students.";
  if (issues.includes("unhidden_after_repair")) return "Repaired and unhidden; spot-check recommended.";
  if (issues.some((issue) => issue.includes("repaired"))) return "Display repair applied; spot-check recommended.";
  return "No blocking action.";
}

function priority(row: IssueRow) {
  if (row.content_status === "hide_from_student") return 5;
  if (row.content_status === "incomplete_question" || row.content_status === "broken_options") return 4;
  if (row.content_status === "needs_math_review") return 3;
  if (row.content_status === "needs_solution_review") return 2;
  if (row.issue_types.includes("repaired")) return 1;
  return 0;
}

function toCsv(rows: IssueRow[]) {
  const headers = ["question_id", "practice_level", "topic", "difficulty", "content_status", "math_review_status", "issue_types", "cleanup_notes", "recommended_action"] as const;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function fenced(value: string) {
  return "```md\n" + String(value ?? "").trim() + "\n```";
}

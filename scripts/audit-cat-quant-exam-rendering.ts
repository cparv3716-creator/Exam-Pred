import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion } from "../types/practice";
import { findMathResidue } from "../lib/content/practice/solution-formatting";

// Strict, student-facing "does this render like a real exam page?" audit.
// Reads the normalized practice JSON, classifies every row, and reports counts +
// the worst remaining rows. Does NOT mutate questions, scoring, or levels.

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const reportRelativePath = "reports/local_imports/CAT_QUANT_EXAM_RENDERING_AUDIT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_exam_rendering_issues.csv";

const sourcePath = path.join(process.cwd(), sourceRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const csvPath = path.join(process.cwd(), csvRelativePath);

if (!fs.existsSync(sourcePath)) {
  console.error(`Generated practice JSON not found: ${sourceRelativePath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const questions = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as GeneratedPracticeQuestion[];

const RAW_TOKENS: Array<{ label: string; test: (prose: string) => boolean }> = [
  { label: "R -> R", test: (p) => /(?:\bR|ℝ)\s*(?:->|→)\s*(?:R|ℝ)\b/.test(p) },
  { label: "t2", test: (p) => /\bt[2-4]\b/.test(p) },
  { label: "x2", test: (p) => /\bx[2-4]\b/.test(p) },
  { label: "loga", test: (p) => /\bloga\b/.test(p) || /\blog_a\b/.test(p) },
  { label: "logb", test: (p) => /\blogb\b/.test(p) || /\blog_b\b/.test(p) },
  { label: "10 3", test: (p) => /\b10\s+3\b/.test(p) },
  { label: "99 16", test: (p) => /\b99\s+16\b/.test(p) },
];

// An equation (atoms joined by operators, containing "=") sitting in prose, NOT in math.
const EQ_ATOM = "[A-Za-z0-9²³⁴⁵⁶⁷().]+";
const EQUATION_RE = new RegExp(`${EQ_ATOM}(?:\\s*[-+*/]\\s*${EQ_ATOM})+\\s*=\\s*${EQ_ATOM}(?:\\s*[-+*/=]\\s*${EQ_ATOM})+`);

type Row = {
  question_id: string;
  practice_level: string;
  content_status: string;
  classification: string;
  issues: string[];
};

const rows: Row[] = questions.map(audit);

const total = questions.length;
const cleanExamRendered = rows.filter((r) => r.classification === "clean_exam_rendered").length;
const safeDisplay = rows.filter((r) => r.classification === "safe_display").length;
const needsMathReview = rows.filter((r) => r.content_status === "needs_math_review").length;
const needsSolutionReview = rows.filter((r) => r.content_status === "needs_solution_review").length;
const rowsWithRawPatterns = rows.filter((r) => r.issues.some((i) => i.startsWith("raw_residue"))).length;
const rowsMarkdownSameAsRaw = rows.filter((r) => r.issues.includes("markdown_same_as_raw")).length;
const rowsEquationsInParagraph = rows.filter((r) => r.issues.includes("equation_in_paragraph")).length;
const rowsOptionFractionNotRendered = rows.filter((r) => r.issues.includes("option_fraction_not_rendered")).length;
const tokenCounts = RAW_TOKENS.map((token) => ({
  label: token.label,
  count: rows.filter((r) => r.issues.includes(`token:${token.label}`)).length,
}));

const issueRows = rows.filter((r) => r.issues.length).sort((a, b) => severity(b) - severity(a));
const top20 = issueRows.slice(0, 20);

fs.writeFileSync(reportPath, buildReport(), "utf8");
fs.writeFileSync(csvPath, toCsv(issueRows), "utf8");

console.log(`Total questions: ${total}`);
console.log(`Clean exam-rendered: ${cleanExamRendered}`);
console.log(`Safe display: ${safeDisplay}`);
console.log(`Needs math review: ${needsMathReview}`);
console.log(`Needs solution review: ${needsSolutionReview}`);
console.log(`Rows still containing raw patterns: ${rowsWithRawPatterns}`);
console.log(`Rows where markdown == raw: ${rowsMarkdownSameAsRaw}`);
console.log(`Rows with equations stuck in paragraphs: ${rowsEquationsInParagraph}`);
console.log(`Rows with option fractions not rendered: ${rowsOptionFractionNotRendered}`);
for (const token of tokenCounts) console.log(`Rows with "${token.label}": ${token.count}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`CSV: ${csvRelativePath}`);

function audit(question: GeneratedPracticeQuestion): Row {
  const issues: string[] = [];
  const questionMd = question.question_text_markdown ?? "";
  const solutionMd = question.detailed_solution_markdown ?? "";
  const optionMd = [question.option_a_markdown, question.option_b_markdown, question.option_c_markdown, question.option_d_markdown].map((value) => value ?? "");
  const answerMd = question.correct_answer_markdown ?? "";

  const studentResidue = [questionMd, answerMd, ...optionMd].flatMap(findMathResidue);
  const solutionResidue = findMathResidue(solutionMd);
  studentResidue.forEach((note) => issues.push(`raw_residue_student:${note}`));
  solutionResidue.forEach((note) => issues.push(`raw_residue_solution:${note}`));

  if (markdownEqualsRaw(question.question_text_markdown, question.question_text)) issues.push("markdown_same_as_raw");

  if (equationInParagraph(questionMd) || equationInParagraph(solutionMd)) issues.push("equation_in_paragraph");

  for (const option of optionMd) {
    if (optionFractionNotRendered(option)) {
      issues.push("option_fraction_not_rendered");
      break;
    }
  }

  const proseAll = [questionMd, solutionMd, answerMd, ...optionMd].map(proseOutsideMath).join("  ");
  for (const token of RAW_TOKENS) {
    if (token.test(proseAll)) issues.push(`token:${token.label}`);
  }

  return {
    question_id: question.question_id,
    practice_level: question.practice_level,
    content_status: question.content_status ?? "clean",
    classification: classify(question, issues),
    issues: Array.from(new Set(issues)),
  };
}

function classify(question: GeneratedPracticeQuestion, issues: string[]): string {
  const status = question.content_status ?? "clean";
  if (status === "clean" && !issues.some((i) => i.startsWith("raw_residue") || i === "equation_in_paragraph" || i.startsWith("token:"))) {
    return "clean_exam_rendered";
  }
  if (status === "clean") return "clean_with_warnings";
  return status;
}

function markdownEqualsRaw(markdown: string | undefined, raw: string | undefined): boolean {
  const md = String(markdown ?? "").trim();
  const rawText = String(raw ?? "").trim();
  if (!md || !rawText) return false;
  if (md !== rawText) return false;
  // Only a problem when the raw text actually carried math worth formatting.
  return /[=^√]|->|\d\s+\d|[a-z]\d\b|\blog/.test(rawText);
}

function equationInParagraph(markdown: string): boolean {
  return EQUATION_RE.test(proseOutsideMath(markdown));
}

function optionFractionNotRendered(markdown: string): boolean {
  const prose = proseOutsideMath(markdown).trim();
  return /^-?\d{1,4}\s*\/\s*\d{1,4}$/.test(prose) || /^\d{1,4}\s+\d{1,4}$/.test(prose);
}

function proseOutsideMath(markdown: string): string {
  return String(markdown ?? "")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ");
}

function severity(row: Row): number {
  if (row.content_status === "needs_math_review") return 5;
  if (row.issues.some((i) => i.startsWith("raw_residue_student"))) return 4;
  if (row.issues.includes("equation_in_paragraph")) return 3;
  if (row.issues.includes("option_fraction_not_rendered")) return 2;
  if (row.issues.some((i) => i.startsWith("token:"))) return 1;
  return 0;
}

function buildReport(): string {
  const tokenTable = tokenCounts.map((token) => `| \`${token.label}\` | ${token.count} |`).join("\n");
  const topList = top20.length
    ? top20.map((row, index) => `${index + 1}. \`${row.question_id}\` [${row.content_status} / ${row.classification}] — ${row.issues.join("; ")}`).join("\n")
    : "- None 🎉";

  return `# CAT Quant Exam Rendering Audit

Generated: ${new Date().toISOString()}

Source: \`${sourceRelativePath}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | ${total} |
| Clean exam-rendered questions | ${cleanExamRendered} |
| Safe display questions | ${safeDisplay} |
| Needs math review | ${needsMathReview} |
| Needs solution review | ${needsSolutionReview} |
| Rows still containing raw patterns | ${rowsWithRawPatterns} |
| Rows where markdown is identical to raw | ${rowsMarkdownSameAsRaw} |
| Rows with equations stuck in paragraphs | ${rowsEquationsInParagraph} |
| Rows with option fractions not rendered | ${rowsOptionFractionNotRendered} |

## Raw Token Breakdown

| Token | Rows |
| --- | ---: |
${tokenTable}

## Top 20 Remaining Issues

${topList}

## Notes

- "Clean exam-rendered" = \`content_status: clean\` with no raw residue, no paragraph-trapped equations, and no raw tokens.
- Student pages show only \`clean\` / \`safe_display\` (and \`needs_solution_review\` when the question + answer are clean).
- \`needs_math_review\` rows are hidden from students and listed here for admin follow-up.
- CSV: \`${csvRelativePath}\`
`;
}

function toCsv(data: Row[]): string {
  const headers = ["question_id", "practice_level", "content_status", "classification", "issues"] as const;
  return [
    headers.join(","),
    ...data.map((row) => headers.map((header) => csvCell(Array.isArray(row[header]) ? (row[header] as string[]).join("; ") : row[header])).join(",")),
  ].join("\n");
}

function csvCell(value: string | number): string {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

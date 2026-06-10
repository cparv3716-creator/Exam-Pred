import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import {
  detectMathReviewIssues,
  formatOptionToMarkdown,
  formatQuestionToMarkdown,
  formatSolutionToMarkdown,
  normalizeMathText,
} from "../lib/content/practice/solution-formatting";
import type { GeneratedPracticeQuestion } from "../types/practice";

type AuditRow = {
  question_id: string;
  status: "clean" | "safe_display" | "needs_review";
  score: number;
  issues: string[];
};

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const reportRelativePath = "reports/local_imports/CAT_QUANT_MATH_RENDERING_AUDIT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_math_rendering_review_needed.csv";
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
const audited: GeneratedPracticeQuestion[] = [];
const auditRows: AuditRow[] = [];

for (const question of questions) {
  const next = { ...question };
  const questionSource = question.question_text_display ?? question.question_text;
  const solutionSource = question.detailed_solution_display ?? question.detailed_solution;

  next.question_text_markdown = formatQuestionToMarkdown(questionSource);
  next.option_a_markdown = formatOptionToMarkdown(question.option_a_display ?? question.option_a);
  next.option_b_markdown = formatOptionToMarkdown(question.option_b_display ?? question.option_b);
  next.option_c_markdown = formatOptionToMarkdown(question.option_c_display ?? question.option_c);
  next.option_d_markdown = formatOptionToMarkdown(question.option_d_display ?? question.option_d);
  next.correct_answer_markdown = formatOptionToMarkdown(question.correct_answer_display ?? question.correct_answer);
  next.detailed_solution_markdown = formatSolutionToMarkdown(solutionSource);

  const issues = collectIssues(question, next);
  const severeIssues = issues.filter(isSevereIssue);
  const katexIssues = detectKatexIssues([
    next.question_text_markdown,
    next.option_a_markdown,
    next.option_b_markdown,
    next.option_c_markdown,
    next.option_d_markdown,
    next.correct_answer_markdown,
    next.detailed_solution_markdown,
  ]);

  for (const issue of katexIssues) issues.push(issue);

  const finalSevereIssues = issues.filter(isSevereIssue);
  const status: AuditRow["status"] = finalSevereIssues.length ? "needs_review" : issues.length ? "safe_display" : "clean";
  next.math_review_status = status;
  next.math_cleanup_notes = Array.from(new Set(issues)).sort();

  auditRows.push({
    question_id: question.question_id,
    status,
    score: finalSevereIssues.length * 20 + issues.length * 5,
    issues: next.math_cleanup_notes,
  });
  audited.push(next);
}

const reviewRows = auditRows.filter((row) => row.status === "needs_review");
const safeRows = auditRows.filter((row) => row.status === "safe_display");
const cleanRows = auditRows.filter((row) => row.status === "clean");
const worst = [...reviewRows].sort((a, b) => b.score - a.score || b.issues.length - a.issues.length).slice(0, 20);

fs.writeFileSync(sourcePath, JSON.stringify(audited, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(audited.length, cleanRows.length, safeRows.length, reviewRows.length, worst), "utf8");
fs.writeFileSync(csvPath, toCsv(reviewRows), "utf8");

console.log(`Audited CAT Quant math rows: ${audited.length}`);
console.log(`Clean rows: ${cleanRows.length}`);
console.log(`Safe display rows: ${safeRows.length}`);
console.log(`Rows needing review: ${reviewRows.length}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`Review CSV: ${csvRelativePath}`);

function collectIssues(original: GeneratedPracticeQuestion, formatted: GeneratedPracticeQuestion) {
  const issues = new Set<string>();
  const fields = [
    ["question_text", original.question_text, formatted.question_text_markdown],
    ["option_a", original.option_a, formatted.option_a_markdown],
    ["option_b", original.option_b, formatted.option_b_markdown],
    ["option_c", original.option_c, formatted.option_c_markdown],
    ["option_d", original.option_d, formatted.option_d_markdown],
    ["correct_answer", original.correct_answer, formatted.correct_answer_markdown],
    ["detailed_solution", original.detailed_solution, formatted.detailed_solution_markdown],
  ] as const;

  for (const [field, raw, markdown] of fields) {
    for (const issue of detectMathReviewIssues(raw)) {
      if (!isIssueResolved(issue, markdown ?? "")) issues.add(`${field}: ${issue}`);
    }
    if (field === "detailed_solution" && normalizeMathText(raw).length > 500 && !markdown?.includes("### Step")) {
      issues.add(`${field}: very long unformatted solution paragraph`);
    }
    if (markdown && /(?:^|\s)(?:1\s+2|1\s+12|3\s+4)(?:\s|$)/.test(markdown)) {
      issues.add(`${field}: suspicious adjacent numeric tokens remain after formatting`);
    }
    if (markdown && /x2|x3|log2|log3|log4|log8/i.test(markdown)) {
      issues.add(`${field}: plain math token remains after formatting`);
    }
  }

  return Array.from(issues);
}

function isIssueResolved(issue: string, markdown: string) {
  if (/sqrt product/.test(issue)) return /\\sqrt\{/.test(markdown);
  if (/suspicious adjacent numeric tokens/.test(issue)) return !/(?:^|\s)(?:1\s+2|1\s+12|3\s+4)(?:\s|$)/.test(markdown);
  if (/plain exponent token|plain log base token/.test(issue)) return !/x2|x3|log2|log3|log4|log8/i.test(markdown);
  if (/ambiguous slash/.test(issue)) return /\\frac\{/.test(markdown) && !/[A-Za-z0-9)]\/[A-Za-z(]/.test(markdown);
  return false;
}

function isSevereIssue(issue: string) {
  return /suspicious adjacent numeric tokens|ambiguous slash|missing division|unsafe katex|very long unformatted|plain math token remains/i.test(issue);
}

function detectKatexIssues(markdowns: Array<string | undefined>) {
  const issues: string[] = [];
  for (const markdown of markdowns.filter(Boolean) as string[]) {
    const spans = extractMath(markdown);
    for (const span of spans) {
      try {
        const html = katex.renderToString(span, { throwOnError: false, strict: "ignore" });
        if (html.includes("katex-error")) issues.push(`unsafe katex expression: ${span.slice(0, 80)}`);
      } catch {
        issues.push(`unsafe katex expression: ${span.slice(0, 80)}`);
      }
    }
  }
  return Array.from(new Set(issues)).slice(0, 8);
}

function extractMath(markdown: string) {
  const spans: string[] = [];
  for (const match of markdown.matchAll(/\$\$([\s\S]+?)\$\$/g)) spans.push(match[1].trim());
  for (const match of markdown.matchAll(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g)) spans.push(match[1].trim());
  return spans;
}

function buildReport(total: number, clean: number, safe: number, review: number, worstRows: AuditRow[]) {
  return `# CAT Quant Math Rendering Audit

Generated: ${new Date().toISOString()}

Source: \`${sourceRelativePath}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total rows scanned | ${total} |
| Clean rows | ${clean} |
| Safe display rows | ${safe} |
| Rows needing review | ${review} |

## Top Remaining Math Review Issues

${worstRows.length ? worstRows.map((row, index) => `${index + 1}. \`${row.question_id}\` score ${row.score} - ${row.issues.slice(0, 6).join("; ")}`).join("\n") : "- None"}

## Student-Facing Policy

Only rows marked \`clean\` or \`safe_display\` are served by student-facing CAT Quant practice readers. Rows marked \`needs_review\` remain available to admin diagnostics but are excluded from practice lists and direct student pages.
`;
}

function toCsv(rows: AuditRow[]) {
  const headers = ["question_id", "status", "score", "issues"] as const;
  return [
    headers.join(","),
    ...rows
      .sort((a, b) => b.score - a.score)
      .map((row) => headers.map((header) => csvCell(header === "issues" ? row.issues.join("; ") : row[header])).join(",")),
  ].join("\n");
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

import fs from "node:fs";
import path from "node:path";
import {
  detectMathReviewIssues,
  formatOptionToMarkdown,
  formatQuestionToMarkdown,
  formatSolutionToMarkdown,
  normalizeMathText,
} from "../lib/content/practice/solution-formatting";
import type { GeneratedPracticeQuestion, PracticeContentStatus } from "../types/practice";

type IssueSeverity = "info" | "warning" | "critical";

type IssueRow = {
  question_id: string;
  practice_level: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  issue_type: string;
  issue_severity: IssueSeverity;
  raw_question_text: string;
  display_question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  source_pdf: string;
  source_reference: string;
  recommended_action: string;
};

type SourceQuestion = Record<string, string | number | null | undefined>;

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const reportRelativePath = "reports/local_imports/CAT_QUANT_QUESTION_INTEGRITY_AUDIT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_question_integrity_issues.csv";
const sourceRoot = "D:/CAT PREDN MODEL/cat_prediction_engine_structured/data/generated_question_pool";
const generatedPath = path.join(process.cwd(), sourceRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const csvPath = path.join(process.cwd(), csvRelativePath);

if (!fs.existsSync(generatedPath)) {
  console.error(`Generated practice JSON not found: ${sourceRelativePath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const sourceIndex = buildSourceIndex();
const questions = JSON.parse(fs.readFileSync(generatedPath, "utf8")) as GeneratedPracticeQuestion[];
const issueRows: IssueRow[] = [];
let repairedFromSource = 0;

const updated = questions.map((question) => {
  const next: GeneratedPracticeQuestion = { ...question };
  const issues: Array<{ type: string; severity: IssueSeverity; action: string }> = [];
  const source = sourceIndex.get(question.question_id);

  const rawWordCount = wordCount(question.question_text);
  const incomplete = looksIncompleteQuestion(question);
  if (incomplete) {
    const repaired = repairIncompleteQuestion(question, source);
    if (repaired) {
      next.question_text_repaired = repaired.text;
      next.repair_source = repaired.source;
      next.repair_confidence = repaired.confidence;
      repairedFromSource += 1;
      issues.push({ type: "incomplete_question_repaired", severity: "warning", action: "Use question_text_repaired; raw question remains incomplete." });
    } else {
      issues.push({ type: "incomplete_question", severity: "critical", action: "Hide from students until source question is repaired." });
    }
  }

  if (rawWordCount < 20 && /find the value|what is|how many|determine/i.test(question.question_text)) {
    issues.push({ type: "short_question_prompt", severity: "warning", action: "Review whether conditions are missing." });
  }

  const missingParts = validateRequiredParts(question);
  for (const type of missingParts) {
    issues.push({ type, severity: "critical", action: "Hide from students until required content is available." });
  }

  const optionRepair = repairOptionFractions(question);
  if (optionRepair.repaired) {
    Object.assign(next, optionRepair.fields);
    issues.push({ type: "broken_options_repaired", severity: "warning", action: "Use repaired option fields and generated option markdown." });
  } else if (optionRepair.broken) {
    issues.push({ type: "broken_options", severity: "critical", action: "Hide from students until options are repaired." });
  }

  const mathIssues = collectMathDamage(question, next);
  for (const issue of mathIssues) {
    issues.push({ type: issue, severity: "warning", action: "Use Markdown display if safe; otherwise keep in math review queue." });
  }

  const solutionMismatch = solutionReferencesMissingConditions(question, next);
  if (solutionMismatch) {
    issues.push({
      type: "solution_references_missing_question_conditions",
      severity: next.question_text_repaired ? "warning" : "critical",
      action: next.question_text_repaired ? "Use repaired question text." : "Hide until missing conditions are restored.",
    });
  }

  next.question_text_markdown = formatQuestionToMarkdown(next.question_text_repaired ?? next.question_text_display ?? next.question_text);
  next.option_a_markdown = formatOptionToMarkdown(next.option_a_repaired ?? next.option_a_display ?? next.option_a);
  next.option_b_markdown = formatOptionToMarkdown(next.option_b_repaired ?? next.option_b_display ?? next.option_b);
  next.option_c_markdown = formatOptionToMarkdown(next.option_c_repaired ?? next.option_c_display ?? next.option_c);
  next.option_d_markdown = formatOptionToMarkdown(next.option_d_repaired ?? next.option_d_display ?? next.option_d);
  next.correct_answer_markdown = formatOptionToMarkdown(next.correct_answer_display ?? next.correct_answer);
  next.detailed_solution_markdown = formatSolutionToMarkdown(next.detailed_solution_repaired ?? next.detailed_solution_display ?? next.detailed_solution);

  const critical = issues.some((issue) => issue.severity === "critical");
  const hasIncomplete = issues.some((issue) => issue.type === "incomplete_question");
  const hasBrokenOptions = issues.some((issue) => issue.type === "broken_options");
  const hasUnrepairedMath = mathIssues.some((issue) => /ambiguous|unsafe|plain math token remains|suspicious adjacent/.test(issue));

  let contentStatus: PracticeContentStatus = "clean";
  if (critical || hasIncomplete) contentStatus = "hide_from_student";
  else if (hasBrokenOptions) contentStatus = "broken_options";
  else if (hasUnrepairedMath) contentStatus = "needs_math_review";

  next.content_status = contentStatus;
  next.content_issue_types = Array.from(new Set(issues.map((issue) => issue.type))).sort();
  if (contentStatus === "hide_from_student") {
    next.math_review_status = "needs_review";
  } else if (contentStatus === "needs_math_review") {
    next.math_review_status = "needs_review";
  } else if (next.math_review_status === "needs_review" && !hasUnrepairedMath) {
    next.math_review_status = "safe_display";
  }
  next.math_cleanup_notes = Array.from(new Set([...(next.math_cleanup_notes ?? []), ...issues.map((issue) => issue.type)])).sort();

  for (const issue of issues) {
    issueRows.push(toIssueRow(next, issue.type, issue.severity, issue.action, source));
  }

  return next;
});

const counts = countStatuses(updated);
fs.writeFileSync(generatedPath, JSON.stringify(updated, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(updated, issueRows, counts, repairedFromSource), "utf8");
fs.writeFileSync(csvPath, toCsv(issueRows), "utf8");

console.log(`Audited CAT Quant question integrity: ${updated.length}`);
console.log(`Incomplete questions: ${countIssue(issueRows, "incomplete_question") + countIssue(issueRows, "incomplete_question_repaired")}`);
console.log(`Incomplete questions repaired: ${countIssue(issueRows, "incomplete_question_repaired")}`);
console.log(`Hidden from students: ${counts.hide_from_student}`);
console.log(`Needs math review: ${counts.needs_math_review}`);
console.log(`Broken options: ${counts.broken_options}`);
console.log(`Clean: ${counts.clean}`);
console.log(`Repaired from source: ${repairedFromSource}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`CSV: ${csvRelativePath}`);

function buildSourceIndex() {
  const index = new Map<string, SourceQuestion>();
  const parsedDir = path.join(sourceRoot, "parsed_json");
  if (!fs.existsSync(parsedDir)) return index;
  for (const file of fs.readdirSync(parsedDir).filter((item) => item.endsWith(".json"))) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(parsedDir, file), "utf8")) as { questions?: SourceQuestion[] };
      for (const question of parsed.questions ?? []) {
        const id = String(question.generated_id ?? "");
        if (id) index.set(id, question);
      }
    } catch {
      // Keep audit resilient when one source artifact is malformed.
    }
  }
  return index;
}

function looksIncompleteQuestion(question: GeneratedPracticeQuestion) {
  const text = normalizeMathText(question.question_text);
  if (/find the value/i.test(text) && wordCount(text) < 20) return true;
  if (/^if\b/i.test(text) && wordCount(text) < 14) return true;
  const solution = normalizeMathText(question.detailed_solution);
  if (/log[_a-z]*|xy\s*=|satisfy|given/i.test(solution) && !/log|xy\s*=|satisfy|given/i.test(text) && wordCount(text) < 25) return true;
  return false;
}

function repairIncompleteQuestion(question: GeneratedPracticeQuestion, source?: SourceQuestion) {
  const archetype = normalizeMathText(String(source?.pyq_inspired_archetype ?? ""));
  const raw = normalizeMathText(question.question_text);
  if (question.question_id === "GEN_CAT_QUANT_TOUGH_END_PRACTICE_BATCH_Q08" && /log_?x\s+y \+ log_?y\s+x/i.test(archetype) && /xy\s*=\s*81/i.test(archetype)) {
    return {
      text: "Positive real numbers x and y, with x and y not equal to 1, satisfy log_x y + log_y x = 10/3 and xy = 81. If x < y, find the value of y - x.",
      source: "source_pdf/extracted_text",
      confidence: "high" as const,
    };
  }
  if (archetype.length > raw.length + 20 && /satisfy|given|where|with/i.test(archetype)) {
    return {
      text: `${archetype.replace(/[. ]+$/, "")}. ${raw}`,
      source: "source_pdf/extracted_text",
      confidence: "medium" as const,
    };
  }
  return null;
}

function validateRequiredParts(question: GeneratedPracticeQuestion) {
  const issues: string[] = [];
  if (!question.correct_answer?.trim()) issues.push("missing_correct_answer");
  if (!question.detailed_solution?.trim()) issues.push("missing_solution");
  if ((question.question_type === "MCQ" || question.question_type === "MSQ") && ![question.option_a, question.option_b, question.option_c, question.option_d].every((option) => option?.trim())) {
    issues.push("missing_mcq_options");
  }
  return issues;
}

function repairOptionFractions(question: GeneratedPracticeQuestion) {
  const options = [question.option_a, question.option_b, question.option_c, question.option_d];
  const rawOptions = options.map((option) => String(option ?? "").trim().replace(/\s+/g, " "));
  const brokenFlags = rawOptions.map((option) => /^\d+\s+\d+$/.test(option));
  const brokenCount = brokenFlags.filter(Boolean).length;
  const fractionContext = /\b\d+\s+\d+\b/.test(question.detailed_solution) || /\b\d+\/\d+\b/.test(question.detailed_solution) || brokenCount >= 2;
  if (!fractionContext || brokenCount < 2) return { repaired: false, broken: brokenCount > 0, fields: {} };

  const repairedOptions = rawOptions.map((option) => {
    const match = /^(\d+)\s+(\d+)$/.exec(option);
    return match ? `${match[1]}/${match[2]}` : normalizeMathText(option);
  });

  return {
    repaired: true,
    broken: false,
    fields: {
      option_a_repaired: repairedOptions[0],
      option_b_repaired: repairedOptions[1],
      option_c_repaired: repairedOptions[2],
      option_d_repaired: repairedOptions[3],
      option_a_markdown: formatOptionToMarkdown(repairedOptions[0]),
      option_b_markdown: formatOptionToMarkdown(repairedOptions[1]),
      option_c_markdown: formatOptionToMarkdown(repairedOptions[2]),
      option_d_markdown: formatOptionToMarkdown(repairedOptions[3]),
    },
  };
}

function collectMathDamage(question: GeneratedPracticeQuestion, next: GeneratedPracticeQuestion) {
  const fields = [
    question.question_text,
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
    question.detailed_solution,
  ];
  const issues = new Set<string>();
  for (const field of fields) {
    for (const issue of detectMathReviewIssues(field)) {
      if (issue === "suspicious adjacent numeric tokens" && next.option_a_repaired) continue;
      issues.add(issue.replace(/\s+/g, "_"));
    }
  }
  if (/logab|loga b|logb a|a2b3|\b10\s+3\b/i.test(`${question.question_text} ${question.detailed_solution}`)) {
    issues.add("log_expression_display_repaired");
  }
  return Array.from(issues);
}

function solutionReferencesMissingConditions(question: GeneratedPracticeQuestion, next: GeneratedPracticeQuestion) {
  const prompt = normalizeMathText(next.question_text_repaired ?? question.question_text);
  const solution = normalizeMathText(question.detailed_solution);
  if (/xy\s*=\s*81/i.test(solution) && !/xy\s*=\s*81/i.test(prompt)) return true;
  if (/log[_a-z]*\s*y|logx y/i.test(solution) && !/log[_a-z]*\s*y|logx y/i.test(prompt)) return true;
  return false;
}

function countStatuses(questions: GeneratedPracticeQuestion[]) {
  return questions.reduce<Record<string, number>>((counts, question) => {
    const status = question.content_status ?? "clean";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, { clean: 0, needs_math_review: 0, incomplete_question: 0, broken_options: 0, hide_from_student: 0 });
}

function toIssueRow(question: GeneratedPracticeQuestion, type: string, severity: IssueSeverity, action: string, source?: SourceQuestion): IssueRow {
  return {
    question_id: question.question_id,
    practice_level: question.practice_level,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    issue_type: type,
    issue_severity: severity,
    raw_question_text: question.question_text,
    display_question_text: question.question_text_repaired ?? question.question_text_markdown ?? question.question_text_display ?? "",
    option_a: question.option_a_repaired ?? question.option_a,
    option_b: question.option_b_repaired ?? question.option_b,
    option_c: question.option_c_repaired ?? question.option_c,
    option_d: question.option_d_repaired ?? question.option_d,
    correct_answer: question.correct_answer,
    source_pdf: String(source?.source_pdf ?? ""),
    source_reference: question.source_reference,
    recommended_action: action,
  };
}

function buildReport(questions: GeneratedPracticeQuestion[], rows: IssueRow[], counts: Record<string, number>, sourceRepairs: number) {
  const cleanMath = questions.filter((question) => question.math_review_status === "clean" && question.content_status !== "hide_from_student").length;
  const safeDisplay = questions.filter((question) => question.math_review_status === "safe_display" && question.content_status !== "hide_from_student").length;
  const incompleteRows = countIssue(rows, "incomplete_question") + countIssue(rows, "incomplete_question_repaired");
  const brokenOptionRows = countIssue(rows, "broken_options") + countIssue(rows, "broken_options_repaired");
  const topRows = rows
    .filter((row) => row.issue_severity !== "info")
    .slice(0, 30)
    .map((row, index) => `${index + 1}. \`${row.question_id}\` [${row.issue_severity}] ${row.issue_type} - ${row.recommended_action}`)
    .join("\n");
  return `# CAT Quant Question Integrity Audit

Generated: ${new Date().toISOString()}

Source: \`${sourceRelativePath}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | ${questions.length} |
| Clean questions | ${counts.clean ?? 0} |
| Math clean rows | ${cleanMath} |
| Safe display rows | ${safeDisplay} |
| Needs math review | ${counts.needs_math_review ?? 0} |
| Incomplete question status | ${counts.incomplete_question ?? 0} |
| Incomplete issue rows | ${incompleteRows} |
| Broken options status | ${counts.broken_options ?? 0} |
| Broken option issue rows | ${brokenOptionRows} |
| Hidden from students | ${counts.hide_from_student ?? 0} |
| Source repairs created | ${sourceRepairs} |
| Issue rows | ${rows.length} |

## Top 30 Issue Rows

${topRows || "- None"}

## Artifacts

- CSV: \`${csvRelativePath}\`
- JSON updated in place with display-only repair/status fields; raw fields are preserved.
`;
}

function toCsv(rows: IssueRow[]) {
  const headers = [
    "question_id",
    "practice_level",
    "topic",
    "subtopic",
    "difficulty",
    "issue_type",
    "issue_severity",
    "raw_question_text",
    "display_question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
    "source_pdf",
    "source_reference",
    "recommended_action",
  ] as const;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
}

function countIssue(rows: IssueRow[], issue: string) {
  return rows.filter((row) => row.issue_type === issue).length;
}

function wordCount(text: string) {
  return normalizeMathText(text).split(/\s+/).filter(Boolean).length;
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

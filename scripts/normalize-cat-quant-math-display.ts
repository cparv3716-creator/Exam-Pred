import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion, PracticeContentStatus } from "../types/practice";
import { formatOptionToMarkdown, formatQuestionToMarkdown, formatSolutionToMarkdown, findMathResidue, hasSeriousMathResidue } from "../lib/content/practice/solution-formatting";

type FieldName = "question_text" | "option_a" | "option_b" | "option_c" | "option_d" | "correct_answer" | "detailed_solution";

type ReviewRow = {
  question_id: string;
  review_score: number;
  content_status: PracticeContentStatus;
  math_review_status: "clean" | "safe_display" | "needs_review" | "latex_source_clean";
  notes: string[];
  fields_cleaned: string[];
};

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const backupDirRelativePath = "content/cat/practice/generated/backups";
const reportRelativePath = "reports/local_imports/CAT_QUANT_MATH_NORMALIZATION_REPORT.md";
const reviewCsvRelativePath = "content/cat/practice/reports/cat_quant_math_review_needed.csv";
const summaryRelativePath = "content/cat/practice/reports/cat_quant_rendering_normalization_summary.json";

const sourcePath = path.join(process.cwd(), sourceRelativePath);
const backupDir = path.join(process.cwd(), backupDirRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const reviewCsvPath = path.join(process.cwd(), reviewCsvRelativePath);
const summaryPath = path.join(process.cwd(), summaryRelativePath);

if (!fs.existsSync(sourcePath)) {
  console.error(`Generated practice JSON not found: ${sourceRelativePath}`);
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `cat_quant_generated_practice_before_math_normalization_${timestamp}.json`);
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(reviewCsvPath), { recursive: true });
fs.copyFileSync(sourcePath, backupPath);

const questions = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as GeneratedPracticeQuestion[];
const previousSummary = readExistingSummary();
const hiddenBefore = Math.max(Number(previousSummary.hidden_before ?? 0), questions.filter(isHiddenStatus).length);
let fieldsCleaned = 0;
const reviewRows: ReviewRow[] = [];
const unhiddenQuestionIds: string[] = [];

const updated = questions.map((question) => {
  const next: GeneratedPracticeQuestion = { ...question };
  const rowNotes = new Set<string>();
  const issueTypes = new Set<string>();
  const fieldsChanged: string[] = [];
  const fields: FieldName[] = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "detailed_solution"];
  const wasHidden = isHiddenStatus(question);
  if (question.display_source === "latex_source" && question.latex_match_confidence === "high") {
    next.math_review_status = "latex_source_clean";
    next.content_status = "safe_display";
    next.completeness_status = "repaired_from_latex_source";
    next.student_visible = true;
    next.content_issue_types = (next.content_issue_types ?? []).filter((issue) => !["needs_math_review", "incomplete_question", "broken_options", "hide_from_student"].includes(issue));
    next.math_cleanup_notes = Array.from(new Set([...(next.math_cleanup_notes ?? []), "latex source markdown preserved"]));
    reviewRows.push({
      question_id: next.question_id,
      review_score: 0,
      content_status: next.content_status,
      math_review_status: next.math_review_status,
      notes: next.math_cleanup_notes,
      fields_cleaned: [],
    });
    return next;
  }

  for (const field of fields) {
    const raw = String(question[field] ?? "");
    const normalized = normalizeMathDisplay(raw, field);
    const notes = detectSuspicious(raw, normalized, field);
    notes.forEach((note) => {
      rowNotes.add(note);
      issueTypes.add(issueTypeFromNote(note));
    });

    if (normalized !== raw) {
      fieldsCleaned += 1;
      fieldsChanged.push(field);
    }

    if (field === "question_text") {
      next.question_text_display = normalized;
      setSafeLatex(next, "question_text_latex", normalized);
    } else if (field === "option_a") {
      next.option_a_display = normalized;
      setSafeLatex(next, "option_a_latex", normalized);
    } else if (field === "option_b") {
      next.option_b_display = normalized;
      setSafeLatex(next, "option_b_latex", normalized);
    } else if (field === "option_c") {
      next.option_c_display = normalized;
      setSafeLatex(next, "option_c_latex", normalized);
    } else if (field === "option_d") {
      next.option_d_display = normalized;
      setSafeLatex(next, "option_d_latex", normalized);
    } else if (field === "correct_answer") {
      next.correct_answer_display = normalized;
    } else if (field === "detailed_solution") {
      next.detailed_solution_display = normalized;
      setSafeLatex(next, "detailed_solution_latex", normalized);
    }
  }

  const optionRepair = repairOptions(next);
  if (optionRepair.changed) {
    for (const [field, value] of Object.entries(optionRepair.fields)) {
      (next as unknown as Record<string, string>)[field] = value;
    }
    optionRepair.notes.forEach((note) => rowNotes.add(note));
    optionRepair.issues.forEach((issue) => issueTypes.add(issue));
  }

  next.question_text_markdown = formatQuestionToMarkdown(next.question_text_repaired ?? next.question_text_display ?? next.question_text);
  next.option_a_markdown = formatOptionToMarkdown(next.option_a_repaired ?? next.option_a_display ?? next.option_a);
  next.option_b_markdown = formatOptionToMarkdown(next.option_b_repaired ?? next.option_b_display ?? next.option_b);
  next.option_c_markdown = formatOptionToMarkdown(next.option_c_repaired ?? next.option_c_display ?? next.option_c);
  next.option_d_markdown = formatOptionToMarkdown(next.option_d_repaired ?? next.option_d_display ?? next.option_d);
  next.correct_answer_markdown = formatOptionToMarkdown(next.correct_answer_display ?? next.correct_answer);
  next.detailed_solution_markdown = formatSolutionToMarkdown(next.detailed_solution_repaired ?? next.detailed_solution_display ?? next.detailed_solution);

  const requiredIssues = validateRequiredContent(next);
  requiredIssues.forEach((issue) => issueTypes.add(issue));
  requiredIssues.forEach((issue) => rowNotes.add(issue.replace(/_/g, " ")));
  const unrepairedBrokenOptions = hasUnrepairedBrokenOptions(next);
  if (unrepairedBrokenOptions) {
    issueTypes.add("broken_options");
    rowNotes.add("options: unrepaired ambiguous option text");
  }

  // Inspect the FINAL student-facing markdown for raw-damaged patterns. A damaged
  // question/option/answer must not be called clean; solution-only damage is softer.
  const studentMarkdown = [next.question_text_markdown, next.option_a_markdown, next.option_b_markdown, next.option_c_markdown, next.option_d_markdown, next.correct_answer_markdown];
  const studentResidueSerious = studentMarkdown.some((field) => hasSeriousMathResidue(field ?? ""));
  const studentResidueNotes = studentMarkdown.flatMap((field) => findMathResidue(field ?? ""));
  const solutionResidueNotes = findMathResidue(next.detailed_solution_markdown ?? "");
  studentResidueNotes.forEach((note) => rowNotes.add(`question/option markdown residue: ${note}`));
  solutionResidueNotes.forEach((note) => rowNotes.add(`solution markdown residue: ${note}`));

  const score = reviewScore(Array.from(rowNotes), fieldsChanged);
  let contentStatus = assignContentStatus(next, Array.from(issueTypes), Array.from(rowNotes), optionRepair.changed || Boolean(next.question_text_repaired));
  // Escalate on residual raw math (but never override a "hide" decision).
  const hiddenStatuses = new Set(["hide_from_student", "incomplete_question", "broken_options"]);
  if (!hiddenStatuses.has(contentStatus)) {
    if (studentResidueSerious || studentResidueNotes.length) {
      contentStatus = "needs_math_review";
      issueTypes.add("needs_math_review");
    } else if (solutionResidueNotes.length && contentStatus === "clean") {
      contentStatus = "needs_solution_review";
      issueTypes.add("needs_solution_review");
    }
  }
  next.content_status = contentStatus;
  if (wasHidden && !isHiddenStatus(next)) {
    issueTypes.add("unhidden_after_repair");
    rowNotes.add("status: unhidden after safe display repair");
    unhiddenQuestionIds.push(next.question_id);
  }
  next.content_issue_types = Array.from(issueTypes).sort();
  next.math_cleanup_notes = Array.from(rowNotes).sort();
  next.math_review_status = contentStatus === "clean" ? "clean" : contentStatus === "safe_display" ? "safe_display" : score > 0 ? "needs_review" : "clean";
  if (contentStatus === "needs_solution_review") next.math_review_status = "needs_review";
  reviewRows.push({
    question_id: next.question_id,
    review_score: score,
    content_status: next.content_status,
    math_review_status: next.math_review_status,
    notes: next.math_cleanup_notes,
    fields_cleaned: fieldsChanged,
  });
  return next;
});

const rowsNeedingReview = reviewRows.filter((row) => row.math_review_status === "needs_review");
const hiddenAfter = updated.filter(isHiddenStatus).length;
const previousUnhiddenIds = Array.isArray(previousSummary.unhidden_question_ids) ? previousSummary.unhidden_question_ids.map(String) : [];
const allUnhiddenIds = Array.from(new Set([...previousUnhiddenIds, ...unhiddenQuestionIds]));
const unhiddenCount = Math.max(hiddenBefore - hiddenAfter, Number(previousSummary.unhidden_after_repair ?? 0), allUnhiddenIds.length);
const worstRows = [...rowsNeedingReview]
  .sort((a, b) => b.review_score - a.review_score || b.notes.length - a.notes.length)
  .slice(0, 20);

fs.writeFileSync(sourcePath, JSON.stringify(updated, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(updated.length, fieldsCleaned, rowsNeedingReview.length, worstRows, backupPath, hiddenBefore, hiddenAfter, unhiddenCount), "utf8");
fs.writeFileSync(reviewCsvPath, toCsv(rowsNeedingReview), "utf8");
fs.writeFileSync(summaryPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  total_questions: updated.length,
  hidden_before: hiddenBefore,
  hidden_after: hiddenAfter,
  unhidden_after_repair: unhiddenCount,
  unhidden_question_ids: allUnhiddenIds,
  report: reportRelativePath,
  csv: reviewCsvRelativePath,
}, null, 2), "utf8");

console.log(`Processed CAT Quant questions: ${updated.length}`);
console.log(`Fields cleaned: ${fieldsCleaned}`);
console.log(`Rows needing manual review: ${rowsNeedingReview.length}`);
console.log(`Hidden before: ${hiddenBefore}`);
console.log(`Hidden after: ${hiddenAfter}`);
console.log(`Unhidden after repair: ${unhiddenCount}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`Review CSV: ${reviewCsvRelativePath}`);

function normalizeMathDisplay(input: string, field: FieldName) {
  let value = String(input ?? "");
  value = value
    .replace(/\uFFFD/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00a0/g, " ");

  value = stripLeakedFragments(value, field);
  value = stripTimingPrefix(value);
  value = value
    .replace(/!=/g, "≠")
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/\blog\s*2(?=\s*[\(\[{A-Za-z0-9])/gi, "log₂")
    .replace(/\blog\s*3(?=\s*[\(\[{A-Za-z0-9])/gi, "log₃")
    .replace(/\blog\s*4(?=\s*[\(\[{A-Za-z0-9])/gi, "log₄")
    .replace(/\blog\s*8(?=\s*[\(\[{A-Za-z0-9])/gi, "log₈")
    .replace(/\blog\s*10(?=\s*[\(\[{A-Za-z0-9])/gi, "log₁₀")
    .replace(/\blog\s*16(?=\s*[\(\[{A-Za-z0-9])/gi, "log₁₆")
    .replace(/(?<![A-Za-z0-9])([abcxyztmnuvpqr])\s*\^\s*2\b/g, "$1²")
    .replace(/(?<![A-Za-z0-9])([abcxyztmnuvpqr])\s*\^\s*3\b/g, "$1³")
    .replace(/(?<![A-Za-z0-9])([abcxyztmnuvpqr])2\b/g, "$1²")
    .replace(/(?<![A-Za-z0-9])([abcxyztmnuvpqr])3\b/g, "$1³")
    .replace(/\s*\/\s*/g, "/")
    .replace(/([A-Za-z0-9²³)\]])-(?=[A-Za-z0-9(])/g, "$1 - ")
    .replace(/[ \t]{2,}/g, " ");

  if (field.startsWith("option_")) value = normalizeOptionText(value);

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(field === "detailed_solution" ? "\n" : " ")
    .trim();
}

function stripTimingPrefix(input: string) {
  return input
    .replace(/^Estimated\s+Time:\s*\d+(?:\s*[-–]\s*\d+)?\s*min(?:utes)?\.?\s*/i, "")
    .replace(/^\d+(?:\s*[-–]\s*\d+)?\s*min(?:utes)?\.?\s+/i, "");
}

function stripLeakedFragments(input: string, field: FieldName) {
  const markers = [
    "CAT-Hardened QA Simulation Batch",
    "CAT Hardened Quant Practice Simulation Set",
    "CAT-Hardened Quant Practice",
    "CAT Quant Hardened Simulation Set",
    "Question Paper",
    "Answer Key",
    "Topic-Wise Distribution",
    "Quality Verification Summary",
  ];

  let output = input;
  for (const marker of markers) {
    output = truncateAt(output, marker);
  }

  if (field.startsWith("option_")) {
    output = truncateAt(output, "Topic:");
    output = truncateAt(output, "Difficulty:");
    output = truncateAt(output, "Type:");
  } else {
    output = output
      .replace(/^Topic:\s*.*$/gim, "")
      .replace(/^Difficulty:\s*.*$/gim, "")
      .replace(/^Type:\s*.*$/gim, "");
  }

  return output
    .replace(/\bPage\s+\d+(?:\s+of\s+\d+)?\b/gi, "")
    .replace(/\bSource\s*:\s*.*$/gim, "");
}

function normalizeOptionText(input: string) {
  const isolatedTopic = /^(Algebra|Number System|Geometry\s*\/\s*Mensuration|Geometry\/Mensuration|Arithmetic|Modern Math|Modern Math\s*\/\s*Probability|Modern Math\s*\/\s*P&C\s*\/\s*Counting)$/i;
  let output = input.trim();
  if (isolatedTopic.test(output)) return "";
  output = output.replace(/^annot\b/i, "Cannot");
  return output;
}

function detectSuspicious(raw: string, normalized: string, field: FieldName) {
  const notes: string[] = [];
  if (/\uFFFD/.test(raw)) notes.push(`${field}: replacement character found`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(raw)) notes.push(`${field}: control character found`);
  if (/CAT-Hardened|CAT Hardened|Question Paper|Answer Key|Topic-Wise Distribution|Quality Verification Summary|Topic:|Difficulty:|Type:/i.test(raw)) {
    notes.push(`${field}: leaked source or batch fragment cleaned`);
  }
  if (/\b\d+\s+[a-z][²³]\b/i.test(normalized)) notes.push(`${field}: possible missing slash before power`);
  if (hasAmbiguousSlash(normalized)) notes.push(`${field}: ambiguous slash or fraction structure`);
  if (field.startsWith("option_") && raw && !normalized) notes.push(`${field}: malformed option text cleaned to blank`);
  if (field.startsWith("option_") && /[A-Za-z]{8,}.*[A-Za-z]{8,}/.test(normalized) && !/[+\-*/=≤≥≠²³]/.test(normalized) && !/cannot be determined|none of these|all of these/i.test(normalized)) {
    notes.push(`${field}: option contains prose-like text`);
  }
  return notes;
}

function readExistingSummary() {
  if (!fs.existsSync(summaryPath)) return {} as Record<string, unknown>;
  try {
    return JSON.parse(fs.readFileSync(summaryPath, "utf8")) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function repairOptions(question: GeneratedPracticeQuestion) {
  const keys = ["option_a", "option_b", "option_c", "option_d"] as const;
  const repairedKeys = ["option_a_repaired", "option_b_repaired", "option_c_repaired", "option_d_repaired"] as const;
  const rawOptions = keys.map((key) => String(question[key] ?? "").trim().replace(/\s+/g, " "));
  const pairMatches = rawOptions.map((option) => /^(\d{1,6})\s+(\d{1,6})$/.exec(option));
  const pairCount = pairMatches.filter(Boolean).length;
  const notes: string[] = [];
  const issues: string[] = [];
  const fields: Record<string, string> = {};

  if (!pairCount) return { changed: false, notes, issues, fields };

  if (pairCount >= 2) {
    pairMatches.forEach((match, index) => {
      if (!match) {
        fields[repairedKeys[index]] = rawOptions[index];
        return;
      }
      fields[repairedKeys[index]] = `${match[1]}/${match[2]}`;
    });
    notes.push("options: fraction pattern repaired");
    issues.push("broken_options_repaired");
    return { changed: true, notes, issues, fields };
  }

  const matchIndex = pairMatches.findIndex(Boolean);
  const match = pairMatches[matchIndex];
  if (!match) return { changed: false, notes, issues, fields };

  const first = match[1];
  const second = match[2];
  const otherOptions = rawOptions.filter((_, index) => index !== matchIndex);
  const otherOptionsArePlain = otherOptions.every((option) => /^-?\d+(?:\.\d+)?$/.test(option) || /^[A-D]$/i.test(option));

  if (/^[1-4]$/.test(second) && otherOptionsArePlain) {
    fields[repairedKeys[matchIndex]] = first;
    notes.push("options: trailing answer-key digit removed");
    issues.push("broken_options_repaired");
    return { changed: true, notes, issues, fields };
  }

  if (/^(2|3|5|6|7|10|11|13|17|19|22|33|65)$/.test(second)) {
    fields[repairedKeys[matchIndex]] = `${first} sqrt(${second})`;
    notes.push("options: missing square-root symbol restored");
    issues.push("broken_options_repaired");
    return { changed: true, notes, issues, fields };
  }

  return { changed: false, notes: ["options: single adjacent-number option left for review"], issues: ["broken_options"], fields };
}

function validateRequiredContent(question: GeneratedPracticeQuestion) {
  const issues: string[] = [];
  if (!String(question.question_text_repaired ?? question.question_text_display ?? question.question_text ?? "").trim()) issues.push("incomplete_question");
  if (!String(question.correct_answer_display ?? question.correct_answer ?? "").trim()) issues.push("missing_correct_answer");
  if (!String(question.detailed_solution_repaired ?? question.detailed_solution_display ?? question.detailed_solution ?? "").trim()) issues.push("missing_solution");
  if ((question.question_type === "MCQ" || question.question_type === "MSQ") && ![
    question.option_a_repaired ?? question.option_a_display ?? question.option_a,
    question.option_b_repaired ?? question.option_b_display ?? question.option_b,
    question.option_c_repaired ?? question.option_c_display ?? question.option_c,
    question.option_d_repaired ?? question.option_d_display ?? question.option_d,
  ].every((option) => String(option ?? "").trim())) {
    issues.push("broken_options");
  }
  return issues;
}

function hasUnrepairedBrokenOptions(question: GeneratedPracticeQuestion) {
  if (question.question_type !== "MCQ" && question.question_type !== "MSQ") return false;
  const values = [
    question.option_a_repaired ?? question.option_a,
    question.option_b_repaired ?? question.option_b,
    question.option_c_repaired ?? question.option_c,
    question.option_d_repaired ?? question.option_d,
  ].map((value) => String(value ?? "").trim());

  const adjacentPairs = values.filter((value) => /^\d{1,6}\s+\d{1,6}$/.test(value));
  if (!adjacentPairs.length) return false;
  if (adjacentPairs.length >= 2) return false;
  const pair = /^(\d{1,6})\s+(\d{1,6})$/.exec(adjacentPairs[0]);
  if (!pair) return false;
  if (/^[1-4]$/.test(pair[2])) return false;
  return true;
}

function assignContentStatus(
  question: GeneratedPracticeQuestion,
  issues: string[],
  notes: string[],
  repaired: boolean,
): PracticeContentStatus {
  if (issues.includes("incomplete_question") || issues.includes("missing_correct_answer") || issues.includes("missing_solution")) return "hide_from_student";
  if (issues.includes("broken_options") && !issues.includes("broken_options_repaired")) return "hide_from_student";
  if (notes.some((note) => note.includes("ambiguous slash") || note.includes("possible missing slash"))) return "needs_solution_review";
  if (repaired || issues.some((issue) => issue.endsWith("_repaired"))) return "safe_display";
  if (question.math_review_status === "safe_display") return "safe_display";
  return "clean";
}

function issueTypeFromNote(note: string) {
  if (note.includes("control character")) return "control_character";
  if (note.includes("replacement character")) return "replacement_character";
  if (note.includes("leaked source")) return "leaked_source_fragment";
  if (note.includes("ambiguous slash")) return "ambiguous_slash_or_fraction_structure";
  if (note.includes("possible missing slash")) return "possible_missing_slash";
  if (note.includes("malformed option")) return "broken_options";
  if (note.includes("option contains prose")) return "broken_options";
  return note.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function isHiddenStatus(question: Pick<GeneratedPracticeQuestion, "content_status">) {
  return question.content_status === "hide_from_student" || question.content_status === "incomplete_question" || question.content_status === "broken_options";
}

function hasAmbiguousSlash(input: string) {
  if (!input.includes("/")) return false;
  if (/^\d+\/\d+$/.test(input.trim())) return false;
  return /[A-Za-z0-9²³)\]]\/[A-Za-z(]/.test(input) || /\/.*\//.test(input);
}

function setSafeLatex(question: GeneratedPracticeQuestion, field: keyof GeneratedPracticeQuestion, display: string) {
  const latex = toSafeLatex(display);
  if (latex) {
    (question as Record<string, unknown>)[field] = latex;
  } else {
    delete (question as Record<string, unknown>)[field];
  }
}

function toSafeLatex(display: string) {
  const value = display.trim();
  if (!value || value.length > 80) return "";
  if (/[A-Za-z]{4,}\s+[A-Za-z]{4,}/.test(value)) return "";
  let latex = value
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/log₂/g, "\\log_2")
    .replace(/log₃/g, "\\log_3")
    .replace(/log₄/g, "\\log_4")
    .replace(/log₈/g, "\\log_8")
    .replace(/log₁₀/g, "\\log_{10}");
  latex = latex.replace(/log₁₆/g, "\\log_{16}");
  if (!/^[0-9A-Za-z+\-*/=().,\s_^{}\\<>≤≥≠:]+$/.test(latex)) return "";
  if ((latex.match(/\(/g) ?? []).length !== (latex.match(/\)/g) ?? []).length) return "";
  if ((latex.match(/{/g) ?? []).length !== (latex.match(/}/g) ?? []).length) return "";
  latex = latex.replace(/(?<!\\)\*/g, "\\cdot ");
  return latex.trim();
}

function reviewScore(notes: string[], fieldsChanged: string[]) {
  return notes.length * 10;
}

function buildReport(
  total: number,
  cleaned: number,
  reviewCount: number,
  worstRows: ReviewRow[],
  backupPath: string,
  hiddenBefore: number,
  hiddenAfter: number,
  unhidden: number,
) {
  const statusRows = toCounts(worstRows.map((row) => row.content_status));
  return `# CAT Quant Math Normalization Report

Generated: ${new Date().toISOString()}

Input/Output: \`${sourceRelativePath}\`

Backup: \`${path.relative(process.cwd(), backupPath).replace(/\\/g, "/")}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions processed | ${total} |
| Fields cleaned | ${cleaned} |
| Rows needing manual review | ${reviewCount} |
| Hidden before | ${hiddenBefore} |
| Hidden after | ${hiddenAfter} |
| Unhidden after repair | ${unhidden} |

## Top 20 Worst Rows Needing Review

${worstRows.length ? worstRows.map((row, index) => `${index + 1}. \`${row.question_id}\` score ${row.review_score} - ${row.notes.join("; ")}`).join("\n") : "- None"}

## Review Status Mix

${statusRows.length ? statusRows.map((row) => `- ${row.label}: ${row.count}`).join("\n") : "- None"}

## Notes

- Raw fields were preserved.
- New \`*_display\` fields were written for question, options, correct answer, and solution.
- Optional \`*_latex\` fields were added only for short, expression-like values.
- Practice level and scoring fields were not changed.
`;
}

function toCsv(rows: ReviewRow[]) {
  const headers = ["question_id", "review_score", "content_status", "math_review_status", "fields_cleaned", "notes"] as const;
  return [
    headers.join(","),
    ...rows
      .sort((a, b) => b.review_score - a.review_score)
      .map((row) => headers.map((header) => csvCell(Array.isArray(row[header]) ? row[header].join("; ") : row[header])).join(",")),
  ].join("\n");
}

function toCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((record, value) => {
    record[value] = (record[value] ?? 0) + 1;
    return record;
  }, {});
  return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function truncateAt(input: string, marker: string) {
  const index = input.toLowerCase().indexOf(marker.toLowerCase());
  return index >= 0 ? input.slice(0, index) : input;
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

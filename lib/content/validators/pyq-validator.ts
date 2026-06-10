import { exams } from "../../../data/exams";
import { cleanPyqRow } from "@/lib/content/cleaners/pyq-text-cleaner";
import type {
  LocalDifficulty,
  LocalPyqCleanRow,
  LocalPyqInputRow,
  LocalQuestionType,
  PyqValidationResult,
  RowValidationResult,
  ValidationIssue,
} from "@/lib/content/validators/types";

const requiredFields = [
  "exam_slug",
  "section",
  "year",
  "paper_code",
  "question_id",
  "question_text",
  "question_type",
  "correct_answer",
  "topic",
  "subtopic",
  "difficulty",
];

const validQuestionTypes: LocalQuestionType[] = ["MCQ", "TITA", "MSQ", "descriptive"];
const validDifficulties: LocalDifficulty[] = ["Easy", "Medium", "Medium-Hard", "Hard"];
const validExamSlugs = new Set(exams.map((exam) => exam.slug));
const knownTopics = new Set(exams.flatMap((exam) => exam.topTopics.map((topic) => normalizeKey(topic.name))));
const knownSubtopics = new Set<string>();

export function validatePyqRows(rows: LocalPyqInputRow[], options: { requirePublishedSolution?: boolean } = {}): PyqValidationResult {
  const validatedRows = rows.map((row, index) => validatePyqRow(row, index, options));
  const validRows = validatedRows.filter((row) => row.errors.length === 0);
  const topics = unique(validatedRows.map((row) => row.clean.topic).filter(Boolean));
  const subtopics = unique(validatedRows.map((row) => row.clean.subtopic).filter(Boolean));
  const newTopics = topics.filter((topic) => !knownTopics.has(normalizeKey(topic)));
  const newSubtopics = subtopics.filter((subtopic) => !knownSubtopics.has(normalizeKey(subtopic)));
  const cleaningWarningCounts = countCleaningWarnings(validatedRows);

  return {
    rows: validatedRows,
    summary: {
      totalRows: rows.length,
      validRows: validRows.length,
      errorRows: validatedRows.filter((row) => row.errors.length > 0).length,
      warningRows: validatedRows.filter((row) => row.warnings.length > 0).length,
      cleanedRows: validatedRows.filter((row) => row.warnings.some((warning) => warning.message.startsWith("Cleaning:"))).length,
      suspiciousRows: validatedRows.filter((row) =>
        row.warnings.some((warning) =>
          ["possible_dirty_text", "suspicious_option_text", "suspicious_question_text"].some((code) => warning.message.includes(code)),
        ),
      ).length,
      cleaningWarnings: Object.entries(cleaningWarningCounts)
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count),
      questionIdsNeedingManualReview: validatedRows
        .filter((row) =>
          row.warnings.some((warning) =>
            ["possible_dirty_text", "suspicious_option_text", "suspicious_question_text"].some((code) => warning.message.includes(code)),
          ),
        )
        .map((row) => row.clean.question_id)
        .filter(Boolean),
      topics,
      subtopics,
      newTopics,
      newSubtopics,
      freeCount: validatedRows.filter((row) => row.clean.is_free).length,
      premiumCount: validatedRows.filter((row) => row.clean.is_premium).length,
    },
  };
}

export function validatePyqRow(
  row: LocalPyqInputRow,
  rowIndex = 0,
  options: { requirePublishedSolution?: boolean } = {},
): RowValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const cleaning = cleanPyqRow(row);
  const cleanRow = cleaning.row;

  for (const cleaningWarning of cleaning.warnings) {
    warnings.push({
      field: cleaningWarning.field,
      message: `Cleaning:${cleaningWarning.code}: ${cleaningWarning.message}`,
      severity: "warning",
    });
  }

  const questionType = normalizeQuestionType(value(cleanRow.question_type));
  const difficulty = normalizeDifficulty(value(cleanRow.difficulty));
  const isFree = parseBoolean(cleanRow.is_free, false);
  const isPremium = parseBoolean(cleanRow.is_premium, false);
  const status = value(cleanRow.status).toLowerCase() === "published" ? "published" : "draft";

  for (const field of requiredFields) {
    if (!value(cleanRow[field])) {
      errors.push({ field, message: `${field} is required.`, severity: "error" });
    }
  }

  if (!validExamSlugs.has(value(cleanRow.exam_slug))) {
    errors.push({ field: "exam_slug", message: `Unsupported exam_slug "${value(cleanRow.exam_slug)}".`, severity: "error" });
  }

  if (!questionType) {
    errors.push({ field: "question_type", message: "question_type must be MCQ, TITA, MSQ, or descriptive.", severity: "error" });
  }

  if (!difficulty) {
    errors.push({ field: "difficulty", message: "difficulty must be Easy, Medium, Medium-Hard, or Hard.", severity: "error" });
  }

  if (!value(cleanRow.question_text)) {
    errors.push({ field: "question_text", message: "question_text must not be empty.", severity: "error" });
  }

  if ((status === "published" || options.requirePublishedSolution) && !value(cleanRow.detailed_solution)) {
    errors.push({ field: "detailed_solution", message: "Published content requires a detailed_solution.", severity: "error" });
  } else if (!value(cleanRow.detailed_solution)) {
    warnings.push({ field: "detailed_solution", message: "Solution is empty; keep this row in draft until solved.", severity: "warning" });
  }

  if (questionType === "MCQ" || questionType === "MSQ") {
    const optionsPresent = ["option_a", "option_b", "option_c", "option_d"].filter((field) => value(cleanRow[field])).length;
    if (optionsPresent < 2) {
      errors.push({ field: "options", message: `${questionType} rows require answer options.`, severity: "error" });
    }

    if (questionType === "MCQ" && !isValidMcqAnswer(value(cleanRow.correct_answer), cleanRow)) {
      errors.push({
        field: "correct_answer",
        message: "MCQ correct_answer must be A/B/C/D or match one option exactly.",
        severity: "error",
      });
    }
  }

  if (questionType === "TITA" && ["option_a", "option_b", "option_c", "option_d"].some((field) => value(cleanRow[field]))) {
    warnings.push({ field: "options", message: "TITA rows do not require options; options will be preserved but are not required.", severity: "warning" });
  }

  for (const scoreField of ["frequency_weight", "probability_score", "trend_score"]) {
    if (value(cleanRow[scoreField]) && parseNumeric(cleanRow[scoreField]) === null) {
      errors.push({ field: scoreField, message: `${scoreField} must be numeric if present.`, severity: "error" });
    }
  }

  if (!knownTopics.has(normalizeKey(value(cleanRow.topic)))) {
    warnings.push({ field: "topic", message: `New topic detected: ${value(cleanRow.topic) || "blank"}.`, severity: "warning" });
  }

  if (value(cleanRow.subtopic) && !knownSubtopics.has(normalizeKey(value(cleanRow.subtopic)))) {
    warnings.push({ field: "subtopic", message: `New subtopic detected: ${value(cleanRow.subtopic)}.`, severity: "warning" });
  }

  if (!isFree && !isPremium) {
    warnings.push({ field: "access", message: "Neither is_free nor is_premium is true; row will be treated as premium by default in UI locks.", severity: "warning" });
  }

  const clean: LocalPyqCleanRow = {
    exam_slug: value(cleanRow.exam_slug),
    section: value(cleanRow.section),
    year: parseNumeric(cleanRow.year),
    slot: value(cleanRow.slot),
    paper_code: value(cleanRow.paper_code),
    question_id: value(cleanRow.question_id),
    question_text: value(cleanRow.question_text),
    question_type: questionType ?? "MCQ",
    option_a: value(cleanRow.option_a),
    option_b: value(cleanRow.option_b),
    option_c: value(cleanRow.option_c),
    option_d: value(cleanRow.option_d),
    correct_answer: value(cleanRow.correct_answer),
    detailed_solution: value(cleanRow.detailed_solution),
    topic: value(cleanRow.topic),
    subtopic: value(cleanRow.subtopic),
    archetype: value(cleanRow.archetype),
    difficulty: difficulty ?? "Medium",
    source_reference: value(cleanRow.source_reference),
    frequency_weight: parseNumeric(cleanRow.frequency_weight),
    probability_score: parseNumeric(cleanRow.probability_score),
    trend_score: parseNumeric(cleanRow.trend_score),
    is_free: isFree,
    is_premium: isPremium || (!isFree && !isPremium),
    tags: parseTags(cleanRow.tags),
    status,
  };

  return {
    rowIndex,
    original: row,
    clean,
    errors,
    warnings,
  };
}

export function parseBoolean(input: unknown, fallback = false) {
  const normalized = value(input).toLowerCase();
  if (["true", "yes", "y", "1"].includes(normalized)) return true;
  if (["false", "no", "n", "0"].includes(normalized)) return false;
  return fallback;
}

export function parseNumeric(input: unknown) {
  const raw = value(input);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeQuestionType(input: string): LocalQuestionType | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "mcq") return "MCQ";
  if (normalized === "tita") return "TITA";
  if (normalized === "msq") return "MSQ";
  if (normalized === "descriptive") return "descriptive";
  return null;
}

function normalizeDifficulty(input: string): LocalDifficulty | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, "-");
  if (normalized === "easy") return "Easy";
  if (normalized === "medium") return "Medium";
  if (normalized === "medium-hard" || normalized === "mediumhard") return "Medium-Hard";
  if (normalized === "hard") return "Hard";
  return null;
}

function isValidMcqAnswer(answer: string, row: LocalPyqInputRow) {
  if (["A", "B", "C", "D"].includes(answer.toUpperCase())) return true;
  return ["option_a", "option_b", "option_c", "option_d"].some((field) => value(row[field]).toLowerCase() === answer.toLowerCase());
}

function parseTags(input: unknown) {
  return value(input)
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function value(input: unknown) {
  if (input === null || input === undefined) return "";
  return String(input).trim();
}

function normalizeKey(input: string) {
  return input.trim().toLowerCase();
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function countCleaningWarnings(rows: RowValidationResult[]) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    for (const warning of row.warnings) {
      const match = warning.message.match(/^Cleaning:([^:]+):/);
      if (!match) continue;
      counts[match[1]] = (counts[match[1]] ?? 0) + 1;
    }
    return counts;
  }, {});
}

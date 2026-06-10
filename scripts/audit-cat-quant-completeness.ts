import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion, PracticeCompletenessStatus } from "../types/practice";
import { formatOptionToMarkdown, formatQuestionToMarkdown, formatSolutionToMarkdown, normalizeMathText } from "../lib/content/practice/solution-formatting";

type SourceQuestion = Record<string, unknown>;

type IssueRow = {
  question_id: string;
  practice_level: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  current_question_text: string;
  current_question_word_count: number;
  source_reference: string;
  source_pdf: string;
  completeness_status: string;
  issue_types: string;
  repair_confidence: string;
  repaired_question_text: string;
  recommended_action: string;
  student_visible: string;
};

const sourceRelativePath = "content/cat/practice/generated/cat_quant_generated_practice.json";
const backupDirRelativePath = "content/cat/practice/generated/backups";
const reportRelativePath = "reports/local_imports/CAT_QUANT_COMPLETENESS_AUDIT.md";
const csvRelativePath = "content/cat/practice/reports/cat_quant_completeness_issues.csv";

const sourceRoot = "D:/CAT PREDN MODEL/cat_prediction_engine_structured/data/generated_question_pool";
const sourceDirs = ["parsed_json", "verified", "combined", "exports"];
const extractedTextDir = path.join(sourceRoot, "extracted_text");

const dataPath = path.join(process.cwd(), sourceRelativePath);
const backupDir = path.join(process.cwd(), backupDirRelativePath);
const reportPath = path.join(process.cwd(), reportRelativePath);
const csvPath = path.join(process.cwd(), csvRelativePath);

if (!fs.existsSync(dataPath)) {
  console.error(`Generated practice JSON not found: ${sourceRelativePath}`);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `cat_quant_generated_practice_before_completeness_audit_${timestamp}.json`);
fs.copyFileSync(dataPath, backupPath);

const questions = JSON.parse(fs.readFileSync(dataPath, "utf8")) as GeneratedPracticeQuestion[];
const hiddenBefore = questions.filter(isCompletenessHidden).length;
const sourceIndex = buildSourceIndex();
const textFiles = listExtractedTextFiles();
const issueRows: IssueRow[] = [];
const repairedExamples: GeneratedPracticeQuestion[] = [];
const hiddenExamples: GeneratedPracticeQuestion[] = [];

const updated = questions.map((question) => {
  const next: GeneratedPracticeQuestion = { ...question };
  const issues = new Set<string>();
  const source = sourceIndex.get(question.question_id);
  const sourceMatch = source ?? findSourceByText(question, textFiles);
  const sourceFound = Boolean(sourceMatch);

  detectCompletenessIssues(question).forEach((issue) => issues.add(issue));

  const repair = tryRepairFromSource(question, sourceMatch);
  if (repair.questionText) {
    next.question_text_repaired = repair.questionText;
    next.repair_source = repair.source;
    next.repair_confidence = repair.confidence;
    next.question_text_markdown = formatQuestionToMarkdown(repair.questionText);
  }
  if (repair.optionA) next.option_a_repaired = repair.optionA;
  if (repair.optionB) next.option_b_repaired = repair.optionB;
  if (repair.optionC) next.option_c_repaired = repair.optionC;
  if (repair.optionD) next.option_d_repaired = repair.optionD;
  if (repair.solution) next.detailed_solution_repaired = repair.solution;

  if (repair.optionA || repair.optionB || repair.optionC || repair.optionD) {
    next.option_a_markdown = formatOptionToMarkdown(next.option_a_repaired ?? next.option_a_display ?? next.option_a);
    next.option_b_markdown = formatOptionToMarkdown(next.option_b_repaired ?? next.option_b_display ?? next.option_b);
    next.option_c_markdown = formatOptionToMarkdown(next.option_c_repaired ?? next.option_c_display ?? next.option_c);
    next.option_d_markdown = formatOptionToMarkdown(next.option_d_repaired ?? next.option_d_display ?? next.option_d);
  }
  if (repair.solution) {
    next.detailed_solution_markdown = formatSolutionToMarkdown(repair.solution);
  }

  if (repair.questionText || repair.optionA || repair.optionB || repair.optionC || repair.optionD || repair.solution) {
    issues.add("repaired_from_source");
  }

  const status = assignCompletenessStatus(question, next, Array.from(issues), sourceFound);
  next.completeness_status = status;
  next.completeness_issue_types = Array.from(issues).sort();

  if (status === "repaired_from_source") repairedExamples.push(next);
  if (isCompletenessHidden(next)) hiddenExamples.push(next);
  if (status !== "complete") issueRows.push(toIssueRow(next, sourceMatch));

  return next;
});

const hiddenAfter = updated.filter(isCompletenessHidden).length;
const counts = countStatuses(updated);

fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(updated, counts, hiddenBefore, hiddenAfter, repairedExamples, hiddenExamples, backupPath), "utf8");
fs.writeFileSync(csvPath, toCsv(issueRows), "utf8");

console.log(`Total questions audited: ${updated.length}`);
console.log(`Complete: ${counts.complete ?? 0}`);
console.log(`Repaired from source: ${counts.repaired_from_source ?? 0}`);
console.log(`Likely incomplete: ${counts.likely_incomplete ?? 0}`);
console.log(`Source not found: ${counts.source_not_found ?? 0}`);
console.log(`Hide until repaired: ${counts.hide_until_repaired ?? 0}`);
console.log(`Hidden before: ${hiddenBefore}`);
console.log(`Hidden after: ${hiddenAfter}`);
console.log(`Report: ${reportRelativePath}`);
console.log(`CSV: ${csvRelativePath}`);

function detectCompletenessIssues(question: GeneratedPracticeQuestion) {
  const issues = new Set<string>();
  const raw = clean(question.question_text);
  const solution = clean(question.detailed_solution);
  const questionWords = wordCount(raw);
  const solutionWords = wordCount(solution);
  const askPattern = /\b(find|determine|what is|how many|maximum|minimum|number of|value of)\b/i;
  const hasSetup = /[=<>]|satisfy|given|where|such that|if|let|triangle|circle|digits?|roots?|integer|ratio|percent|average|speed|distance/i.test(raw);

  if (questionWords < 25 && solutionWords > 70) issues.add("short_question_long_solution");
  if (askPattern.test(raw) && questionWords < 18) issues.add("final_ask_only");
  if (askPattern.test(raw) && !hasSetup) issues.add("missing_setup_or_conditions");
  if (/^if\b/i.test(raw) && questionWords < 16) issues.add("starts_with_short_condition");
  if (/find the value/i.test(raw) && questionWords < 20) issues.add("possibly_missing_equations");
  if (solutionMentionsMissingRelations(raw, solution)) issues.add("solution_relations_absent_from_question");
  if (topicNeedsEquation(question) && !/[=<>]|log|√|ratio|:|\d/.test(raw)) issues.add("topic_setup_missing_equation_or_values");
  if (!question.correct_answer?.trim()) issues.add("missing_answer");
  if ((question.question_type === "MCQ" || question.question_type === "MSQ") && ![question.option_a, question.option_b, question.option_c, question.option_d].every((option) => option?.trim())) {
    issues.add("missing_options");
  }

  return Array.from(issues);
}

function tryRepairFromSource(question: GeneratedPracticeQuestion, source?: SourceQuestion | null) {
  const result: {
    questionText?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    solution?: string;
    source?: string;
    confidence?: "high" | "medium" | "low";
  } = {};

  if (!source) return result;

  const rawQuestion = clean(question.question_text);
  const sourceQuestion = clean(str(source.question_text));
  const archetype = clean(str(source.pyq_inspired_archetype));
  const sourceName = sourceFileLabel(source);

  if (sourceQuestion && sourceQuestion.length > rawQuestion.length + 40 && isBetterQuestionText(sourceQuestion, rawQuestion)) {
    result.questionText = sourceQuestion;
    result.source = sourceName;
    result.confidence = "high";
  } else if (question.question_text_repaired && isBetterQuestionText(question.question_text_repaired, rawQuestion)) {
    result.questionText = question.question_text_repaired;
    result.source = question.repair_source ?? "existing_repaired_field";
    result.confidence = question.repair_confidence ?? "medium";
  } else if (archetype && rawQuestion.length < 80 && /satisfy|given|where|with|such that|log|xy\s*=|roots?|equation/i.test(archetype)) {
    result.questionText = mergeArchetypeAndQuestion(archetype, rawQuestion);
    result.source = sourceName;
    result.confidence = "medium";
  }

  const optionA = clean(str(source.option_a));
  const optionB = clean(str(source.option_b));
  const optionC = clean(str(source.option_c));
  const optionD = clean(str(source.option_d));
  if (isBetterField(optionA, question.option_a)) result.optionA = optionA;
  if (isBetterField(optionB, question.option_b)) result.optionB = optionB;
  if (isBetterField(optionC, question.option_c)) result.optionC = optionC;
  if (isBetterField(optionD, question.option_d)) result.optionD = optionD;

  const sourceSolution = clean(str(source.detailed_solution));
  if (sourceSolution && sourceSolution.length > clean(question.detailed_solution).length + 80) {
    result.solution = sourceSolution;
    result.source = result.source ?? sourceName;
    result.confidence = result.confidence ?? "medium";
  }

  return result;
}

function assignCompletenessStatus(
  original: GeneratedPracticeQuestion,
  next: GeneratedPracticeQuestion,
  issues: string[],
  sourceFound: boolean,
): PracticeCompletenessStatus {
  if (issues.includes("missing_answer") || issues.includes("missing_options")) return "hide_until_repaired";
  if (issues.includes("repaired_from_source")) return "repaired_from_source";
  if (!issues.length) return "complete";
  if (original.question_text_repaired && isBetterQuestionText(original.question_text_repaired, original.question_text)) return "repaired_from_source";
  if (!sourceFound) return "source_not_found";
  if (isCriticalIncomplete(issues)) return "likely_incomplete";
  return "needs_manual_review";
}

function isCriticalIncomplete(issues: string[]) {
  return issues.includes("final_ask_only") || issues.includes("possibly_missing_equations") || issues.includes("solution_relations_absent_from_question");
}

function solutionMentionsMissingRelations(questionText: string, solutionText: string) {
  const question = normalizeMathText(questionText).toLowerCase();
  const solution = normalizeMathText(solutionText).toLowerCase();
  const relationPatterns = [
    /xy\s*=\s*\d+/g,
    /log[_a-z{}]*\s+[xyab]/g,
    /[a-z]\s*\+\s*[a-z]\s*=\s*[^,.]+/g,
    /[a-z]{1,2}\s*=\s*\d+/g,
  ];
  let missing = 0;
  for (const pattern of relationPatterns) {
    const matches = solution.match(pattern) ?? [];
    for (const match of matches.slice(0, 4)) {
      const compact = match.replace(/\s+/g, "");
      if (compact.length >= 4 && !question.replace(/\s+/g, "").includes(compact)) missing += 1;
    }
  }
  return missing >= 2 && wordCount(questionText) < 35;
}

function topicNeedsEquation(question: GeneratedPracticeQuestion) {
  return /log|function|quadratic|equation|root|geometry|coordinate/i.test(`${question.topic} ${question.subtopic}`);
}

function buildSourceIndex() {
  const index = new Map<string, SourceQuestion>();
  for (const dirName of sourceDirs) {
    const dir = path.join(sourceRoot, dirName);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir).filter((file) => file.endsWith(".json"));
    for (const file of files) {
      try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
        for (const question of extractSourceQuestions(parsed)) {
          const id = str(question.generated_id || question.question_id);
          if (id && !index.has(id)) {
            question.__source_file = file;
            index.set(id, question);
          }
        }
      } catch {
        // Ignore malformed source artifacts; the audit will report source misses.
      }
    }
  }
  return index;
}

function extractSourceQuestions(input: unknown): SourceQuestion[] {
  if (Array.isArray(input)) return input.filter(isObject);
  if (isObject(input)) {
    if (Array.isArray(input.questions)) return input.questions.filter(isObject);
    if (Array.isArray(input.data)) return input.data.filter(isObject);
    if (str(input.generated_id || input.question_id)) return [input];
  }
  return [];
}

function listExtractedTextFiles() {
  if (!fs.existsSync(extractedTextDir)) return [] as Array<{ file: string; text: string }>;
  return walk(extractedTextDir)
    .filter((file) => file.endsWith(".txt") || file.endsWith(".md"))
    .slice(0, 400)
    .map((file) => {
      try {
        return { file, text: fs.readFileSync(file, "utf8") };
      } catch {
        return { file, text: "" };
      }
    });
}

function findSourceByText(question: GeneratedPracticeQuestion, files: Array<{ file: string; text: string }>) {
  const phrase = uniquePhrase(question.question_text);
  if (!phrase) return null;
  const hit = files.find((file) => file.text.toLowerCase().includes(phrase.toLowerCase()));
  if (!hit) return null;
  return {
    generated_id: question.question_id,
    question_text: extractNearbyQuestionText(hit.text, phrase) || question.question_text,
    __source_file: hit.file,
  } as SourceQuestion;
}

function extractNearbyQuestionText(text: string, phrase: string) {
  const index = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (index < 0) return "";
  const start = Math.max(0, text.lastIndexOf("\n", index - 300));
  const end = text.indexOf("\n\n", index + phrase.length);
  return clean(text.slice(start, end > index ? end : Math.min(text.length, index + 900)));
}

function uniquePhrase(text: string) {
  const words = clean(text).split(/\s+/).filter((word) => word.length > 3);
  if (words.length < 6) return "";
  return words.slice(0, 10).join(" ");
}

function toIssueRow(question: GeneratedPracticeQuestion, source?: SourceQuestion | null): IssueRow {
  const visible = !isCompletenessHidden(question);
  return {
    question_id: question.question_id,
    practice_level: question.practice_level,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    current_question_text: question.question_text,
    current_question_word_count: wordCount(question.question_text),
    source_reference: question.source_reference,
    source_pdf: str(source?.source_pdf || (question as unknown as Record<string, unknown>).source_pdf),
    completeness_status: question.completeness_status ?? "complete",
    issue_types: (question.completeness_issue_types ?? []).join("; "),
    repair_confidence: question.repair_confidence ?? "",
    repaired_question_text: question.question_text_repaired ?? "",
    recommended_action: visible ? "Visible after source/completeness gate." : "Hidden until source-complete prompt/options are available.",
    student_visible: visible ? "yes" : "no",
  };
}

function buildReport(
  items: GeneratedPracticeQuestion[],
  counts: Record<string, number>,
  hiddenBefore: number,
  hiddenAfter: number,
  repairs: GeneratedPracticeQuestion[],
  hidden: GeneratedPracticeQuestion[],
  backupPath: string,
) {
  const suspicious = items.filter((question) => question.completeness_status !== "complete").slice(0, 50);
  return `# CAT Quant Completeness Audit

Generated: ${new Date().toISOString()}

Source JSON: \`${sourceRelativePath}\`

Backup: \`${path.relative(process.cwd(), backupPath).replace(/\\/g, "/")}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total questions | ${items.length} |
| Complete questions | ${counts.complete ?? 0} |
| Repaired from source | ${counts.repaired_from_source ?? 0} |
| Likely incomplete | ${counts.likely_incomplete ?? 0} |
| Source not found | ${counts.source_not_found ?? 0} |
| Needs manual review | ${counts.needs_manual_review ?? 0} |
| Hide until repaired | ${counts.hide_until_repaired ?? 0} |
| Questions hidden before | ${hiddenBefore} |
| Questions hidden after | ${hiddenAfter} |

## Top 50 Suspicious Rows

${suspicious.length ? suspicious.map((question, index) => `${index + 1}. \`${question.question_id}\` - ${question.completeness_status}: ${(question.completeness_issue_types ?? []).join(", ") || "no issue types"}`).join("\n") : "- None"}

## Successful Source Repairs

${repairs.length ? repairs.slice(0, 10).map((question, index) => `${index + 1}. \`${question.question_id}\` (${question.repair_confidence ?? "unknown"}) - ${describeRepair(question)}`).join("\n") : "- None"}

## Still Needing Manual Review / Hidden

${hidden.length ? hidden.slice(0, 10).map((question, index) => `${index + 1}. \`${question.question_id}\` - ${question.completeness_status}: ${(question.completeness_issue_types ?? []).join(", ")}`).join("\n") : "- None"}

## Artifacts

- CSV: \`${csvRelativePath}\`
`;
}

function toCsv(rows: IssueRow[]) {
  const headers = [
    "question_id",
    "practice_level",
    "topic",
    "subtopic",
    "difficulty",
    "current_question_text",
    "current_question_word_count",
    "source_reference",
    "source_pdf",
    "completeness_status",
    "issue_types",
    "repair_confidence",
    "repaired_question_text",
    "recommended_action",
    "student_visible",
  ] as const;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
}

function isCompletenessHidden(question: Pick<GeneratedPracticeQuestion, "completeness_status">) {
  return (
    question.completeness_status === "likely_incomplete" ||
    question.completeness_status === "source_not_found" ||
    question.completeness_status === "hide_until_repaired" ||
    question.completeness_status === "needs_manual_review"
  );
}

function countStatuses(items: GeneratedPracticeQuestion[]) {
  return items.reduce<Record<string, number>>((record, question) => {
    const status = question.completeness_status ?? "complete";
    record[status] = (record[status] ?? 0) + 1;
    return record;
  }, {});
}

function isBetterQuestionText(candidate: string, current: string) {
  const cleanCandidate = clean(candidate);
  const cleanCurrent = clean(current);
  if (cleanCandidate.length <= cleanCurrent.length + 20) return false;
  if (!/\b(find|what is|how many|maximum|minimum|determine|number of|value of)\b/i.test(cleanCandidate)) return false;
  return true;
}

function isBetterField(candidate: string, current: string) {
  if (!candidate) return false;
  if (!current) return true;
  if (/CAT|Question Paper|Answer Key|Topic:|Difficulty:/i.test(current) && !/CAT|Question Paper|Answer Key|Topic:|Difficulty:/i.test(candidate)) return true;
  return candidate.length > current.length + 20 && candidate.length < 400;
}

function mergeArchetypeAndQuestion(archetype: string, question: string) {
  const cleaned = archetype
    .replace(/^Coupled log relation reducible to a quadratic\s*/i, "")
    .replace(/\s*,\s*xy\s*=/i, " and xy =")
    .replace(/[. ]+$/, "");
  return `${cleaned}. ${question}`.replace(/\s+/g, " ").trim();
}

function sourceFileLabel(source: SourceQuestion) {
  const sourceFile = str(source.__source_file);
  if (!sourceFile) return "source_artifact";
  return path.relative(process.cwd(), sourceFile).replace(/\\/g, "/");
}

function walk(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

function clean(value: string) {
  return normalizeMathText(String(value ?? ""))
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function wordCount(value: string) {
  return clean(value).split(/\s+/).filter(Boolean).length;
}

function str(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function isObject(value: unknown): value is SourceQuestion {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function csvCell(value: string | number) {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function describeRepair(question: GeneratedPracticeQuestion) {
  if (question.question_text_repaired) return `question: ${truncate(question.question_text_repaired, 220)}`;
  const options = [
    question.option_a_repaired ? `A=${question.option_a_repaired}` : "",
    question.option_b_repaired ? `B=${question.option_b_repaired}` : "",
    question.option_c_repaired ? `C=${question.option_c_repaired}` : "",
    question.option_d_repaired ? `D=${question.option_d_repaired}` : "",
  ].filter(Boolean);
  if (options.length) return `options: ${options.join(", ")}`;
  if (question.detailed_solution_repaired) return `solution: ${truncate(question.detailed_solution_repaired, 220)}`;
  return "source-backed repair metadata retained; no separate repaired prompt field was needed";
}

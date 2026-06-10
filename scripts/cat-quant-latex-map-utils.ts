import fs from "node:fs";
import path from "node:path";

export type MatchClass =
  | "exact_match"
  | "high_confidence_match"
  | "medium_confidence_candidate"
  | "low_confidence_candidate"
  | "unmatched_latex"
  | "unmatched_old_json";

export type PracticeRow = Record<string, any>;
export type LatexRow = Record<string, any>;

export type MatchRecord = {
  latex_index: number;
  old_index: number;
  latex_question_id: string;
  old_question_id: string;
  source_tex_file: string;
  source_question_number: string;
  old_batch_id: string;
  old_question_number: string;
  match_class: MatchClass;
  score: number;
  source_score: number;
  topic_score: number;
  type_score: number;
  text_score: number;
  math_score: number;
  number_score: number;
  option_score: number;
  answer_score: number;
  solution_score: number;
  notes: string[];
};

export type ReviewRow = {
  question_id: string;
  batch_id: string;
  question_number: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question_type: string;
  review_status: string;
  candidate_repair_confidence: string;
  candidate_repair_notes: string;
  question_text_markdown_candidate: string;
  option_a_markdown_candidate: string;
  option_b_markdown_candidate: string;
  option_c_markdown_candidate: string;
  option_d_markdown_candidate: string;
  detailed_solution_markdown_candidate: string;
};

export const projectRoot = process.cwd();
export const oldJsonRelative = "content/cat/practice/generated/cat_quant_generated_practice.json";
export const latexJsonRelative = "content/cat/practice/generated/cat_quant_latex_source_practice.json";
export const mappingCsvRelative = "content/cat/practice/reports/cat_quant_latex_to_json_mapping.csv";
export const reviewCsvRelative = "content/cat/practice/reports/cat_quant_pdf_only_review_queue.csv";
export const auditReportRelative = "reports/local_imports/CAT_QUANT_LATEX_TO_JSON_MAPPING_AUDIT.md";
export const reviewReportRelative = "reports/local_imports/CAT_QUANT_PDF_ONLY_REVIEW_QUEUE.md";

export const mappingCsvHeaders = [
  "record_type",
  "match_class",
  "score",
  "latex_question_id",
  "old_question_id",
  "source_tex_file",
  "source_question_number",
  "old_batch_id",
  "old_question_number",
  "source_score",
  "topic_score",
  "type_score",
  "text_score",
  "math_score",
  "number_score",
  "option_score",
  "answer_score",
  "solution_score",
  "notes",
];

export const reviewCsvHeaders = [
  "question_id",
  "batch_id",
  "question_number",
  "topic",
  "subtopic",
  "difficulty",
  "question_type",
  "review_status",
  "candidate_repair_confidence",
  "candidate_repair_notes",
  "question_text_markdown_candidate",
  "option_a_markdown_candidate",
  "option_b_markdown_candidate",
  "option_c_markdown_candidate",
  "option_d_markdown_candidate",
  "detailed_solution_markdown_candidate",
];

export function readJsonArray(relativePath: string): PracticeRow[] {
  const fullPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) return [];
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

export function writeJson(relativePath: string, value: unknown) {
  const fullPath = path.join(projectRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2), "utf8");
}

export function writeText(relativePath: string, value: string) {
  const fullPath = path.join(projectRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value, "utf8");
}

export function writeCsv(relativePath: string, headers: string[], rows: Record<string, any>[]) {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(",")),
  ].join("\n");
  writeText(relativePath, body + "\n");
}

export function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function normalizedQuestionNumber(value: unknown) {
  const text = String(value ?? "").trim();
  const match = /\d+/.exec(text);
  return match ? String(Number(match[0])) : "";
}

export function sourceSlug(value: unknown) {
  const raw = String(value ?? "").replace(/\\/g, "/").toLowerCase();
  const base = raw.split("/").pop() ?? raw;
  return base.replace(/\.(tex|pdf|json)$/i, "").replace(/\s+\(\d+\)$/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function plainText(value: unknown) {
  return String(value ?? "")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\log_\{?([^{}\s]+)\}?\s*([^\\s]*)/g, "log_$1 $2")
    .replace(/\\(?:left|right|times|cdot|mathrm|textbf|textit|begin|end)\b/g, " ")
    .replace(/[{}$]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalText(value: unknown) {
  return plainText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function tokens(value: unknown) {
  return new Set(canonicalText(value).split(/\s+/).filter((token) => token.length > 1));
}

export function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size && !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function dice(a: string, b: string) {
  const aa = bigrams(a);
  const bb = bigrams(b);
  if (!aa.length || !bb.length) return 0;
  const counts = new Map<string, number>();
  for (const gram of aa) counts.set(gram, (counts.get(gram) ?? 0) + 1);
  let overlap = 0;
  for (const gram of bb) {
    const count = counts.get(gram) ?? 0;
    if (count > 0) {
      overlap += 1;
      counts.set(gram, count - 1);
    }
  }
  return (2 * overlap) / (aa.length + bb.length);
}

function bigrams(input: string) {
  const text = input.replace(/\s+/g, " ").trim();
  if (text.length < 2) return text ? [text] : [];
  const grams: string[] = [];
  for (let index = 0; index < text.length - 1; index += 1) grams.push(text.slice(index, index + 2));
  return grams;
}

export function numberSet(value: unknown) {
  return new Set((plainText(value).match(/-?\d+(?:\.\d+)?/g) ?? []).map((item) => item.replace(/^0+(?=\d)/, "")));
}

export function operatorSet(value: unknown) {
  return new Set((String(value ?? "").match(/\\frac|\\sqrt|\\log|[+\-*/=<>^]|<=|>=|\\le|\\ge|\\choose|C\(/g) ?? []).map(String));
}

export function questionText(row: PracticeRow) {
  return row.question_text_markdown ?? row.question_text_display ?? row.question_text ?? row.plain_preview ?? "";
}

export function solutionText(row: PracticeRow) {
  return row.detailed_solution_markdown ?? row.detailed_solution_display ?? row.detailed_solution ?? "";
}

export function answerText(row: PracticeRow) {
  return row.correct_answer_markdown ?? row.correct_answer_display ?? row.correct_answer ?? "";
}

export function optionTexts(row: PracticeRow) {
  return ["a", "b", "c", "d"].map((letter) => row[`option_${letter}_markdown`] ?? row[`option_${letter}_display`] ?? row[`option_${letter}`] ?? "");
}

export function matchLatexToOld(latexRows: LatexRow[], oldRows: PracticeRow[]) {
  const matches: MatchRecord[] = [];
  const bestByOld = new Map<number, MatchRecord>();

  for (const [latexIndex, latex] of latexRows.entries()) {
    let best: MatchRecord | null = null;
    for (const [oldIndex, old] of oldRows.entries()) {
      const candidate = scorePair(latex, old, latexIndex, oldIndex);
      if (best === null || candidate.score > best.score) best = candidate;
    }
    if (best === null) continue;
    best.match_class = classifyMatch(best);
    matches.push(best);
    if (best.old_index >= 0) {
      const current = bestByOld.get(best.old_index);
      if (!current || best.score > current.score) bestByOld.set(best.old_index, best);
    }
  }

  const highOld = new Set(matches.filter((match) => isHighMatch(match.match_class)).map((match) => match.old_index));
  const unmatchedOld = oldRows
    .map((old, oldIndex) => oldIndex)
    .filter((oldIndex) => !highOld.has(oldIndex))
    .map((oldIndex) => unmatchedOldRecord(oldRows[oldIndex], oldIndex));

  return { matches, unmatchedOld, bestByOld };
}

export function isHighMatch(matchClass: MatchClass) {
  return matchClass === "exact_match" || matchClass === "high_confidence_match";
}

function scorePair(latex: LatexRow, old: PracticeRow, latexIndex: number, oldIndex: number): MatchRecord {
  const latexSource = sourceSlug(latex.source_tex_file);
  const oldSource = sourceSlug(old.latex_source_file || old.source_reference || old.source_pdf || old.batch_id || old.question_id);
  const oldBatch = sourceSlug(old.batch_id || old.question_id);
  const sourceSame = Boolean(latexSource) && (oldSource.includes(latexSource) || latexSource.includes(oldSource) || oldBatch.includes(latexSource) || latexSource.includes(oldBatch));
  const sourceRelated = Boolean(latexSource) && Boolean(oldBatch) && relatedSource(latexSource, oldBatch);
  const qSame = normalizedQuestionNumber(latex.source_question_number) && normalizedQuestionNumber(latex.source_question_number) === normalizedQuestionNumber(old.latex_source_question_number ?? old.question_number ?? old.question_id);
  const sourceScore = sourceSame && qSame ? 1 : sourceRelated && qSame ? 0.86 : sourceSame ? 0.68 : sourceRelated ? 0.52 : 0;
  const topicScore = labelScore(`${latex.topic ?? ""} ${latex.subtopic ?? ""} ${latex.difficulty ?? ""}`, `${old.topic ?? ""} ${old.subtopic ?? ""} ${old.difficulty ?? ""}`);
  const typeScore = String(latex.question_type ?? "").toUpperCase() && String(latex.question_type ?? "").toUpperCase() === String(old.question_type ?? "").toUpperCase() ? 1 : 0;
  const textScore = Math.max(dice(canonicalText(questionText(latex)), canonicalText(questionText(old))), jaccard(tokens(questionText(latex)), tokens(questionText(old))));
  const mathScore = jaccard(operatorSet(questionText(latex) + " " + solutionText(latex)), operatorSet(questionText(old) + " " + solutionText(old)));
  const numberScore = jaccard(numberSet(questionText(latex) + " " + answerText(latex)), numberSet(questionText(old) + " " + answerText(old)));
  const optionScore = optionSimilarity(optionTexts(latex), optionTexts(old));
  const answerScore = answerSimilarity(answerText(latex), answerText(old));
  const solutionScore = Math.max(dice(canonicalText(solutionText(latex)), canonicalText(solutionText(old))), jaccard(tokens(solutionText(latex)), tokens(solutionText(old))));
  const score = clamp01(
    0.23 * sourceScore
      + 0.11 * topicScore
      + 0.07 * typeScore
      + 0.25 * textScore
      + 0.08 * mathScore
      + 0.08 * numberScore
      + 0.08 * optionScore
      + 0.06 * answerScore
      + 0.04 * solutionScore,
  );
  const notes = [
    `source=${sourceScore.toFixed(2)}`,
    `topic=${topicScore.toFixed(2)}`,
    `type=${typeScore.toFixed(2)}`,
    `text=${textScore.toFixed(2)}`,
    `math=${mathScore.toFixed(2)}`,
    `numbers=${numberScore.toFixed(2)}`,
    `options=${optionScore.toFixed(2)}`,
    `answer=${answerScore.toFixed(2)}`,
    `solution=${solutionScore.toFixed(2)}`,
  ];
  if (sourceSame) notes.push("source-file-match");
  if (sourceRelated) notes.push("source-batch-related");
  if (qSame) notes.push("question-number-match");
  return {
    latex_index: latexIndex,
    old_index: oldIndex,
    latex_question_id: latex.question_id ?? "",
    old_question_id: old.question_id ?? "",
    source_tex_file: latex.source_tex_file ?? "",
    source_question_number: String(latex.source_question_number ?? ""),
    old_batch_id: old.batch_id ?? "",
    old_question_number: String(old.question_number ?? old.latex_source_question_number ?? ""),
    match_class: "unmatched_latex",
    score,
    source_score: sourceScore,
    topic_score: topicScore,
    type_score: typeScore,
    text_score: textScore,
    math_score: mathScore,
    number_score: numberScore,
    option_score: optionScore,
    answer_score: answerScore,
    solution_score: solutionScore,
    notes,
  };
}

function classifyMatch(match: MatchRecord): MatchClass {
  if (match.source_score === 1 && (match.text_score >= 0.82 || match.option_score >= 0.82 || match.answer_score >= 0.95)) {
    return "exact_match";
  }
  if (
    match.score >= 0.74
    || (match.source_score >= 0.86 && match.topic_score >= 0.35 && match.type_score >= 0.9 && (match.text_score >= 0.22 || match.number_score >= 0.25 || match.answer_score >= 0.9))
    || (match.text_score >= 0.68 && match.number_score >= 0.45 && match.type_score >= 0.9)
  ) {
    return "high_confidence_match";
  }
  if (match.score >= 0.46 || (match.source_score >= 0.86 && match.type_score >= 0.9)) return "medium_confidence_candidate";
  if (match.score >= 0.28 || match.source_score >= 0.52 || match.text_score >= 0.32) return "low_confidence_candidate";
  return "unmatched_latex";
}

function unmatchedOldRecord(old: PracticeRow, oldIndex: number): MatchRecord {
  return {
    latex_index: -1,
    old_index: oldIndex,
    latex_question_id: "",
    old_question_id: old.question_id ?? "",
    source_tex_file: "",
    source_question_number: "",
    old_batch_id: old.batch_id ?? "",
    old_question_number: String(old.question_number ?? old.latex_source_question_number ?? ""),
    match_class: "unmatched_old_json",
    score: 0,
    source_score: 0,
    topic_score: 0,
    type_score: 0,
    text_score: 0,
    math_score: 0,
    number_score: 0,
    option_score: 0,
    answer_score: 0,
    solution_score: 0,
    notes: ["no high-confidence latex match"],
  };
}

function relatedSource(left: string, right: string) {
  const a = left.split("_").filter(Boolean);
  const b = new Set(right.split("_").filter(Boolean));
  const overlap = a.filter((part) => b.has(part)).length;
  return overlap >= Math.min(3, Math.max(1, Math.floor(a.length * 0.4)));
}

function labelScore(a: string, b: string) {
  return jaccard(tokens(a), tokens(b));
}

function optionSimilarity(a: string[], b: string[]) {
  const pairs = a.map((option, index) => {
    const aa = canonicalText(option);
    const bb = canonicalText(b[index] ?? "");
    if (!aa && !bb) return 0;
    return Math.max(dice(aa, bb), jaccard(tokens(aa), tokens(bb)));
  });
  return pairs.length ? pairs.reduce((sum, value) => sum + value, 0) / pairs.length : 0;
}

function answerSimilarity(a: string, b: string) {
  const aa = canonicalText(a);
  const bb = canonicalText(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  const letterA = /\b([abcd])\b/i.exec(aa)?.[1]?.toLowerCase();
  const letterB = /\b([abcd])\b/i.exec(bb)?.[1]?.toLowerCase();
  if (letterA && letterB && letterA === letterB) return 0.92;
  return Math.max(dice(aa, bb), jaccard(tokens(aa), tokens(bb)));
}

export function repairCandidate(row: PracticeRow): ReviewRow {
  const notes: string[] = [];
  const rawQuestion = questionText(row);
  const rawSolution = solutionText(row);
  const rawAnswer = answerText(row);
  const options = optionTexts(row);
  const question = safeFormat(rawQuestion, notes);
  const solution = safeFormat(rawSolution, notes);
  const optionCandidates = options.map((option) => safeFormat(option, notes));
  const missingOption = String(row.question_type ?? "").toUpperCase() === "MCQ" && optionCandidates.some((option) => !option.trim());
  const ambiguousText = /closest option|nearest option|no option matches|mismatch|should have been|under another interpretation|if interpreted as|intended answer/i.test(
    `${rawQuestion} ${rawSolution} ${rawAnswer}`,
  );
  let review_status = "needs_human_review";
  let confidence: "high" | "medium" | "low" = "low";
  if (!rawQuestion.trim() || !rawAnswer.trim()) {
    review_status = "insufficient_source";
    notes.push("missing question or answer source");
  } else if (missingOption || !rawSolution.trim()) {
    review_status = "likely_incomplete";
    notes.push("missing MCQ option or detailed solution");
  } else if (ambiguousText) {
    review_status = "mathematical_ambiguity";
    notes.push("ambiguous or mismatch language present");
  } else if (question.length >= 40 && rawSolution.trim()) {
    review_status = notes.some((note) => note.includes("unsafe")) ? "needs_human_review" : "safe_candidate_ready";
    confidence = notes.length ? "medium" : "high";
  }
  return {
    question_id: row.question_id ?? "",
    batch_id: row.batch_id ?? "",
    question_number: String(row.question_number ?? row.latex_source_question_number ?? ""),
    topic: row.topic ?? "",
    subtopic: row.subtopic ?? "",
    difficulty: row.difficulty ?? "",
    question_type: row.question_type ?? "",
    review_status,
    candidate_repair_confidence: confidence,
    candidate_repair_notes: [...new Set(notes)].join("; "),
    question_text_markdown_candidate: review_status === "safe_candidate_ready" ? question : "",
    option_a_markdown_candidate: review_status === "safe_candidate_ready" ? optionCandidates[0] : "",
    option_b_markdown_candidate: review_status === "safe_candidate_ready" ? optionCandidates[1] : "",
    option_c_markdown_candidate: review_status === "safe_candidate_ready" ? optionCandidates[2] : "",
    option_d_markdown_candidate: review_status === "safe_candidate_ready" ? optionCandidates[3] : "",
    detailed_solution_markdown_candidate: review_status === "safe_candidate_ready" ? solution : "",
  };
}

function safeFormat(input: string, notes: string[]) {
  let text = String(input ?? "");
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/>\s+=/g, () => {
    notes.push("formatted >= as \\ge");
    return "\\ge";
  });
  text = text.replace(/<=/g, () => {
    notes.push("formatted <= as \\le");
    return "\\le";
  });
  text = text.replace(/\b([a-zA-Z])2\b/g, (full, variable: string) => {
    if (/[=+\-*/(^]|\b(polynomial|quadratic|square|equation)\b/i.test(text)) {
      notes.push(`formatted ${full} as ${variable}^2`);
      return `${variable}^2`;
    }
    notes.push(`unsafe square conversion skipped for ${full}`);
    return full;
  });
  text = text.replace(/\blog(\d+)\s+([a-zA-Z0-9]+)/g, (full, base: string, argument: string) => {
    notes.push(`formatted ${full} as \\log_${base} ${argument}`);
    return `\\log_${base} ${argument}`;
  });
  return text;
}

export function applyLatexFields(old: PracticeRow, latex: LatexRow, confidence: "high") {
  old.question_text_markdown = latex.question_text_markdown ?? old.question_text_markdown;
  old.option_a_markdown = latex.option_a_markdown ?? old.option_a_markdown;
  old.option_b_markdown = latex.option_b_markdown ?? old.option_b_markdown;
  old.option_c_markdown = latex.option_c_markdown ?? old.option_c_markdown;
  old.option_d_markdown = latex.option_d_markdown ?? old.option_d_markdown;
  old.correct_answer_markdown = latex.correct_answer_markdown ?? old.correct_answer_markdown;
  old.detailed_solution_markdown = latex.detailed_solution_markdown ?? old.detailed_solution_markdown;
  old.display_source = "latex_source";
  old.latex_source_available = true;
  old.latex_match_confidence = confidence;
  old.latex_source_file = latex.source_tex_file;
  old.latex_source_question_number = latex.source_question_number;
  old.math_review_status = "latex_source_clean";
  old.completeness_status = old.completeness_status === "complete" ? "complete" : "repaired_from_latex_source";
}

export function matchRecordToCsv(record: MatchRecord, recordType = "latex_match") {
  return {
    record_type: recordType,
    match_class: record.match_class,
    score: record.score.toFixed(4),
    latex_question_id: record.latex_question_id,
    old_question_id: record.old_question_id,
    source_tex_file: record.source_tex_file,
    source_question_number: record.source_question_number,
    old_batch_id: record.old_batch_id,
    old_question_number: record.old_question_number,
    source_score: record.source_score.toFixed(4),
    topic_score: record.topic_score.toFixed(4),
    type_score: record.type_score.toFixed(4),
    text_score: record.text_score.toFixed(4),
    math_score: record.math_score.toFixed(4),
    number_score: record.number_score.toFixed(4),
    option_score: record.option_score.toFixed(4),
    answer_score: record.answer_score.toFixed(4),
    solution_score: record.solution_score.toFixed(4),
    notes: record.notes.join("; "),
  };
}

export function mdTable(headers: string[], rows: unknown[][]) {
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];
  if (!rows.length) lines.push(`| ${headers.map(() => "_No data_").join(" | ")} |`);
  for (const row of rows) {
    lines.push(`| ${row.map((cell) => String(cell ?? "").replace(/\n/g, " ").replace(/\|/g, "\\|")).join(" | ")} |`);
  }
  return lines.join("\n");
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion } from "../types/practice";
import { formatQuestionToMarkdown } from "../lib/content/practice/solution-formatting";

type ParsedLatexQuestion = {
  source_tex_file: string;
  source_question_number: number;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  question_type?: string;
  estimated_time?: string;
  question_text_latex: string;
  option_a_latex?: string;
  option_b_latex?: string;
  option_c_latex?: string;
  option_d_latex?: string;
  correct_answer_latex?: string;
  detailed_solution_latex?: string;
  question_text_markdown: string;
  option_a_markdown?: string;
  option_b_markdown?: string;
  option_c_markdown?: string;
  option_d_markdown?: string;
  correct_answer_markdown?: string;
  detailed_solution_markdown?: string;
};

type MatchConfidence = "high" | "medium" | "low" | "unmatched";

type MatchResult = {
  rowIndex: number;
  confidence: MatchConfidence;
  score: number;
  stage: "source" | "content" | "skeleton" | "none";
  notes: string[];
};

type MatchRecord = {
  parsed: ParsedLatexQuestion;
  match: MatchResult;
  question?: GeneratedPracticeQuestion;
  oldQuestionText?: string;
  newQuestionText?: string;
  wasVisible?: boolean;
  wasLatexHigh?: boolean;
};

type CandidateRecord = {
  source_tex_file: string;
  source_question_number: number;
  confidence: MatchConfidence;
  score: number;
  notes: string[];
  matched_question_id?: string;
  matched_question_text?: string;
  question_text_latex: string;
  question_text_plain: string;
  option_a_latex?: string;
  option_b_latex?: string;
  option_c_latex?: string;
  option_d_latex?: string;
  correct_answer_latex?: string;
  detailed_solution_latex?: string;
};

const latexDirRelative = "content/cat/practice/latex_sources";
const jsonRelative = "content/cat/practice/generated/cat_quant_generated_practice.json";
const backupDirRelative = "content/cat/practice/generated/backups";
const reportRelative = "reports/local_imports/CAT_QUANT_LATEX_SOURCE_IMPORT_REPORT.md";
const csvRelative = "content/cat/practice/reports/cat_quant_latex_source_matches.csv";
const candidatesRelative = "content/cat/practice/generated/cat_quant_latex_unmatched_candidates.json";

const latexDir = path.join(process.cwd(), latexDirRelative);
const jsonPath = path.join(process.cwd(), jsonRelative);
const backupDir = path.join(process.cwd(), backupDirRelative);
const reportPath = path.join(process.cwd(), reportRelative);
const csvPath = path.join(process.cwd(), csvRelative);
const candidatesPath = path.join(process.cwd(), candidatesRelative);

if (!fs.existsSync(jsonPath)) {
  console.error(`Practice JSON not found: ${jsonRelative}`);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });
fs.mkdirSync(path.dirname(candidatesPath), { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `cat_quant_generated_practice_before_latex_import_${timestamp}.json`);
fs.copyFileSync(jsonPath, backupPath);

const texFiles = fs.existsSync(latexDir) ? walk(latexDir).filter((file) => file.toLowerCase().endsWith(".tex")) : [];
const parsedLatex = texFiles.flatMap(parseLatexFile);
const questions = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as GeneratedPracticeQuestion[];
const oldHighConfidence = questions.filter(isLatexHigh).length;
const visibleBefore = questions.filter(isStudentVisible).length;
const hiddenBeforeIds = new Set(questions.filter((question) => !isStudentVisible(question)).map((question) => question.question_id));
const usedRows = new Set<number>();
questions.forEach((question, index) => {
  if (isLatexHigh(question)) usedRows.add(index);
});

const csvRows: string[][] = [];
const upgraded: MatchRecord[] = [];
const medium: MatchRecord[] = [];
const lowOrUnmatched: MatchRecord[] = [];
const candidates: CandidateRecord[] = [];

for (const parsed of parsedLatex) {
  const match = findBestMatch(parsed, questions, usedRows);
  const jsonRow = match.rowIndex >= 0 ? questions[match.rowIndex] : undefined;

  if (match.confidence === "high" && jsonRow) {
    const wasVisible = isStudentVisible(jsonRow);
    const wasLatexHigh = isLatexHigh(jsonRow);
    const oldQuestionText = jsonRow.question_text_markdown ?? jsonRow.question_text_display ?? jsonRow.question_text;
    usedRows.add(match.rowIndex);
    applyLatexUpgrade(jsonRow, parsed, match);
    upgraded.push({ question: jsonRow, parsed, match, oldQuestionText, newQuestionText: parsed.question_text_markdown, wasVisible, wasLatexHigh });
  } else if (match.confidence === "medium" && jsonRow) {
    if (!isLatexHigh(jsonRow)) {
      jsonRow.latex_source_available = true;
      jsonRow.latex_source_file = parsed.source_tex_file;
      jsonRow.latex_source_question_number = parsed.source_question_number;
      jsonRow.latex_match_confidence = "medium";
      jsonRow.question_text_latex_candidate = parsed.question_text_latex;
      jsonRow.detailed_solution_latex_candidate = parsed.detailed_solution_latex;
      jsonRow.latex_import_notes = match.notes;
    }
    medium.push({ parsed, match, question: jsonRow });
    candidates.push(toCandidate(parsed, match, jsonRow));
  } else {
    lowOrUnmatched.push({ parsed, match, question: jsonRow });
    candidates.push(toCandidate(parsed, match, jsonRow));
  }

  csvRows.push([
    parsed.source_tex_file,
    String(parsed.source_question_number),
    jsonRow?.question_id ?? "",
    match.confidence,
    match.stage,
    match.score.toFixed(4),
    match.notes.join("; "),
  ]);
}

const duplicateFiles = findDuplicateBasenames(texFiles);
const duplicateQuestions = findDuplicateLatexQuestions(parsedLatex);
const rowsWithoutLatex = questions.filter((question) => !question.latex_source_available).length;
const rowsHiddenOrReview = questions.filter((question) => !isStudentVisible(question)).length;
const newHighConfidence = questions.filter(isLatexHigh).length;
const newlyUpgraded = upgraded.filter((record) => !record.wasLatexHigh);
const hiddenRecovered = newlyUpgraded.filter((record) => record.question && hiddenBeforeIds.has(record.question.question_id)).length;
const visibleAfterImport = questions.filter(isStudentVisible).length;

fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), "utf8");
fs.writeFileSync(candidatesPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  source_folder: latexDirRelative,
  total_candidates: candidates.length,
  medium_candidates: medium.length,
  low_or_unmatched_candidates: lowOrUnmatched.length,
  candidates,
}, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport({
  texFiles,
  parsedLatex,
  oldHighConfidence,
  newHighConfidence,
  upgraded,
  newlyUpgraded,
  medium,
  lowOrUnmatched,
  rowsWithoutLatex,
  rowsHiddenOrReview,
  duplicateFiles,
  duplicateQuestions,
  backupPath,
  candidatesPath,
  visibleBefore,
  visibleAfterImport,
  hiddenRecovered,
}), "utf8");
fs.writeFileSync(csvPath, toCsv(csvRows), "utf8");

console.log(`TeX files found: ${texFiles.length}`);
console.log(`LaTeX questions parsed: ${parsedLatex.length}`);
console.log(`Previous high-confidence matches: ${oldHighConfidence}`);
console.log(`New high-confidence matches: ${newHighConfidence}`);
console.log(`Rows newly upgraded from LaTeX: ${newlyUpgraded.length}`);
console.log(`Hidden rows recovered by LaTeX: ${hiddenRecovered}`);
console.log(`Medium-confidence candidates: ${medium.length}`);
console.log(`Low/unmatched: ${lowOrUnmatched.length}`);
console.log(`Rows still without LaTeX: ${rowsWithoutLatex}`);
console.log(`Visible before import: ${visibleBefore}`);
console.log(`Visible after import: ${visibleAfterImport}`);
console.log(`Rows hidden/review: ${rowsHiddenOrReview}`);
console.log(`Report: ${reportRelative}`);
console.log(`CSV: ${csvRelative}`);
console.log(`Candidates: ${candidatesRelative}`);

function parseLatexFile(file: string): ParsedLatexQuestion[] {
  const raw = fs.readFileSync(file, "utf8");
  const body = stripLatexWrapper(raw);
  const questionChunks = splitQuestionChunks(body);
  const answerChunks = splitSolutionChunks(body);
  return questionChunks.map((chunk, index) => {
    const number = chunk.number || index + 1;
    const options = extractOptions(chunk.text);
    const solution = answerChunks.get(number) ?? "";
    const questionText = cleanLatexQuestion(removeOptions(chunk.text));
    const answer = extractCorrectAnswer(solution || chunk.text);
    return {
      source_tex_file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
      source_question_number: number,
      topic: extractMeta(chunk.text, "Topic"),
      subtopic: extractMeta(chunk.text, "Subtopic"),
      difficulty: extractMeta(chunk.text, "Difficulty"),
      question_type: options.a || options.b ? "MCQ" : "TITA",
      estimated_time: extractMeta(chunk.text, "Estimated Time"),
      question_text_latex: questionText,
      option_a_latex: options.a,
      option_b_latex: options.b,
      option_c_latex: options.c,
      option_d_latex: options.d,
      correct_answer_latex: answer,
      detailed_solution_latex: cleanLatexQuestion(solution),
      question_text_markdown: latexToMarkdown(questionText),
      option_a_markdown: options.a ? latexToMarkdown(options.a) : "",
      option_b_markdown: options.b ? latexToMarkdown(options.b) : "",
      option_c_markdown: options.c ? latexToMarkdown(options.c) : "",
      option_d_markdown: options.d ? latexToMarkdown(options.d) : "",
      correct_answer_markdown: answer ? latexToMarkdown(answer) : "",
      detailed_solution_markdown: solution ? latexToMarkdown(solution) : "",
    };
  }).filter((question) => wordCount(stripLatex(question.question_text_latex)) > 3);
}

function splitQuestionChunks(body: string) {
  const matches = Array.from(body.matchAll(/(?:\\(?:sub)*section\*?\{[^}]*?(?:Question|Q)\s*(\d+)[^}]*\}|\\textbf\{[^}]*?(?:Question|Q)\s*(\d+)[^}]*\}|^\s*(?:Question|Q)\s*(\d+)[).:-])/gim));
  if (!matches.length) return splitEnumerateQuestions(body);
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? body.length;
    return { number: Number(match[1] || match[2] || match[3] || index + 1), text: body.slice(start, end).trim() };
  });
}

function splitEnumerateQuestions(body: string) {
  const itemMatches = Array.from(body.matchAll(/\\item\s+/g));
  return itemMatches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = itemMatches[index + 1]?.index ?? body.length;
    return { number: index + 1, text: body.slice(start, end).trim() };
  });
}

function splitSolutionChunks(body: string) {
  const solutions = new Map<number, string>();
  const solutionStart = body.search(/\\(?:sub)*section\*?\{[^}]*solutions?|answer key|detailed solutions?/i);
  if (solutionStart < 0) return solutions;
  const solutionBody = body.slice(solutionStart);
  const chunks = splitQuestionChunks(solutionBody);
  for (const chunk of chunks) solutions.set(chunk.number, chunk.text);
  return solutions;
}

function findBestMatch(parsed: ParsedLatexQuestion, rows: GeneratedPracticeQuestion[], usedRows: Set<number>): MatchResult {
  let best: MatchResult = { rowIndex: -1, confidence: "unmatched", score: 0, stage: "none", notes: ["no candidate"] };
  const parsedFingerprints = buildFingerprints({
    question: parsed.question_text_latex,
    options: [parsed.option_a_latex, parsed.option_b_latex, parsed.option_c_latex, parsed.option_d_latex].filter(Boolean).join(" "),
    answer: parsed.correct_answer_latex ?? "",
  });

  rows.forEach((row, index) => {
    if (usedRows.has(index)) return;
    const rowFingerprints = buildFingerprints({
      question: [row.question_text_repaired, row.question_text_markdown, row.question_text_display, row.question_text].filter(Boolean).join(" "),
      options: [row.option_a_repaired, row.option_b_repaired, row.option_c_repaired, row.option_d_repaired, row.option_a_markdown, row.option_b_markdown, row.option_c_markdown, row.option_d_markdown, row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean).join(" "),
      answer: [row.correct_answer_markdown, row.correct_answer_display, row.correct_answer].filter(Boolean).join(" "),
    });

    const source = sourceMapping(parsed, row);
    const questionScore = tokenSimilarity(parsedFingerprints.question, rowFingerprints.question);
    const optionScore = parsedFingerprints.options ? tokenSimilarity(parsedFingerprints.options, rowFingerprints.options) : 0;
    const answerScore = parsedFingerprints.answer ? tokenSimilarity(parsedFingerprints.answer, rowFingerprints.answer) : 0;
    const skeletonScore = tokenSimilarity(parsedFingerprints.skeleton, rowFingerprints.skeleton);
    const numberScore = jaccard(parsedFingerprints.numbers, rowFingerprints.numbers);
    const sentenceScore = sentenceAnchorSimilarity(parsed.question_text_latex, row.question_text_markdown ?? row.question_text_display ?? row.question_text);
    const topicScore = parsed.topic && row.topic ? tokenSimilarity(fingerprint(parsed.topic), fingerprint(row.topic)) : 0;

    const contentScore =
      questionScore * 0.44 +
      optionScore * 0.13 +
      answerScore * 0.07 +
      skeletonScore * 0.16 +
      numberScore * 0.12 +
      sentenceScore * 0.08;
    const combined = Math.min(1.25, contentScore + source.score * 0.28 + topicScore * 0.04);
    const notes = [
      `combined=${combined.toFixed(2)}`,
      `question=${questionScore.toFixed(2)}`,
      `options=${optionScore.toFixed(2)}`,
      `answer=${answerScore.toFixed(2)}`,
      `skeleton=${skeletonScore.toFixed(2)}`,
      `numbers=${numberScore.toFixed(2)}`,
      `anchors=${sentenceScore.toFixed(2)}`,
      `source=${source.score.toFixed(2)}`,
      ...source.notes,
    ];

    let confidence: MatchConfidence = "low";
    let stage: MatchResult["stage"] = "skeleton";
    const hasStrongSource = source.score >= 0.66 && source.questionNumber;
    const hasContent = questionScore >= 0.62 || (skeletonScore >= 0.58 && numberScore >= 0.55) || (optionScore >= 0.55 && questionScore >= 0.38);
    const exactishContent = questionScore >= 0.78 && numberScore >= 0.48;

    if ((hasStrongSource && (questionScore >= 0.34 || skeletonScore >= 0.48 || optionScore >= 0.46 || numberScore >= 0.62)) || exactishContent || (combined >= 0.76 && hasContent)) {
      confidence = "high";
      stage = hasStrongSource ? "source" : questionScore >= 0.62 ? "content" : "skeleton";
    } else if (combined >= 0.52 || (source.score >= 0.48 && source.questionNumber) || questionScore >= 0.55 || (skeletonScore >= 0.45 && numberScore >= 0.45)) {
      confidence = "medium";
      stage = source.score >= 0.48 ? "source" : questionScore >= 0.55 ? "content" : "skeleton";
    }

    if (combined > best.score) {
      best = { rowIndex: index, confidence, score: combined, stage, notes };
    }
  });

  return best;
}

function applyLatexUpgrade(row: GeneratedPracticeQuestion, parsed: ParsedLatexQuestion, match: MatchResult) {
  row.latex_source_available = true;
  row.latex_source_file = parsed.source_tex_file;
  row.latex_source_question_number = parsed.source_question_number;
  row.latex_match_confidence = "high";
  row.display_source = "latex_source";
  row.latex_import_notes = match.notes;
  row.question_text_latex = parsed.question_text_latex;
  row.option_a_latex = parsed.option_a_latex;
  row.option_b_latex = parsed.option_b_latex;
  row.option_c_latex = parsed.option_c_latex;
  row.option_d_latex = parsed.option_d_latex;
  row.detailed_solution_latex = parsed.detailed_solution_latex;
  row.question_text_markdown = parsed.question_text_markdown;
  row.option_a_markdown = parsed.option_a_markdown;
  row.option_b_markdown = parsed.option_b_markdown;
  row.option_c_markdown = parsed.option_c_markdown;
  row.option_d_markdown = parsed.option_d_markdown;
  row.correct_answer_markdown = parsed.correct_answer_markdown || row.correct_answer_markdown;
  row.detailed_solution_markdown = parsed.detailed_solution_markdown || row.detailed_solution_markdown;
  row.question_text_display = stripLatex(parsed.question_text_latex);
  row.option_a_display = stripLatex(parsed.option_a_latex ?? row.option_a);
  row.option_b_display = stripLatex(parsed.option_b_latex ?? row.option_b);
  row.option_c_display = stripLatex(parsed.option_c_latex ?? row.option_c);
  row.option_d_display = stripLatex(parsed.option_d_latex ?? row.option_d);
  row.correct_answer_display = stripLatex(parsed.correct_answer_latex ?? row.correct_answer);
  row.detailed_solution_display = stripLatex(parsed.detailed_solution_latex ?? row.detailed_solution);
  row.math_review_status = "latex_source_clean";
  row.content_status = "safe_display";
  row.completeness_status = "repaired_from_latex_source";
  row.student_visible = true;
}

function latexToMarkdown(input = "") {
  const cleaned = cleanLatexQuestion(input)
    .replace(/\\\[/g, "\n\n$$")
    .replace(/\\\]/g, "$$\n\n")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_match, body) => `\n\n$$\n${body.trim()}\n$$\n\n`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!/[$\\]/.test(cleaned)) return formatQuestionToMarkdown(cleaned);
  return cleaned;
}

function cleanLatexQuestion(input = "") {
  return input
    .replace(/\\(?:begin|end)\{(?:document|center|flushleft|flushright|tcolorbox|minipage|multicols|enumerate|itemize|tabular|array)[^}]*\}/gi, "\n")
    .replace(/\\(?:documentclass|usepackage|newcommand|renewcommand|geometry|pagestyle|thispagestyle|setlength|vspace|hspace|smallskip|medskip|bigskip)[^\n]*/gi, "")
    .replace(/\\(?:textbf|textit|emph|underline)\{([^{}]*)\}/g, "$1")
    .replace(/\\item\s*/g, "\n")
    .replace(/\\\\/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripLatex(input = "") {
  return cleanLatexQuestion(input)
    .replace(/\$+/g, "")
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, "$1/$2")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\log_\{?([^{}\s]+)\}?/g, "log_$1")
    .replace(/\\leq?|≤|<=/g, " <= ")
    .replace(/\\geq?|≥|>=/g, " >= ")
    .replace(/\\ne|≠|!=/g, " != ")
    .replace(/\\cdot|·/g, " * ")
    .replace(/\\times|×/g, " * ")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOptions(chunk: string) {
  const optionRegex = /(?:\\item|\(([A-D])\)|\b([A-D])[).])\s*([\s\S]*?)(?=(?:\\item|\([A-D]\)|\b[A-D][).])\s|$)/g;
  const found: string[] = [];
  for (const match of chunk.matchAll(optionRegex)) {
    const value = cleanLatexQuestion(match[3] ?? "");
    if (value && value.length < 500) found.push(value);
  }
  return { a: found[0] ?? "", b: found[1] ?? "", c: found[2] ?? "", d: found[3] ?? "" };
}

function removeOptions(chunk: string) {
  return chunk.split(/(?:\\begin\{enumerate\}|\\item|\([A-D]\)|\b[A-D][).])\s/)[0] ?? chunk;
}

function extractMeta(input: string, label: string) {
  const match = new RegExp(`${label}\\s*:?\\s*([^\\\\\n]+)`, "i").exec(input);
  return match?.[1]?.trim() ?? "";
}

function extractCorrectAnswer(input: string) {
  const match = /(?:Answer|Correct Answer)\s*:?\s*([^\n]+)/i.exec(stripLatex(input));
  return match?.[1]?.trim() ?? "";
}

function stripLatexWrapper(input: string) {
  return input
    .replace(/^[\s\S]*?\\begin\{document\}/i, "")
    .replace(/\\end\{document\}[\s\S]*$/i, "");
}

function buildFingerprints(input: { question: string; options: string; answer: string }) {
  const question = fingerprint(input.question);
  const options = fingerprint(input.options);
  const answer = fingerprint(input.answer);
  const skeleton = mathSkeleton([input.question, input.options, input.answer].join(" "));
  const numbers = numbersFrom([input.question, input.options, input.answer].join(" "));
  return { question, options, answer, skeleton, numbers };
}

function fingerprint(input = "") {
  let value = String(input ?? "");
  value = value
    .replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, " $1 over $2 ")
    .replace(/\\sqrt\s*\{([^{}]+)\}/g, " sqrt $1 ")
    .replace(/\\log_\{?([^{}\s]+)\}?\s*\(?/g, " log base $1 ")
    .replace(/\blog\s*_\s*([a-z0-9]+)\s*\(?/gi, " log base $1 ")
    .replace(/\blog([a-z])\s+([a-z])/gi, " log base $1 $2 ")
    .replace(/\blog([0-9]+)\s*\(?/gi, " log base $1 ")
    .replace(/([a-z])\s*\^\s*\{?(\d+)\}?/gi, "$1 pow $2")
    .replace(/\b([a-z])([23])(?=\b|[a-z])/gi, "$1 pow $2")
    .replace(/\\leq?|≤|<=/g, " le ")
    .replace(/\\geq?|≥|>=/g, " ge ")
    .replace(/\\ne|≠|!=/g, " ne ")
    .replace(/\\cdot|·|×|\\times/g, " times ")
    .replace(/->|\\to/g, " to ")
    .replace(/[+]/g, " plus ")
    .replace(/(?<!\w)-(?!\w)/g, " minus ")
    .replace(/[=]/g, " equals ");
  value = stripLatex(value)
    .toLowerCase()
    .replace(/\b(cat|quant|question|estimated|time|min|minutes|answer|solution|topic|difficulty|type)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return value;
}

function mathSkeleton(input = "") {
  const normalized = fingerprint(input);
  const tokens = normalized.split(/\s+/).filter((token) => /^(?:[a-z]|\d+|pow|over|sqrt|log|base|plus|minus|times|equals|le|ge|ne)$/.test(token));
  return tokens.join(" ");
}

function numbersFrom(input = "") {
  return new Set(stripLatex(input).match(/-?\d+(?:\.\d+)?/g) ?? []);
}

function tokenSimilarity(a: string, b: string) {
  const aTokens = new Set(a.split(/\s+/).filter((token) => token.length > 1));
  const bTokens = new Set(b.split(/\s+/).filter((token) => token.length > 1));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) if (bTokens.has(token)) overlap += 1;
  return overlap / Math.max(aTokens.size, bTokens.size);
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const value of a) if (b.has(value)) overlap += 1;
  return overlap / new Set([...a, ...b]).size;
}

function sentenceAnchorSimilarity(a: string, b: string) {
  const aAnchors = sentenceAnchors(a);
  const bAnchors = sentenceAnchors(b);
  if (!aAnchors || !bAnchors) return 0;
  return tokenSimilarity(aAnchors, bAnchors);
}

function sentenceAnchors(input: string) {
  const sentences = stripLatex(input)
    .split(/[.!?]\s+/)
    .map((sentence) => fingerprint(sentence))
    .filter((sentence) => sentence.split(/\s+/).length >= 4);
  if (!sentences.length) return fingerprint(input).split(/\s+/).slice(0, 18).join(" ");
  return [sentences[0], sentences[sentences.length - 1]].join(" ");
}

function sourceMapping(parsed: ParsedLatexQuestion, row: GeneratedPracticeQuestion) {
  const notes: string[] = [];
  let score = 0;
  const sourceBlob = [row.source_reference, row.batch_id, row.question_id, row.latex_source_file].filter(Boolean).join(" ").toLowerCase();
  const texBase = path.basename(parsed.source_tex_file).toLowerCase().replace(/\.tex$/, "").replace(/\s*\(\d+\)/g, "");
  const texSlug = slug(texBase);
  const rowSlug = slug(sourceBlob);
  const fileTokens = basenameTokens(parsed.source_tex_file).filter((token) => !["cat", "quant", "practice", "bank", "paper", "pool"].includes(token));
  const fileOverlap = fileTokens.length ? fileTokens.filter((token) => rowSlug.includes(token)).length / fileTokens.length : 0;
  const questionNumber = questionNumberMatches(parsed.source_question_number, row);

  if (rowSlug.includes(texSlug) || texSlug.includes(slug(row.batch_id ?? ""))) {
    score += 0.48;
    notes.push("source-file-exact");
  } else if (fileOverlap >= 0.5) {
    score += 0.34;
    notes.push(`source-file-tokens=${fileOverlap.toFixed(2)}`);
  } else if (fileOverlap > 0) {
    score += 0.16;
    notes.push(`source-file-partial=${fileOverlap.toFixed(2)}`);
  }

  if (questionNumber) {
    score += 0.38;
    notes.push("question-number");
  }

  if (parsed.topic && row.topic && tokenSimilarity(fingerprint(parsed.topic), fingerprint(row.topic)) >= 0.5) {
    score += 0.08;
    notes.push("topic");
  }

  return { score: Math.min(1, score), notes, questionNumber };
}

function questionNumberMatches(number: number, row: GeneratedPracticeQuestion) {
  const values = [row.question_id, row.source_reference, row.batch_id].filter(Boolean).join(" ");
  const padded = String(number).padStart(2, "0");
  return new RegExp(`(?:^|[^a-z0-9])q0?${number}(?:$|[^a-z0-9])`, "i").test(values) ||
    new RegExp(`(?:^|[^a-z0-9])${padded}(?:$|[^a-z0-9])`, "i").test(values);
}

function isLatexHigh(question: GeneratedPracticeQuestion) {
  return question.display_source === "latex_source" && question.latex_match_confidence === "high";
}

function isStudentVisible(question: GeneratedPracticeQuestion) {
  if (isLatexHigh(question)) return true;
  const completenessBlocked = new Set(["likely_incomplete", "source_not_found", "hide_until_repaired", "needs_manual_review"]);
  const contentBlocked = new Set(["hide_from_student", "incomplete_question", "broken_options", "needs_math_review"]);
  return question.student_visible === true || (!completenessBlocked.has(String(question.completeness_status ?? "")) && !contentBlocked.has(String(question.content_status ?? "")));
}

function slug(input = "") {
  return input.toLowerCase().replace(/\.[a-z0-9]+\b/g, " ").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function basenameTokens(file: string) {
  return path.basename(file).toLowerCase().replace(/\.tex$/, "").replace(/\s*\(\d+\)/g, "").split(/[^a-z0-9]+/).filter((token) => token.length > 2);
}

function toCandidate(parsed: ParsedLatexQuestion, match: MatchResult, row?: GeneratedPracticeQuestion): CandidateRecord {
  return {
    source_tex_file: parsed.source_tex_file,
    source_question_number: parsed.source_question_number,
    confidence: match.confidence,
    score: Number(match.score.toFixed(4)),
    notes: match.notes,
    matched_question_id: row?.question_id,
    matched_question_text: row ? String(row.question_text_markdown ?? row.question_text_display ?? row.question_text ?? "").slice(0, 500) : undefined,
    question_text_latex: parsed.question_text_latex,
    question_text_plain: stripLatex(parsed.question_text_latex),
    option_a_latex: parsed.option_a_latex,
    option_b_latex: parsed.option_b_latex,
    option_c_latex: parsed.option_c_latex,
    option_d_latex: parsed.option_d_latex,
    correct_answer_latex: parsed.correct_answer_latex,
    detailed_solution_latex: parsed.detailed_solution_latex,
  };
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function findDuplicateBasenames(files: string[]) {
  const seen = new Map<string, number>();
  for (const file of files) {
    const key = path.basename(file).toLowerCase().replace(/\s*\(\d+\)/, "");
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return Array.from(seen.entries()).filter(([, count]) => count > 1).map(([name]) => name);
}

function findDuplicateLatexQuestions(questions: ParsedLatexQuestion[]) {
  const seen = new Map<string, number>();
  for (const question of questions) {
    const key = fingerprint(question.question_text_latex).slice(0, 160);
    if (key) seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return Array.from(seen.entries()).filter(([, count]) => count > 1).length;
}

function wordCount(input: string) {
  return stripLatex(input).split(/\s+/).filter(Boolean).length;
}

function buildReport(input: {
  texFiles: string[];
  parsedLatex: ParsedLatexQuestion[];
  oldHighConfidence: number;
  newHighConfidence: number;
  upgraded: MatchRecord[];
  newlyUpgraded: MatchRecord[];
  medium: MatchRecord[];
  lowOrUnmatched: MatchRecord[];
  rowsWithoutLatex: number;
  rowsHiddenOrReview: number;
  duplicateFiles: string[];
  duplicateQuestions: number;
  backupPath: string;
  candidatesPath: string;
  visibleBefore: number;
  visibleAfterImport: number;
  hiddenRecovered: number;
}) {
  const upgradedExamples = input.newlyUpgraded.slice(0, 20).map((item, index) => `${index + 1}. \`${item.question?.question_id}\` <- \`${item.parsed.source_tex_file}\` Q${item.parsed.source_question_number} (${item.match.score.toFixed(2)}, ${item.match.stage})\n   - Old: ${oneLine(item.oldQuestionText).slice(0, 220)}\n   - LaTeX: ${oneLine(stripLatex(item.parsed.question_text_latex)).slice(0, 220)}`).join("\n") || "- None";
  const mediumExamples = input.medium.slice(0, 20).map((item, index) => `${index + 1}. \`${item.question?.question_id ?? "unmatched"}\` <- \`${item.parsed.source_tex_file}\` Q${item.parsed.source_question_number} (${item.match.score.toFixed(2)}, ${item.match.stage})\n   - Notes: ${item.match.notes.join("; ")}\n   - LaTeX: ${oneLine(stripLatex(item.parsed.question_text_latex)).slice(0, 220)}`).join("\n") || "- None";

  return `# CAT Quant LaTeX Source Import Report

Generated: ${new Date().toISOString()}

LaTeX source folder: \`${latexDirRelative}\`

Backup: \`${path.relative(process.cwd(), input.backupPath).replace(/\\/g, "/")}\`

Candidate file: \`${path.relative(process.cwd(), input.candidatesPath).replace(/\\/g, "/")}\`

## Summary

| Metric | Count |
| --- | ---: |
| Total .tex files found | ${input.texFiles.length} |
| Total LaTeX questions parsed | ${input.parsedLatex.length} |
| Old high-confidence matches | ${input.oldHighConfidence} |
| New high-confidence matches | ${input.newHighConfidence} |
| Newly upgraded rows | ${input.newlyUpgraded.length} |
| Medium-confidence candidates | ${input.medium.length} |
| Low-confidence/unmatched LaTeX questions | ${input.lowOrUnmatched.length} |
| Hidden rows repaired by LaTeX | ${input.hiddenRecovered} |
| Visible count before import | ${input.visibleBefore} |
| Visible count after import | ${input.visibleAfterImport} |
| Existing JSON rows still without LaTeX source | ${input.rowsWithoutLatex} |
| Rows that remain hidden/review | ${input.rowsHiddenOrReview} |
| Duplicate LaTeX files detected | ${input.duplicateFiles.length} |
| Duplicate questions detected | ${input.duplicateQuestions} |

## Matching Notes

The importer keeps the existing 304-row bank as the base. High-confidence matches upgrade only markdown/display fields and LaTeX provenance fields. Medium matches are stored as candidates and do not replace active student content.

## Examples Of 20 Newly Upgraded Rows

${upgradedExamples}

## Examples Of 20 Medium Matches Needing Approval

${mediumExamples}

## Examples Of Unmatched Rows

${input.lowOrUnmatched.slice(0, 20).map((item, index) => `${index + 1}. \`${item.parsed.source_tex_file}\` Q${item.parsed.source_question_number}: ${oneLine(stripLatex(item.parsed.question_text_latex)).slice(0, 180)}`).join("\n") || "- None"}
`;
}

function toCsv(rows: string[][]) {
  const headers = ["source_tex_file", "source_question_number", "question_id", "confidence", "stage", "score", "notes"];
  return [headers.join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
}

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function oneLine(input = "") {
  return String(input).replace(/\s+/g, " ").trim();
}
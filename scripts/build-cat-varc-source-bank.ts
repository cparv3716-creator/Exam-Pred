import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// ─── Types ────────────────────────────────────────────────────────────────────

type VarcType =
  | "RC"
  | "Para Jumble"
  | "Odd Sentence Out"
  | "Para Summary"
  | "Sentence Placement"
  | "Para Completion"
  | "Critical Reasoning"
  | "Other";

type ParseStatus =
  | "complete_rc_set"
  | "complete_va_question"
  | "raw_block_fallback"
  | "missing_answer"
  | "missing_options"
  | "incomplete_parse"
  | "needs_manual_review";

type PracticeLevel = "Beginner" | "Intermediate" | "Advanced";

type VarcSourceRow = {
  question_id: string;
  exam: "CAT";
  section: "VARC";
  source_file: string;
  source_set_number: number;
  source_question_number: number;
  varc_type: VarcType;
  passage_id: string;
  passage_title: string;
  passage_text_markdown: string;
  question_text_markdown: string;
  option_a_markdown: string;
  option_b_markdown: string;
  option_c_markdown: string;
  option_d_markdown: string;
  option_e_markdown: string;
  correct_answer: string;
  detailed_solution_markdown: string;
  difficulty: string;
  practice_level: PracticeLevel;
  topic: string;
  subtopic: string;
  source_raw_block: string;
  parse_status: ParseStatus;
  parse_warnings: string[];
  student_visible: boolean;
};

type RawQuestion = {
  qNum: number;
  questionText: string;
  options: { a: string; b: string; c: string; d: string; e: string };
  isTita: boolean;
  isVa: boolean;
  vaType: string;
  rawBlock: string;
};

type SolutionEntry = { answer: string; solution: string };
type AkEntry = { answer: string; difficulty: string; qType: string };

type QBlock = {
  type: "rc" | "va";
  text: string;
  passageNum: number;
  qRange: [number, number];
};

// ─── Paths ────────────────────────────────────────────────────────────────────

const CWD = process.cwd();
const ZIP_SEARCH = [
  path.join(CWD, "data"),
  "E:\\CAT PREDN MODEL\\cat_prediction_engine_structured\\data",
];
const ZIP_PATTERN = /^CAT_VARC.*\.zip$/i;
const EXTRACT_DIR = path.join(CWD, ".tmp", "cat_varc_extract");
const PY_SCRIPT = path.join(CWD, ".tmp", "varc_pdf_extractor.py");
const OUTPUT_PATH = path.join(CWD, "content/cat/practice/generated/cat_varc_source_practice.json");
const REPORT_PATH = path.join(CWD, "reports/local_imports/CAT_VARC_SOURCE_IMPORT_REPORT.md");
const CSV_PATH = path.join(CWD, "content/cat/practice/reports/cat_varc_source_import.csv");

// ─── Entry ────────────────────────────────────────────────────────────────────

const zipPath = findZip();
console.log(`ZIP found: ${zipPath}`);

for (const d of [path.dirname(PY_SCRIPT), EXTRACT_DIR, path.dirname(OUTPUT_PATH), path.dirname(REPORT_PATH), path.dirname(CSV_PATH)]) {
  fs.mkdirSync(d, { recursive: true });
}

fs.writeFileSync(
  PY_SCRIPT,
  "import sys\nfrom pdfminer.high_level import extract_text\ntext = extract_text(sys.argv[1])\nsys.stdout.buffer.write(text.encode(\"utf-8\", errors=\"replace\"))\n",
  "utf8",
);

ensureExtracted(zipPath, EXTRACT_DIR);

const pdfFiles = fs
  .readdirSync(EXTRACT_DIR)
  .filter((f) => f.toLowerCase().endsWith(".pdf"))
  .sort()
  .map((f) => path.join(EXTRACT_DIR, f));

console.log(`PDFs found: ${pdfFiles.length}`);

const allRows: VarcSourceRow[] = [];
const globalWarnings: string[] = [];

for (let si = 0; si < pdfFiles.length; si++) {
  const pdfPath = pdfFiles[si];
  const setNumber = si + 1;
  const sourceFile = path.basename(pdfPath);
  process.stdout.write(`  [${setNumber}/${pdfFiles.length}] ${sourceFile} ... `);

  const rawText = extractPdfText(pdfPath);
  if (!rawText.trim()) {
    globalWarnings.push(`${sourceFile}: empty PDF text`);
    console.log("SKIP (empty)");
    continue;
  }

  const text = cleanText(rawText);
  const { questionPaper, answerKey, solutions } = splitDocSections(text);
  const solutionMap = parseSolutionMap(solutions);
  const akMap = parseAnswerKeyFallback(answerKey);

  try {
    const rows = parseQuestionPaper(questionPaper, sourceFile, setNumber, solutionMap, akMap);
    allRows.push(...rows);
    console.log(`${rows.length} questions (${solutionMap.size} solutions, ${akMap.size} AK entries)`);
  } catch (err) {
    globalWarnings.push(`${sourceFile}: parser error – ${String(err)}`);
    console.log(`ERROR: ${String(err)}`);
  }
}

allRows.sort((a, b) => a.source_set_number - b.source_set_number || a.source_question_number - b.source_question_number);

// Backup existing output
if (fs.existsSync(OUTPUT_PATH)) {
  const backup = OUTPUT_PATH.replace(/\.json$/, `.backup.${Date.now()}.json`);
  fs.copyFileSync(OUTPUT_PATH, backup);
  console.log(`Backup: ${path.relative(CWD, backup)}`);
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allRows, null, 2), "utf8");
fs.writeFileSync(REPORT_PATH, buildReport(allRows, pdfFiles, globalWarnings), "utf8");
fs.writeFileSync(CSV_PATH, toCsv(allRows), "utf8");

// ─── Summary ──────────────────────────────────────────────────────────────────

const visible = countBy(allRows, (r) => r.student_visible);
const hidden = allRows.length - visible;
const rcRows = allRows.filter((r) => r.varc_type === "RC");
const vaRows = allRows.filter((r) => r.varc_type !== "RC");
const passages = new Set(allRows.map((r) => r.passage_id).filter(Boolean));

console.log("\n=== CAT VARC Source Import Summary ===");
console.log(`ZIP file:            ${zipPath}`);
console.log(`PDFs processed:      ${pdfFiles.length}`);
console.log(`Total rows:          ${allRows.length}`);
console.log(`RC passages:         ${passages.size}`);
console.log(`RC questions:        ${rcRows.length}`);
console.log(`VA questions:        ${vaRows.length}`);
console.log(`Student visible:     ${visible}`);
console.log(`Hidden/review:       ${hidden}`);
console.log(`Beginner:            ${countBy(allRows, (r) => r.practice_level === "Beginner")}`);
console.log(`Intermediate:        ${countBy(allRows, (r) => r.practice_level === "Intermediate")}`);
console.log(`Advanced:            ${countBy(allRows, (r) => r.practice_level === "Advanced")}`);
console.log(`Output:              ${path.relative(CWD, OUTPUT_PATH)}`);
console.log(`Report:              ${path.relative(CWD, REPORT_PATH)}`);
console.log(`CSV:                 ${path.relative(CWD, CSV_PATH)}`);

// ─── Zip & extraction ─────────────────────────────────────────────────────────

function findZip(): string {
  for (const dir of ZIP_SEARCH) {
    if (!fs.existsSync(dir)) continue;
    const found = fs.readdirSync(dir).find((f) => ZIP_PATTERN.test(f));
    if (found) return path.join(dir, found);
  }
  throw new Error(`CAT_VARC*.zip not found in: ${ZIP_SEARCH.join(", ")}`);
}

function ensureExtracted(zipPath: string, destDir: string): void {
  const hasPdfs = fs.existsSync(destDir) && fs.readdirSync(destDir).some((f) => f.toLowerCase().endsWith(".pdf"));
  if (hasPdfs) { console.log(`Re-using existing extraction at ${destDir}`); return; }
  fs.mkdirSync(destDir, { recursive: true });
  const ps = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/'/g, "''")}', '${destDir.replace(/'/g, "''")}')`;
  execSync(`powershell -Command "${ps}"`, { stdio: "pipe" });
}

// ─── PDF text extraction ──────────────────────────────────────────────────────

function extractPdfText(pdfPath: string): string {
  try {
    const result = execSync(`python "${PY_SCRIPT}" "${pdfPath}"`, {
      encoding: "buffer",
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return result.toString("utf-8");
  } catch {
    return "";
  }
}

// ─── Text cleaning ────────────────────────────────────────────────────────────

function cleanText(raw: string): string {
  const CID_MAP: Record<string, string> = {
    "136": "\u2022", "22": "\u2013", "21": "\u2014",
    "16": "\u2018", "17": "\u2019",
    "18": "\u201C", "19": "\u201D",
    "28": "fi", "29": "fl", "30": "ff", "14": "fl", "15": "ffi", "31": "ffl",
  };
  let text = raw.replace(/\(cid:(\d+)\)/g, (_, n: string) => CID_MAP[n] ?? "");

  // Remove page-break artifacts: a bare page number optionally followed by title lines
  text = text.replace(
    /\n\s*\d{1,3}\s*\n(\s*\d+ Questions?[^\n]*\n)?(\s*(?:CAT[-\s+](?:plus\s+)?VARC|CATplus\s+VARC|CAT\s+VARC)[^\n]*\n)*/gi,
    "\n",
  );

  const lines = text.split("\n").filter((line) => {
    const t = line.trim();
    if (/^\d{1,3}$/.test(t)) return false;
    if (/^\d+ Questions?\s*[|·—\-]\s*\d+ Minutes?/.test(t)) return false;
    if (/^(?:CAT[-\s+](?:plus\s+)?VARC|CATplus\s+VARC)\s*(?:Simulation|Hardened|Practice|Paper|Batch)?$/i.test(t)) return false;
    if (/^CAT\s+VARC\s+(?:Hardened|Simulation|Practice)\s*(?:Batch|Paper)?$/i.test(t)) return false;
    if (/^Target:\s*99/.test(t)) return false;
    return true;
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ─── Section splitting ────────────────────────────────────────────────────────

function splitDocSections(text: string): { questionPaper: string; answerKey: string; solutions: string } {
  const qpIdx = firstMatch(text, [/^Question\s+Paper\s*$/im, /^Question\s+Paper\b/im]);
  const akIdx = firstMatch(text, [/^Answer\s+Key\s*$/im, /^Answer\s+Key\b/im]);
  const solIdx = firstMatch(text, [/^Detailed\s+Solutions\s*$/im, /^Detailed\s+Solutions\b/im]);

  const qpStart = qpIdx ?? 0;
  const qpEnd = akIdx ?? solIdx ?? text.length;
  const akEnd = solIdx ?? text.length;

  return {
    questionPaper: text.slice(qpStart, qpEnd).trim(),
    answerKey: akIdx != null ? text.slice(akIdx, akEnd).trim() : "",
    solutions: solIdx != null ? text.slice(solIdx).trim() : "",
  };
}

function firstMatch(text: string, patterns: RegExp[]): number | null {
  for (const p of patterns) {
    const m = p.exec(text);
    if (m?.index != null) return m.index;
  }
  return null;
}

// ─── Solution parsing (primary answer source) ─────────────────────────────────

function parseSolutionMap(solutionsText: string): Map<number, SolutionEntry> {
  const map = new Map<number, SolutionEntry>();
  if (!solutionsText.trim()) return map;

  // Matches: "Q1. Answer: (2)." | "Q1. Answer: A." | "Q1. Correct: Option 1" | "Q1. Answer: 2314"
  const ANSWER_RE = /Q(\d+)\.\s*(?:Answer|Correct)\s*:?\s*\(?(?:Option\s*)?([ABCDabcd1-9]\d*)\)?/gi;

  for (const match of solutionsText.matchAll(ANSWER_RE)) {
    const qNum = parseInt(match[1], 10);
    const rawAnswer = match[2].trim();
    if (map.has(qNum)) continue;

    // Capture full solution body from this Q to next Q header
    const bodyStart = match.index! + match[0].length;
    const nextQMatch = /Q\d+\.\s*(?:Answer|Correct)/i.exec(solutionsText.slice(bodyStart));
    const bodyEnd = nextQMatch ? bodyStart + nextQMatch.index! : solutionsText.length;
    const solution = solutionsText.slice(match.index!, bodyEnd).trim();

    map.set(qNum, { answer: rawAnswer, solution });
  }

  return map;
}

// ─── Answer key parsing (fallback) ───────────────────────────────────────────

function parseAnswerKeyFallback(akText: string): Map<number, AkEntry> {
  const map = new Map<number, AkEntry>();
  if (!akText.trim()) return map;

  const lines = akText.split("\n").map((l) => l.trim()).filter(Boolean);

  const qNums: number[] = [];
  const answers: string[] = [];
  const difficulties: string[] = [];
  const types: string[] = [];
  let phase: "scan" | "qnums" | "types" | "answers" | "diff" = "scan";

  for (const line of lines) {
    if (/^Q\.?\s*No\.?/i.test(line)) { phase = "qnums"; continue; }
    if (/^Type$/i.test(line)) { phase = "types"; continue; }
    if (/^Answer(?:\s+Difficulty)?$/i.test(line) || /^Format\s+Answer$/i.test(line)) { phase = "answers"; continue; }
    if (/^Difficulty$/i.test(line)) { phase = "diff"; continue; }

    if (phase === "qnums" && /^\d{1,2}$/.test(line)) { qNums.push(parseInt(line, 10)); continue; }
    if (phase === "qnums" && /^Q\d{1,2}$/.test(line)) { qNums.push(parseInt(line.slice(1), 10)); continue; }

    if (phase === "types") {
      if (/^(RC|Para|Odd|Sentence|MCQ|TITA)/i.test(line)) { types.push(line); continue; }
      if (/^[A-D1-9]$|^\d{3,5}$/.test(line)) { phase = "answers"; answers.push(line); continue; }
    }

    if (phase === "answers") {
      if (/^[A-Da-d1-4]$|^\d{3,5}$/.test(line)) { answers.push(line); continue; }
      if (/^(?:Very\s+Hard|Hard|Medium|Easy)/i.test(line)) { phase = "diff"; difficulties.push(line); continue; }
    }

    if (phase === "diff" && /^(?:Very\s+Hard|Hard|Medium|Easy)/i.test(line)) {
      difficulties.push(line);
    }
  }

  for (let i = 0; i < qNums.length; i++) {
    map.set(qNums[i], {
      answer: answers[i] ?? "",
      difficulty: difficulties[i] ?? "",
      qType: types[i] ?? "",
    });
  }

  return map;
}

// ─── Question paper parsing ───────────────────────────────────────────────────

function parseQuestionPaper(
  qpText: string,
  sourceFile: string,
  setNumber: number,
  solutionMap: Map<number, SolutionEntry>,
  akMap: Map<number, AkEntry>,
): VarcSourceRow[] {
  const fileSlug = makeFileSlug(sourceFile);
  const rows: VarcSourceRow[] = [];
  const blocks = splitIntoBlocks(qpText);

  if (!blocks.length) {
    return []; // nothing found
  }

  for (const block of blocks) {
    if (block.type === "rc") {
      const { passageText, questions } = parseRcBlock(block.text, block.qRange);
      const passageId = passageText.trim()
        ? `VARC_SOURCE_${fileSlug}_S${setNumber}_P${block.passageNum}`
        : "";

      for (const q of questions) {
        rows.push(buildRow(q, passageId, passageText, "RC", setNumber, sourceFile, fileSlug, solutionMap, akMap));
      }
    } else {
      const questions = parseVaBlock(block.text, block.qRange);
      for (const q of questions) {
        rows.push(buildRow(q, "", "", detectVarcType(q), setNumber, sourceFile, fileSlug, solutionMap, akMap));
      }
    }
  }

  // Dedup: if multiple rows end up with the same question_id (e.g. multi-passage files
  // where each passage restarts Q-numbering), append _DUP2, _DUP3 … to later occurrences.
  const seenIds = new Map<string, number>();
  for (const row of rows) {
    const base = row.question_id;
    const n = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, n);
    if (n > 1) row.question_id = `${base}_DUP${n}`;
  }

  return rows;
}

// ─── Block splitting ──────────────────────────────────────────────────────────

function splitIntoBlocks(qpText: string): QBlock[] {
  type Header = { type: "rc" | "va"; idx: number; len: number; passageNum: number; q1: number; q2: number };
  const headers: Header[] = [];

  // RC passage headers
  // "Passage I (Questions 1–4)" | "Passage 1 (Questions 1–5)" | "Reading Comprehension – Passage 1 ... questions 1–5"
  const RC_HDR = /(?:Passage\s+(I{1,3}V?|IV|[1-9])\s*\(?Questions?\s*(\d+)\s*[–\-—]\s*(\d+)\)?|(?:Reading\s+Comprehension[\s\S]{0,40}?)Passage\s+(\d+)[\s\S]{0,120}?(?:questions?\s*(\d+)\s*[–\-—]\s*(\d+))?)/gi;
  for (const m of qpText.matchAll(RC_HDR)) {
    const passageNum = romanToInt(m[1] ?? m[4] ?? "1");
    const q1 = parseInt(m[2] ?? m[5] ?? "1", 10);
    const q2 = parseInt(m[3] ?? m[6] ?? String(q1 + 3), 10);
    headers.push({ type: "rc", idx: m.index!, len: m[0].length, passageNum, q1, q2 });
  }

  // VA section header
  const VA_HDR = /Verbal\s+Ability\s*\(?(?:Questions?\s*(\d+)\s*[–\-—]\s*(\d+))?\)?/gi;
  for (const m of qpText.matchAll(VA_HDR)) {
    const q1 = m[1] ? parseInt(m[1], 10) : 17;
    const q2 = m[2] ? parseInt(m[2], 10) : 24;
    headers.push({ type: "va", idx: m.index!, len: m[0].length, passageNum: 0, q1, q2 });
  }

  headers.sort((a, b) => a.idx - b.idx);

  if (!headers.length) return [];

  const blocks: QBlock[] = [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const start = h.idx + h.len;
    const end = headers[i + 1]?.idx ?? qpText.length;
    const blockText = qpText.slice(start, end).trim();
    if (blockText) {
      blocks.push({ type: h.type, text: blockText, passageNum: h.passageNum, qRange: [h.q1, h.q2] });
    }
  }

  return blocks;
}

// ─── RC block parsing ─────────────────────────────────────────────────────────

function parseRcBlock(text: string, qRange: [number, number]): { passageText: string; questions: RawQuestion[] } {
  // Strip standard instructions lines
  let t = text
    .replace(/^The passage below is accompanied by[^\n]+(?:\n[^\n]+)?\n/im, "")
    .replace(/^Based on the passage, choose the best answer[^\n]+\n/im, "")
    .replace(/^Read the passage below and answer questions?[^\n]+\n/im, "")
    .trim();

  const [q1, q2] = qRange;
  const expected = range(q1, q2);

  // Find first question position using expected Q numbers
  const qNumPat = new RegExp(`^(?:Q\\s*)?(${expected.join("|")})\\.\\s`, "m");
  const firstQ = qNumPat.exec(t);

  if (!firstQ) {
    return { passageText: t, questions: [] };
  }

  const passageText = t.slice(0, firstQ.index).trim();
  const questionsText = t.slice(firstQ.index);
  const questions = splitAndParseQuestions(questionsText, expected, false);

  return { passageText, questions };
}

// ─── VA block parsing ─────────────────────────────────────────────────────────

function parseVaBlock(text: string, qRange: [number, number]): RawQuestion[] {
  const [q1, q2] = qRange;
  const expected = range(q1, q2);
  const questions = splitAndParseQuestions(text, expected, true);
  return questions;
}

// ─── Question splitting ───────────────────────────────────────────────────────

function splitAndParseQuestions(text: string, expectedNums: number[], isVa: boolean): RawQuestion[] {
  const questions: RawQuestion[] = [];
  const Q_MARKER = /^(?:Q\s*)?(\d{1,2})\.\s/gm;
  const markers: Array<{ num: number; idx: number; raw: string }> = [];

  for (const m of text.matchAll(Q_MARKER)) {
    const num = parseInt(m[1], 10);
    if (!expectedNums.length || expectedNums.includes(num)) {
      markers.push({ num, idx: m.index!, raw: m[0] });
    }
  }

  if (!markers.length) return [];

  for (let i = 0; i < markers.length; i++) {
    const contentStart = markers[i].idx + markers[i].raw.length;
    const contentEnd = markers[i + 1]?.idx ?? text.length;
    const rawContent = text.slice(contentStart, contentEnd).trim();
    const rawBlock = markers[i].raw + rawContent;
    const parsed = parseQuestionBlock(rawContent);

    questions.push({
      qNum: markers[i].num,
      questionText: parsed.questionText,
      options: parsed.options,
      isTita: parsed.isTita,
      isVa,
      vaType: parsed.vaType,
      rawBlock,
    });
  }

  return questions;
}

// ─── Single question block parser ─────────────────────────────────────────────

function parseQuestionBlock(text: string): {
  questionText: string;
  options: { a: string; b: string; c: string; d: string; e: string };
  isTita: boolean;
  vaType: string;
} {
  let t = text;
  let vaType = "";

  // Strip explicit VA type label at start: "(Para Summary)" etc.
  const VA_LABEL = /^\s*\((Para\s+Summary|Para\s+Jumble|Odd\s+Sentence\s+Out|Sentence\s+Placement|Para\s+Completion|Critical\s+Reasoning)\)\s*/i;
  const vaLabelMatch = VA_LABEL.exec(t);
  if (vaLabelMatch) {
    vaType = vaLabelMatch[1].trim();
    t = t.slice(vaLabelMatch[0].length).trim();
  }

  const isTita = /\(TITA\)/i.test(t);

  // MCQ options: "(A)", "(B)", "(1)", "(2)" etc. at start of line
  const OPT_RE = /\n\s*\(([1-4ABCDabcd])\)\s*/g;
  const optMatches = [...t.matchAll(OPT_RE)];

  if (optMatches.length >= 2) {
    const firstIdx = optMatches[0].index!;
    const questionText = t.slice(0, firstIdx).trim();
    const optTexts: string[] = [];

    for (let i = 0; i < optMatches.length; i++) {
      const start = optMatches[i].index! + optMatches[i][0].length;
      const end = optMatches[i + 1]?.index ?? t.length;
      optTexts.push(t.slice(start, end).trim());
    }

    return { questionText, options: { a: optTexts[0] ?? "", b: optTexts[1] ?? "", c: optTexts[2] ?? "", d: optTexts[3] ?? "", e: optTexts[4] ?? "" }, isTita: false, vaType };
  }

  // Numbered sentences (Para Jumble / Odd Sentence Out)
  const SENT_RE = /^(\d)\.\s/gm;
  const sentMatches = [...t.matchAll(SENT_RE)];

  if (sentMatches.length >= 3) {
    const firstIdx = sentMatches[0].index!;
    const questionText = t.slice(0, firstIdx).trim();
    const sentences: string[] = [];

    for (let i = 0; i < sentMatches.length; i++) {
      const start = sentMatches[i].index! + sentMatches[i][0].length;
      const end = sentMatches[i + 1]?.index ?? t.length;
      sentences.push(t.slice(start, end).trim());
    }

    return { questionText, options: { a: sentences[0] ?? "", b: sentences[1] ?? "", c: sentences[2] ?? "", d: sentences[3] ?? "", e: sentences[4] ?? "" }, isTita: true, vaType };
  }

  // Sentence Placement: bare single-letter options A/B/C/D at end
  const BARE_RE = /\n\s*([ABCD])\s*\n/g;
  const bareMatches = [...t.matchAll(BARE_RE)];

  if (bareMatches.length >= 3) {
    const firstIdx = bareMatches[0].index!;
    const questionText = t.slice(0, firstIdx).trim();
    const optLetters = bareMatches.map((m) => m[1]);
    return { questionText, options: { a: optLetters[0] ?? "A", b: optLetters[1] ?? "B", c: optLetters[2] ?? "C", d: optLetters[3] ?? "D", e: "" }, isTita: false, vaType: vaType || "Sentence Placement" };
  }

  return { questionText: t.trim(), options: { a: "", b: "", c: "", d: "", e: "" }, isTita, vaType };
}

// ─── VARC type detection ──────────────────────────────────────────────────────

function detectVarcType(q: RawQuestion): VarcType {
  if (!q.isVa) return "RC";

  // Explicit label from parsing
  if (q.vaType) {
    const vt = q.vaType.toLowerCase();
    if (/para\s+summary/.test(vt)) return "Para Summary";
    if (/para\s+jumble/.test(vt)) return "Para Jumble";
    if (/odd\s+sentence/.test(vt)) return "Odd Sentence Out";
    if (/sentence\s+placement/.test(vt)) return "Sentence Placement";
    if (/para\s+completion/.test(vt)) return "Para Completion";
    if (/critical/.test(vt)) return "Critical Reasoning";
  }

  // Infer from question text
  const t = q.questionText.toLowerCase();
  if (/four summaries?|best captures the essence|followed by four summar/.test(t)) return "Para Summary";
  if (/five jumbled|four of them can be put together|odd sentence out|identify the odd sentence/.test(t)) return "Odd Sentence Out";
  if (/properly sequenced|correct sequence|four-digit|key in the.*digit|four sentences.*sequenced/.test(t)) return "Para Jumble";
  if (/\[a\]|\[b\]|\[c\]|\[d\]|removed.*sentence|sentence in italics|most appropriate position/.test(t)) return "Sentence Placement";
  if (/concludes the paragraph|para completion|last sentence/.test(t)) return "Para Completion";
  if (/strengthen|weaken|assumption|critical reasoning/.test(t)) return "Critical Reasoning";

  // Infer from TITA + numbered sentences
  if (q.isTita && q.options.e) return "Odd Sentence Out"; // 5 sentences
  if (q.isTita) return "Para Jumble"; // 4 sentences, TITA sequence

  return "Other";
}

// ─── Row building ─────────────────────────────────────────────────────────────

function buildRow(
  q: RawQuestion,
  passageId: string,
  passageText: string,
  defaultType: VarcType,
  setNumber: number,
  sourceFile: string,
  fileSlug: string,
  solutionMap: Map<number, SolutionEntry>,
  akMap: Map<number, AkEntry>,
): VarcSourceRow {
  const sol = solutionMap.get(q.qNum);
  const ak = akMap.get(q.qNum);
  const varcType: VarcType = defaultType === "RC" ? "RC" : detectVarcType(q);

  const isTita = q.isTita || varcType === "Para Jumble" || varcType === "Odd Sentence Out";
  const rawAnswer = sol?.answer ?? ak?.answer ?? "";
  const correctAnswer = normalizeAnswer(rawAnswer, isTita);

  const hasPassage = passageText.trim().length > 0;
  const hasQuestion = q.questionText.trim().length > 0;
  const hasOptions = q.options.a.trim().length > 0 || q.options.b.trim().length > 0;
  const hasAnswer = correctAnswer.length > 0;

  const warnings: string[] = [];

  let parseStatus: ParseStatus;
  if (varcType === "RC") {
    if (hasPassage && hasQuestion && hasOptions && hasAnswer) parseStatus = "complete_rc_set";
    else if (hasPassage && hasQuestion && hasOptions) { parseStatus = "missing_answer"; warnings.push("answer not found"); }
    else if (hasPassage && hasQuestion) { parseStatus = "missing_options"; warnings.push("MCQ options not found"); }
    else if (hasQuestion) { parseStatus = "incomplete_parse"; warnings.push("passage text missing"); }
    else { parseStatus = "raw_block_fallback"; warnings.push("question not parsed"); }
  } else {
    if (hasQuestion && hasAnswer) parseStatus = "complete_va_question";
    else if (hasQuestion) { parseStatus = "missing_answer"; warnings.push("answer not found"); }
    else { parseStatus = "raw_block_fallback"; warnings.push("VA question not parsed"); }
  }

  // Strict rule: must have answer to be student_visible
  const studentVisible = hasQuestion && hasAnswer;

  const rawDifficulty = ak?.difficulty ?? "";
  const difficulty = normalizeDifficulty(rawDifficulty);
  const practiceLevel = assignPracticeLevel(difficulty);

  const topic = "VARC";
  const subtopic = varcType === "RC" ? "Reading Comprehension" : varcType;
  const qId = `VARC_SOURCE_${fileSlug}_S${String(setNumber).padStart(2, "0")}_Q${String(q.qNum).padStart(3, "0")}`;

  return {
    question_id: qId,
    exam: "CAT",
    section: "VARC",
    source_file: sourceFile,
    source_set_number: setNumber,
    source_question_number: q.qNum,
    varc_type: varcType,
    passage_id: passageId,
    passage_title: "",
    passage_text_markdown: passageText,
    question_text_markdown: q.questionText,
    option_a_markdown: q.options.a,
    option_b_markdown: q.options.b,
    option_c_markdown: q.options.c,
    option_d_markdown: q.options.d,
    option_e_markdown: q.options.e,
    correct_answer: correctAnswer,
    detailed_solution_markdown: sol?.solution ?? "",
    difficulty,
    practice_level: practiceLevel,
    topic,
    subtopic,
    source_raw_block: q.rawBlock,
    parse_status: parseStatus,
    parse_warnings: warnings,
    student_visible: studentVisible,
  };
}

// ─── Normalisation helpers ────────────────────────────────────────────────────

function normalizeAnswer(raw: string, isTita: boolean): string {
  const cleaned = raw.trim().replace(/^\(|\)$/g, "").trim();
  if (!cleaned) return "";

  // TITA: keep as-is
  if (isTita) return cleaned;

  // MCQ: single letter A-D
  if (/^[A-Da-d]$/.test(cleaned)) return cleaned.toUpperCase();
  // MCQ: digit 1-4 → A-D
  if (/^[1-4]$/.test(cleaned)) return (["A", "B", "C", "D"] as const)[parseInt(cleaned, 10) - 1] ?? cleaned;
  // "Option 1" / "Option A"
  const optMatch = /^[Oo]ption\s*([1-4A-Da-d])$/.exec(cleaned);
  if (optMatch) {
    const v = optMatch[1];
    if (/[1-4]/.test(v)) return (["A", "B", "C", "D"] as const)[parseInt(v, 10) - 1] ?? v;
    return v.toUpperCase();
  }

  return cleaned;
}

function normalizeDifficulty(raw: string): string {
  const t = raw.toLowerCase();
  if (/very\s*hard|very\s*difficult/.test(t)) return "Very Hard";
  if (/medium[-\s]hard/.test(t)) return "Medium-Hard";
  if (/hard|difficult/.test(t)) return "Hard";
  if (/medium|moderate/.test(t)) return "Medium";
  if (/easy|basic/.test(t)) return "Easy";
  return "";
}

function assignPracticeLevel(difficulty: string): PracticeLevel {
  const d = difficulty.toLowerCase();
  if (/very\s*hard/.test(d)) return "Advanced";
  if (/hard/.test(d)) return "Intermediate";
  if (/medium[-\s]hard/.test(d)) return "Intermediate";
  if (/medium/.test(d)) return "Intermediate";
  if (/easy/.test(d)) return "Beginner";
  return "Intermediate"; // default per spec
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function makeFileSlug(filename: string): string {
  return path.basename(filename, path.extname(filename))
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase()
    .slice(0, 40);
}

function romanToInt(s: string): number {
  const map: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
  return (map[s.toUpperCase()] ?? parseInt(s, 10)) || 1;
}

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

function countBy<T>(arr: T[], pred: (v: T) => boolean): number {
  return arr.filter(pred).length;
}

function countValues(vals: string[]): Array<{ label: string; count: number }> {
  const m: Record<string, number> = {};
  for (const v of vals) m[v || "Unmapped"] = (m[v || "Unmapped"] ?? 0) + 1;
  return Object.entries(m)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Report ───────────────────────────────────────────────────────────────────

function buildReport(rows: VarcSourceRow[], pdfs: string[], warnings: string[]): string {
  const rc = rows.filter((r) => r.varc_type === "RC");
  const va = rows.filter((r) => r.varc_type !== "RC");
  const passages = new Set(rows.map((r) => r.passage_id).filter(Boolean));
  const visible = rows.filter((r) => r.student_visible);
  const statusCounts = countValues(rows.map((r) => r.parse_status));
  const typeCounts = countValues(rows.map((r) => r.varc_type));
  const firstIds = rows.slice(0, 30).map((r, i) => `${i + 1}. \`${r.question_id}\``).join("\n");
  const perFile = Object.entries(
    rows.reduce<Record<string, string[]>>((acc, r) => {
      (acc[r.source_file] ??= []).push(...r.parse_warnings);
      return acc;
    }, {}),
  ).filter(([, w]) => w.length).map(([f, w]) => `### ${f}\n${w.map((x) => `- ${x}`).join("\n")}`).join("\n\n");

  return `# CAT VARC Source Import Report

Generated: ${new Date().toISOString()}

ZIP: \`${zipPath}\`
Output: \`${path.relative(CWD, OUTPUT_PATH)}\`

## Summary

| Metric | Count |
| --- | ---: |
| PDF files extracted | ${pdfs.length} |
| Total rows | ${rows.length} |
| RC passages parsed | ${passages.size} |
| RC questions | ${rc.length} |
| VA questions | ${va.length} |
| Student visible | ${visible.length} |
| Hidden / review | ${rows.length - visible.length} |
| Beginner | ${countBy(rows, (r) => r.practice_level === "Beginner")} |
| Intermediate | ${countBy(rows, (r) => r.practice_level === "Intermediate")} |
| Advanced | ${countBy(rows, (r) => r.practice_level === "Advanced")} |

## Parse Status Counts

${statusCounts.map(({ label, count }) => `| ${label} | ${count} |`).join("\n") || "- None"}

## VARC Type Counts

${typeCounts.map(({ label, count }) => `| ${label} | ${count} |`).join("\n") || "- None"}

## First 30 Question IDs

${firstIds || "- None"}

## Global Warnings

${warnings.length ? warnings.map((w) => `- ${w}`).join("\n") : "- None"}

## Parse Warnings by Source File

${perFile || "- None"}
`;
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

function toCsv(rows: VarcSourceRow[]): string {
  const headers = [
    "question_id", "source_file", "source_set_number", "source_question_number",
    "varc_type", "passage_id", "difficulty", "practice_level", "topic", "subtopic",
    "parse_status", "student_visible", "has_passage", "has_options", "has_answer", "parse_warnings",
  ];
  const csvRows = rows.map((r) => [
    r.question_id,
    r.source_file,
    String(r.source_set_number),
    String(r.source_question_number),
    r.varc_type,
    r.passage_id,
    r.difficulty,
    r.practice_level,
    r.topic,
    r.subtopic,
    r.parse_status,
    String(r.student_visible),
    String(r.passage_text_markdown.trim().length > 0),
    String(r.option_a_markdown.trim().length > 0),
    String(r.correct_answer.trim().length > 0),
    r.parse_warnings.join("; "),
  ].map(csvCell).join(","));
  return [headers.join(","), ...csvRows].join("\n");
}

function csvCell(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}


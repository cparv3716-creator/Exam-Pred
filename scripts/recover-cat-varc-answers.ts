import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// ─── Paths ────────────────────────────────────────────────────────────────────

const CWD = process.cwd();
const BANK_PATH = path.join(CWD, "content/cat/practice/generated/cat_varc_source_practice.json");
const EXTRACT_DIR = path.join(CWD, ".tmp", "cat_varc_extract");
const PY_SCRIPT = path.join(CWD, ".tmp", "varc_pdf_extractor.py");
const REPORT_PATH = path.join(CWD, "reports/local_imports/CAT_VARC_ANSWER_RECOVERY_REPORT.md");
const CSV_PATH = path.join(CWD, "content/cat/practice/reports/cat_varc_answer_recovery.csv");

type VarcRow = {
  question_id: string;
  source_file: string;
  source_set_number: number;
  source_question_number: number;
  varc_type: string;
  passage_id: string;
  passage_text_markdown: string;
  question_text_markdown: string;
  option_a_markdown: string;
  option_b_markdown: string;
  option_c_markdown: string;
  option_d_markdown: string;
  option_e_markdown: string;
  correct_answer: string;
  correct_answer_candidate?: string;
  detailed_solution_markdown: string;
  difficulty: string;
  practice_level: string;
  parse_status: string;
  parse_warnings: string[];
  student_visible: boolean;
  answer_source?: string;
  answer_extraction_confidence?: string;
};

type AnswerEntry = {
  answer: string;
  solution: string;
  difficulty: string;
  confidence: "high" | "medium";
  source: string;
};

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

// ─── Text normalization ───────────────────────────────────────────────────────

function cleanText(raw: string): string {
  const CID_MAP: Record<string, string> = {
    "136": "•", "22": "–", "21": "—",
    "16": "‘", "17": "’",
    "18": "“", "19": "”",
    "28": "fi", "29": "fl", "30": "ff", "14": "fl", "15": "ffi", "31": "ffl",
  };
  // Normalize form feeds (\f) to newlines — pdfminer inserts \f at page breaks,
  // but JS ^ multiline anchor only matches after \n, not \f.
  return raw
    .replace(/\f/g, "\n")
    .replace(/\(cid:(\d+)\)/g, (_, n: string) => CID_MAP[n] ?? "");
}

// ─── Answer normalisation ─────────────────────────────────────────────────────

function normalizeAnswer(raw: string, isTita: boolean): string {
  const cleaned = raw.trim().replace(/^\(|\)$/g, "").replace(/^\[|\]$/g, "").trim();
  if (!cleaned) return "";
  if (isTita) return cleaned;
  if (/^[A-Da-d]$/.test(cleaned)) return cleaned.toUpperCase();
  if (/^[1-4]$/.test(cleaned)) return (["A", "B", "C", "D"] as const)[parseInt(cleaned, 10) - 1] ?? cleaned;
  const optMatch = /^[Oo]ption\s*([1-4A-Da-d])$/.exec(cleaned);
  if (optMatch) {
    const v = optMatch[1];
    if (/[1-4]/.test(v)) return (["A", "B", "C", "D"] as const)[parseInt(v, 10) - 1] ?? v;
    return v.toUpperCase();
  }
  return cleaned;
}

function isTitaType(varc_type: string): boolean {
  return varc_type === "Para Jumble" || varc_type === "Odd Sentence Out";
}

// ─── Section splitting (handles numbered prefixes like "4. Detailed Solutions") ──

function splitSections(text: string): { questionPaper: string; answerKey: string; solutions: string } {
  const QPat = [/^(?:\d+\.\s*)?Question\s+Paper\s*$/im, /^(?:\d+\.\s*)?Question\s+Paper\b/im];
  const AKPat = [/^(?:\d+\.\s*)?Answer\s+Key\s*$/im, /^(?:\d+\.\s*)?ANSWER\s+KEY\s*$/im, /^(?:\d+\.\s*)?Answer\s+Key\b/im];
  const SOLPat = [/^(?:\d+\.\s*)?Detailed\s+Solutions\s*$/im, /^(?:\d+\.\s*)?DETAILED\s+SOLUTIONS\s*$/im, /^(?:\d+\.\s*)?Detailed\s+Solutions\b/im];

  const find = (pats: RegExp[]): number | null => {
    for (const p of pats) {
      const m = p.exec(text);
      if (m?.index != null) return m.index;
    }
    return null;
  };

  const qpIdx = find(QPat);
  const akIdx = find(AKPat);
  const solIdx = find(SOLPat);

  const qpStart = qpIdx ?? 0;
  const qpEnd = akIdx ?? solIdx ?? text.length;
  const akEnd = solIdx ?? text.length;

  return {
    questionPaper: text.slice(qpStart, qpEnd).trim(),
    answerKey: akIdx != null ? text.slice(akIdx, akEnd).trim() : "",
    solutions: solIdx != null ? text.slice(solIdx).trim() : "",
  };
}

// ─── Method 1: Enhanced solution parsing ─────────────────────────────────────
// Handles:
//   "Q1. Answer: (2)."          – standard
//   "Q1. Description – Answer: (2)" – description between Q and answer
//   "Q1 (Para Summary)          – no period, space after Q#
//    Correct: (b)."             – answer on next line

function parseSolutionsEnhanced(solutionsText: string): Map<number, AnswerEntry> {
  const map = new Map<number, AnswerEntry>();
  if (!solutionsText.trim()) return map;

  // Strategy A: Q\d+. anything. Answer/Correct : answer  (all on same or nearby line)
  const RE_INLINE = /Q(\d+)[.)]\s*(?:[^\n]{0,120}?)\b(?:Answer|Correct)\s*:?\s*(?:Option\s*)?\(?([ABCDabcd1-9][0-9\-]*)\)?/gim;

  for (const match of solutionsText.matchAll(RE_INLINE)) {
    const qNum = parseInt(match[1], 10);
    if (map.has(qNum)) continue;

    const bodyStart = match.index! + match[0].length;
    const nextQ = /\bQ\d+[.)]/i.exec(solutionsText.slice(bodyStart));
    const bodyEnd = nextQ ? bodyStart + nextQ.index! : solutionsText.length;
    const solution = solutionsText.slice(match.index!, bodyEnd).trim();

    const rawAnswer = match[2].trim();
    map.set(qNum, { answer: rawAnswer, solution, difficulty: "", confidence: "high", source: "solutions_inline" });
  }

  // Strategy C: "Question N – Answer: (2)" format (Hardened Practice Set (1) style)
  const RE_QUEST_N = /\bQuestion\s+(\d+)\s*[–\-—?]+\s*(?:Answer|Correct)\s*:\s*(?:Option\s*)?\(?([ABCDabcd1-9][0-9\-]*)\)?/gim;
  for (const match of solutionsText.matchAll(RE_QUEST_N)) {
    const qNum = parseInt(match[1], 10);
    if (map.has(qNum)) continue;
    const bodyStart = match.index! + match[0].length;
    const nextQ = /\bQuestion\s+\d+\s*[–\-—?]/i.exec(solutionsText.slice(bodyStart));
    const bodyEnd = nextQ ? bodyStart + nextQ.index! : solutionsText.length;
    const solution = solutionsText.slice(match.index!, bodyEnd).trim();
    map.set(qNum, { answer: match[2].trim(), solution, difficulty: "", confidence: "high", source: "solutions_question_n" });
  }

  // Strategy B: "Q1" or "Q1 (desc)" header, then "Correct:" or "Answer:" within 500 chars
  // For format: "Q1 (Para Summary)\n\nCorrect: (b)."
  const RE_QHDR = /^Q(\d+)(?:[.\s]|\s*\()/gim;

  for (const hdrMatch of solutionsText.matchAll(RE_QHDR)) {
    const qNum = parseInt(hdrMatch[1], 10);
    if (map.has(qNum)) continue;

    const searchStart = hdrMatch.index! + hdrMatch[0].length;
    const searchText = solutionsText.slice(searchStart, searchStart + 600);

    // Stop before next Q header
    const nextQ = /^Q\d+(?:\s|\s*\()/im.exec(searchText);
    const window = nextQ ? searchText.slice(0, nextQ.index!) : searchText;

    const ansMatch = /(?:Correct\s+order|Correct|Answer|Odd)\s*:?\s*(?:Option\s*)?[\[(]?([ABCDabcd1-9][0-9–\-]*)[\])]?/.exec(window);
    if (!ansMatch) continue;

    const rawAnswer = ansMatch[1].trim();
    const solution = solutionsText.slice(hdrMatch.index!, searchStart + (nextQ ? nextQ.index! : searchText.length)).trim();
    map.set(qNum, { answer: rawAnswer, solution, difficulty: "", confidence: "high", source: "solutions_header" });
  }

  return map;
}

// ─── Method 2: Column-aware AK parsing ───────────────────────────────────────
// Handles multi-column pdfminer tables where Q# and answers are in separate column blocks.
// Supports both single-column and 2-column AK layouts.

function parseAKColumnAware(akText: string): Map<number, AnswerEntry> {
  const map = new Map<number, AnswerEntry>();
  if (!akText.trim()) return map;

  const lines = akText.split("\n").map(l => l.trim()).filter(Boolean);

  // Collect all digit-only lines 1-30 (candidate Q numbers) in order
  const qNumLines: Array<{ idx: number; val: number }> = [];
  const answerLines: Array<{ idx: number; val: string }> = [];
  const diffLines: Array<{ idx: number; val: string }> = [];

  // Also track lines that could be MCQ digit answers (1-4) — distinct from Q numbers by context
  const digitOnlyLines: Array<{ idx: number; val: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\d{1,2}$/.test(l)) {
      const n = parseInt(l, 10);
      if (n >= 1 && n <= 30) qNumLines.push({ idx: i, val: n });
    }
    if (/^[1-5]$/.test(l)) digitOnlyLines.push({ idx: i, val: l }); // MCQ digit answers OR Q numbers
    if (/^[A-Da-d]$/.test(l)) answerLines.push({ idx: i, val: l.toUpperCase() });
    if (/^\d{3,5}$/.test(l)) answerLines.push({ idx: i, val: l }); // TITA sequence
    if (/^(?:Very\s*Hard|Hard|Medium[-\s]?Hard|Medium|Easy)/i.test(l)) diffLines.push({ idx: i, val: l });
  }

  // Also handle parenthesised answers: (a), (b), (c), (d), (1)–(4)
  for (let i = 0; i < lines.length; i++) {
    const m = /^\(([ABCDabcd1-4])\)$/.exec(lines[i]);
    if (m) answerLines.push({ idx: i, val: m[1] });
  }

  // Sort answer lines by their position in the file
  answerLines.sort((a, b) => a.idx - b.idx);

  // Find the maximal consecutive Q sequence starting at 1
  // e.g. 1,2,3,...,N (may have gaps due to two-column layout)
  const qNums = qNumLines.map(q => q.val).filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b);

  if (!qNums.length) return map;

  // Try to match: find block of answer-like values of same count as Q numbers.
  // Handle two layouts:
  //   A) Answers AFTER Q numbers (normal)
  //   B) Answers BEFORE Q numbers (hardened practice PDFs: MCQ/TITA, answers, then Q#)
  const firstQIdx = qNumLines[0].idx;
  const lastQIdx = qNumLines[qNumLines.length - 1].idx;

  // Try answers after Q numbers first
  let answersInRegion = answerLines.filter(a => a.idx > firstQIdx);

  // If not enough after, try answers BEFORE the Q numbers (layout B: hardened PDFs)
  if (answersInRegion.length < qNums.length) {
    const answersBefore = answerLines.filter(a => a.idx < firstQIdx);
    // Also include digit-only lines before Q numbers as potential MCQ digit answers
    const digitsBefore = digitOnlyLines.filter(a => a.idx < firstQIdx && !qNumLines.some(q => q.idx === a.idx));
    const combined = [...answersBefore, ...digitsBefore]
      .filter((v, i, arr) => arr.findIndex(x => x.idx === v.idx) === i)
      .sort((a, b) => a.idx - b.idx);
    if (combined.length >= qNums.length) {
      answersInRegion = combined;
    }
  }

  // Two-column layout: if qNums are split (1-12 then 13-24), answers may be in 2 blocks
  // Heuristic: take the first N answer-like values where N = qNums.length
  const matchedAnswers = answersInRegion.slice(0, qNums.length);

  if (matchedAnswers.length !== qNums.length) {
    // Fallback: also look for digit 1-5 answers (could be 1=A, etc.)
    const digitAnswers: Array<{ idx: number; val: string }> = [];
    for (let i = firstQIdx; i < lines.length; i++) {
      const l = lines[i];
      if (/^[1-5]$/.test(l) && !qNumLines.some(q => q.idx === i)) {
        digitAnswers.push({ idx: i, val: l });
      }
    }
    // Merge and re-sort
    const combined = [...answersInRegion, ...digitAnswers]
      .filter((v, i, arr) => arr.findIndex(x => x.idx === v.idx) === i)
      .sort((a, b) => a.idx - b.idx)
      .slice(0, qNums.length);
    if (combined.length === qNums.length) {
      for (let i = 0; i < qNums.length; i++) {
        const diff = diffLines[i]?.val ?? "";
        map.set(qNums[i], { answer: combined[i].val, solution: "", difficulty: diff, confidence: "high", source: "ak_column" });
      }
      return map;
    }
  } else {
    for (let i = 0; i < qNums.length; i++) {
      const diff = diffLines[i]?.val ?? "";
      map.set(qNums[i], { answer: matchedAnswers[i].val, solution: "", difficulty: diff, confidence: "high", source: "ak_column" });
    }
    return map;
  }

  // Last resort: scan in order, collect Q#→answer pairs from lines like "1 B" or "Q1 B"
  for (const line of lines) {
    const m = /^(?:Q)?(\d{1,2})\s+([A-Da-d]|\d{3,5})$/.exec(line);
    if (m) {
      const qNum = parseInt(m[1], 10);
      if (!map.has(qNum)) map.set(qNum, { answer: m[2], solution: "", difficulty: "", confidence: "medium", source: "ak_inline" });
    }
  }

  return map;
}

// ─── Method 3: Hardened Practice Set options recovery ────────────────────────
// For PDFs with options formatted as "1. text\n2. text\n3. text\n4. text" (no parens)

type RawOptions = { a: string; b: string; c: string; d: string };

function extractHardenedOptions(questionBlock: string): RawOptions | null {
  // Format: "Q1.\nSection:... Type:... Difficulty:...\nQuestion text\n1. option\n2. option..."
  const NUMBERED_OPT = /^([1-4])\.\s+([\s\S]+?)(?=\n[1-5]\.\s|\n\nQ\d|\n\nReading|\n\nVerbal|$)/gm;
  const opts: Record<string, string> = {};

  for (const m of questionBlock.matchAll(NUMBERED_OPT)) {
    opts[m[1]] = m[2].replace(/\s+/g, " ").trim();
  }

  if (Object.keys(opts).length < 2) return null;
  return { a: opts["1"] ?? "", b: opts["2"] ?? "", c: opts["3"] ?? "", d: opts["4"] ?? "" };
}

// ─── Per-file extraction ──────────────────────────────────────────────────────

function extractAnswersForFile(sourceFile: string): Map<number, AnswerEntry> {
  const pdfPath = path.join(EXTRACT_DIR, sourceFile);
  if (!fs.existsSync(pdfPath)) return new Map();

  const raw = extractPdfText(pdfPath);
  if (!raw.trim()) return new Map();

  const text = cleanText(raw);
  const { answerKey, solutions } = splitSections(text);

  const solMap = parseSolutionsEnhanced(solutions);
  const akMap = parseAKColumnAware(answerKey);

  // Merge: solutions take priority over AK
  const merged = new Map<number, AnswerEntry>();

  // Add AK entries first (lower priority)
  for (const [qNum, entry] of akMap) {
    merged.set(qNum, entry);
  }

  // Overlay solution entries (higher priority) and attach solution text
  for (const [qNum, solEntry] of solMap) {
    const existing = merged.get(qNum);
    if (existing) {
      // Prefer solution answer, attach solution text to AK entry if solution entry has no text
      merged.set(qNum, {
        ...solEntry,
        difficulty: existing.difficulty || solEntry.difficulty,
        solution: solEntry.solution || existing.solution,
      });
    } else {
      merged.set(qNum, solEntry);
    }
  }

  return merged;
}

// ─── Main recovery logic ──────────────────────────────────────────────────────

const bank: VarcRow[] = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));

const visibleBefore = bank.filter(r => r.student_visible).length;
const hiddenBefore = bank.filter(r => !r.student_visible).length;
const missingAnsRows = bank.filter(r => r.parse_status === "missing_answer" && !r.student_visible);
const missingOptRows = bank.filter(r => r.parse_status === "missing_options" && !r.student_visible);

console.log(`\nCAT VARC Answer Recovery`);
console.log(`Rows in bank: ${bank.length}`);
console.log(`Visible before: ${visibleBefore}  Hidden before: ${hiddenBefore}`);
console.log(`  missing_answer (hidden): ${missingAnsRows.length}`);
console.log(`  missing_options (hidden): ${missingOptRows.length}`);

// Cache extracted answers per source file
const perFileAnswers = new Map<string, Map<number, AnswerEntry>>();

function getFileAnswers(sourceFile: string): Map<number, AnswerEntry> {
  if (!perFileAnswers.has(sourceFile)) {
    process.stdout.write(`  Extracting answers from ${sourceFile} ... `);
    const m = extractAnswersForFile(sourceFile);
    perFileAnswers.set(sourceFile, m);
    console.log(`${m.size} answers found`);
  }
  return perFileAnswers.get(sourceFile)!;
}

// ─── Also extract hardened-practice options for missing_options rows ──────────

const hardenedOptCache = new Map<string, Map<number, RawOptions>>();

function getHardenedOptions(sourceFile: string): Map<number, RawOptions> {
  if (hardenedOptCache.has(sourceFile)) return hardenedOptCache.get(sourceFile)!;

  const pdfPath = path.join(EXTRACT_DIR, sourceFile);
  const raw = fs.existsSync(pdfPath) ? extractPdfText(pdfPath) : "";
  const text = raw ? cleanText(raw) : "";
  const optMap = new Map<number, RawOptions>();

  if (!text) { hardenedOptCache.set(sourceFile, optMap); return optMap; }

  const { questionPaper } = splitSections(text);

  // Split by Q markers
  const Q_RE = /^Q(\d{1,2})\.\s*$/gm;
  const qMarkers: Array<{ qNum: number; idx: number }> = [];
  for (const m of questionPaper.matchAll(Q_RE)) {
    qMarkers.push({ qNum: parseInt(m[1], 10), idx: m.index! });
  }

  for (let i = 0; i < qMarkers.length; i++) {
    const start = qMarkers[i].idx;
    const end = qMarkers[i + 1]?.idx ?? questionPaper.length;
    const block = questionPaper.slice(start, end).trim();
    const opts = extractHardenedOptions(block);
    if (opts) optMap.set(qMarkers[i].qNum, opts);
  }

  hardenedOptCache.set(sourceFile, optMap);
  return optMap;
}

// ─── Apply recovery ───────────────────────────────────────────────────────────

type RecoveryRecord = {
  question_id: string;
  source_file: string;
  q_num: number;
  varc_type: string;
  answer: string;
  confidence: string;
  source: string;
  previously_visible: boolean;
  now_visible: boolean;
  note: string;
};

const recovered: RecoveryRecord[] = [];
const stillMissing: VarcRow[] = [];

console.log(`\nProcessing hidden rows...`);

for (const row of bank) {
  if (row.student_visible) continue; // already visible

  const qNum = row.source_question_number;
  const isTita = isTitaType(row.varc_type);
  let updated = false;

  // ── Case 1: missing_answer – try to find the answer ──
  if (row.parse_status === "missing_answer" || (!row.correct_answer && !row.student_visible)) {
    const fileMap = getFileAnswers(row.source_file);
    const entry = fileMap.get(qNum);

    if (entry) {
      const normalizedAnswer = normalizeAnswer(entry.answer, isTita);

      if (normalizedAnswer) {
        if (entry.confidence === "high") {
          row.correct_answer = normalizedAnswer;
          row.answer_source = entry.source;
          row.answer_extraction_confidence = "high";
          if (entry.solution && !row.detailed_solution_markdown) {
            row.detailed_solution_markdown = entry.solution;
          }
          if (entry.difficulty && !row.difficulty) {
            row.difficulty = entry.difficulty;
          }
          // Update parse_status
          const hasPassage = row.passage_text_markdown.trim().length > 0;
          const hasQuestion = row.question_text_markdown.trim().length > 0;
          const hasOptions = row.option_a_markdown.trim().length > 0;
          if (row.varc_type === "RC") {
            if (hasPassage && hasQuestion && hasOptions) row.parse_status = "complete_rc_set";
          } else {
            if (hasQuestion) row.parse_status = "complete_va_question";
          }
          row.student_visible = hasQuestion && !!normalizedAnswer;
          updated = true;
          recovered.push({
            question_id: row.question_id, source_file: row.source_file, q_num: qNum,
            varc_type: row.varc_type, answer: normalizedAnswer, confidence: "high",
            source: entry.source, previously_visible: false, now_visible: row.student_visible, note: "",
          });
        } else {
          // Medium confidence: store as candidate
          row.correct_answer_candidate = normalizedAnswer;
          row.answer_extraction_confidence = "medium";
          recovered.push({
            question_id: row.question_id, source_file: row.source_file, q_num: qNum,
            varc_type: row.varc_type, answer: normalizedAnswer, confidence: "medium",
            source: entry.source, previously_visible: false, now_visible: false, note: "medium confidence - not made visible",
          });
          updated = true;
        }
      }
    }
  }

  // ── Case 2: missing_options – try to recover options from hardened format ──
  if (row.parse_status === "missing_options" && !row.option_a_markdown) {
    const optMap = getHardenedOptions(row.source_file);
    const opts = optMap.get(qNum);

    if (opts && opts.a) {
      row.option_a_markdown = opts.a;
      row.option_b_markdown = opts.b;
      row.option_c_markdown = opts.c;
      row.option_d_markdown = opts.d;

      // Now check if answer is also there
      if (!row.correct_answer) {
        const fileMap = getFileAnswers(row.source_file);
        const entry = fileMap.get(qNum);
        if (entry) {
          const normalizedAnswer = normalizeAnswer(entry.answer, isTita);
          if (normalizedAnswer && entry.confidence === "high") {
            row.correct_answer = normalizedAnswer;
            row.answer_source = entry.source;
            row.answer_extraction_confidence = "high";
            if (entry.solution && !row.detailed_solution_markdown) {
              row.detailed_solution_markdown = entry.solution;
            }
            row.parse_status = "complete_rc_set";
            updated = true;
            recovered.push({
              question_id: row.question_id, source_file: row.source_file, q_num: qNum,
              varc_type: row.varc_type, answer: normalizedAnswer, confidence: "high",
              source: "options+answer recovered",
              previously_visible: false, now_visible: true, note: "options also recovered",
            });
          }
        }
      }

      const hasQuestion = row.question_text_markdown.trim().length > 0;
      const hasOptions = row.option_a_markdown.trim().length > 0;
      const hasAnswer = row.correct_answer.trim().length > 0;
      row.student_visible = hasQuestion && hasOptions && hasAnswer;
    }
  }

  if (!updated && !row.student_visible) {
    stillMissing.push(row);
  }
}

// ─── Recompute difficulty / practice level for recovered rows ──────────────

function normDiff(raw: string): string {
  const t = raw.toLowerCase();
  if (/very\s*hard|very\s*difficult/.test(t)) return "Very Hard";
  if (/medium[-\s]hard/.test(t)) return "Medium-Hard";
  if (/hard|difficult/.test(t)) return "Hard";
  if (/medium|moderate/.test(t)) return "Medium";
  if (/easy|basic/.test(t)) return "Easy";
  return "";
}

function toPracticeLevel(diff: string): "Beginner" | "Intermediate" | "Advanced" {
  const d = diff.toLowerCase();
  if (/very\s*hard/.test(d)) return "Advanced";
  if (/hard/.test(d) || /medium[-\s]hard/.test(d) || /medium/.test(d)) return "Intermediate";
  if (/easy/.test(d)) return "Beginner";
  return "Intermediate";
}

for (const row of bank) {
  if (row.difficulty && !row.difficulty.match(/^(Very Hard|Hard|Medium[-\s]?Hard|Medium|Easy)$/i)) {
    const fixed = normDiff(row.difficulty);
    if (fixed) row.difficulty = fixed;
  }
  if (row.difficulty) {
    row.practice_level = toPracticeLevel(row.difficulty);
  }
}

// ─── Sort and write ───────────────────────────────────────────────────────────

bank.sort((a, b) => a.source_set_number - b.source_set_number || a.source_question_number - b.source_question_number);

const backup = BANK_PATH.replace(/\.json$/, `.pre-recovery.${Date.now()}.json`);
fs.copyFileSync(BANK_PATH, backup);
console.log(`\nBackup: ${path.relative(CWD, backup)}`);

fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2), "utf8");

// ─── Stats ────────────────────────────────────────────────────────────────────

const visibleAfter = bank.filter(r => r.student_visible).length;
const hiddenAfter = bank.filter(r => !r.student_visible).length;
const recoveredHigh = recovered.filter(r => r.confidence === "high" && r.now_visible).length;
const recoveredMedium = recovered.filter(r => r.confidence === "medium").length;

// ─── Report ───────────────────────────────────────────────────────────────────

const filesWithFailures = [...new Set(stillMissing.map(r => r.source_file))];
const failCounts = Object.fromEntries(
  filesWithFailures.map(f => [f, stillMissing.filter(r => r.source_file === f).length])
);

const reportLines: string[] = [];
reportLines.push(`# CAT VARC Answer Recovery Report`);
reportLines.push(``);
reportLines.push(`Generated: ${new Date().toISOString()}`);
reportLines.push(``);
reportLines.push(`## Summary`);
reportLines.push(``);
reportLines.push(`| Metric | Count |`);
reportLines.push(`| --- | ---: |`);
reportLines.push(`| Total rows in bank | ${bank.length} |`);
reportLines.push(`| Visible before recovery | ${visibleBefore} |`);
reportLines.push(`| Hidden before recovery | ${hiddenBefore} |`);
reportLines.push(`| Missing answer (hidden) before | ${missingAnsRows.length} |`);
reportLines.push(`| Missing options (hidden) before | ${missingOptRows.length} |`);
reportLines.push(`| Answers recovered (high confidence, now visible) | ${recoveredHigh} |`);
reportLines.push(`| Answers recovered (medium confidence, not visible) | ${recoveredMedium} |`);
reportLines.push(`| Rows still missing answer | ${stillMissing.length} |`);
reportLines.push(`| Visible after recovery | ${visibleAfter} |`);
reportLines.push(`| Hidden after recovery | ${hiddenAfter} |`);
reportLines.push(``);
reportLines.push(`## Recovered Answers (High Confidence, First 30)`);
reportLines.push(``);
const highConf = recovered.filter(r => r.confidence === "high").slice(0, 30);
if (highConf.length) {
  reportLines.push(`| Question ID | File | Q# | Type | Answer | Source | Visible |`);
  reportLines.push(`| --- | --- | --- | --- | --- | --- | --- |`);
  for (const r of highConf) {
    reportLines.push(`| \`${r.question_id}\` | ${r.source_file} | ${r.q_num} | ${r.varc_type} | \`${r.answer}\` | ${r.source} | ${r.now_visible} |`);
  }
} else {
  reportLines.push(`- None`);
}
reportLines.push(``);
reportLines.push(`## Still Unresolved (First 30)`);
reportLines.push(``);
const unresolved = stillMissing.slice(0, 30);
if (unresolved.length) {
  reportLines.push(`| Question ID | File | Q# | Type | Status | Warnings |`);
  reportLines.push(`| --- | --- | --- | --- | --- | --- |`);
  for (const r of unresolved) {
    reportLines.push(`| \`${r.question_id}\` | ${r.source_file} | ${r.source_question_number} | ${r.varc_type} | ${r.parse_status} | ${r.parse_warnings.join("; ")} |`);
  }
} else {
  reportLines.push(`- None – all hidden rows resolved!`);
}
reportLines.push(``);
reportLines.push(`## Source Files with Most Failures`);
reportLines.push(``);
for (const [f, cnt] of Object.entries(failCounts).sort((a, b) => (b[1] as number) - (a[1] as number))) {
  reportLines.push(`- **${f}**: ${cnt} unresolved`);
}
reportLines.push(``);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, reportLines.join("\n"), "utf8");

// ─── CSV ──────────────────────────────────────────────────────────────────────

const csvHeaders = ["question_id", "source_file", "q_num", "varc_type", "answer", "confidence", "source", "now_visible", "note"];
const csvRows = recovered.map(r => [
  r.question_id, r.source_file, String(r.q_num), r.varc_type,
  r.answer, r.confidence, r.source, String(r.now_visible), r.note,
].map(v => /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v).join(","));
fs.writeFileSync(CSV_PATH, [csvHeaders.join(","), ...csvRows].join("\n"), "utf8");

// ─── Console summary ──────────────────────────────────────────────────────────

console.log(`\n=== CAT VARC Answer Recovery Summary ===`);
console.log(`Visible before:       ${visibleBefore}`);
console.log(`Visible after:        ${visibleAfter}  (+${visibleAfter - visibleBefore})`);
console.log(`Hidden before:        ${hiddenBefore}`);
console.log(`Hidden after:         ${hiddenAfter}  (-${hiddenBefore - hiddenAfter})`);
console.log(`Recovered (high):     ${recoveredHigh}`);
console.log(`Recovered (medium):   ${recoveredMedium}`);
console.log(`Still missing:        ${stillMissing.length}`);
console.log(`Report:               ${path.relative(CWD, REPORT_PATH)}`);
console.log(`CSV:                  ${path.relative(CWD, CSV_PATH)}`);

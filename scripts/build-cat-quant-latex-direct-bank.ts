import fs from "node:fs";
import path from "node:path";

type PracticeLevel = "Beginner" | "Intermediate" | "Advanced";
type ParseStatus = "full_parse" | "raw_block_render";

type LatexSourceQuestion = {
  question_id: string;
  section: "QA";
  exam: "CAT";
  source_tex_file: string;
  source_question_number: number;
  topic: string;
  subtopic: string;
  difficulty: string;
  practice_level: PracticeLevel;
  question_type: string;
  question_text_markdown: string;
  option_a_markdown: string;
  option_b_markdown: string;
  option_c_markdown: string;
  option_d_markdown: string;
  correct_answer_markdown: string;
  detailed_solution_markdown: string;
  raw_latex_block: string;
  parse_status: ParseStatus;
  display_source: "latex_source_direct";
  student_visible: true;
  plain_preview: string;
  parse_warnings: string[];
};

type QuestionChunk = {
  number: number;
  marker: string;
  text: string;
  raw: string;
};

const latexDirRelative = "content/cat/practice/latex_sources";
const outputRelative = "content/cat/practice/generated/cat_quant_latex_source_practice.json";
const reportRelative = "reports/local_imports/CAT_QUANT_LATEX_DIRECT_BANK_REPORT.md";
const csvRelative = "content/cat/practice/reports/cat_quant_latex_direct_bank.csv";

const latexDir = path.join(process.cwd(), latexDirRelative);
const outputPath = path.join(process.cwd(), outputRelative);
const reportPath = path.join(process.cwd(), reportRelative);
const csvPath = path.join(process.cwd(), csvRelative);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.mkdirSync(path.dirname(csvPath), { recursive: true });

const texFiles = fs.existsSync(latexDir) ? walk(latexDir).filter((file) => file.toLowerCase().endsWith(".tex")) : [];
const rows: LatexSourceQuestion[] = [];
const warnings: string[] = [];
const seenSourceNumbers = new Set<string>();

for (const file of texFiles) {
  const parsed = parseLatexFile(file);
  for (const row of parsed) {
    const conflictKey = `${row.source_tex_file}::${row.source_question_number}`;
    if (seenSourceNumbers.has(conflictKey)) {
      warnings.push(`Duplicate source-file/question-number skipped: ${conflictKey}`);
      continue;
    }
    seenSourceNumbers.add(conflictKey);
    rows.push(row);
  }
}

rows.sort((a, b) => a.source_tex_file.localeCompare(b.source_tex_file) || a.source_question_number - b.source_question_number);

fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), "utf8");
fs.writeFileSync(reportPath, buildReport(rows, texFiles, warnings), "utf8");
fs.writeFileSync(csvPath, toCsv(rows), "utf8");

console.log(`TeX files found: ${texFiles.length}`);
console.log(`LaTeX questions parsed: ${rows.length}`);
console.log(`Rows written: ${rows.length}`);
console.log(`Beginner: ${countBy(rows, (row) => row.practice_level === "Beginner")}`);
console.log(`Intermediate: ${countBy(rows, (row) => row.practice_level === "Intermediate")}`);
console.log(`Advanced: ${countBy(rows, (row) => row.practice_level === "Advanced")}`);
console.log(`Raw fallback: ${countBy(rows, (row) => row.parse_status === "raw_block_render")}`);
console.log(`Missing options: ${missingOptionCount(rows)}`);
console.log(`Missing solutions: ${countBy(rows, (row) => !row.detailed_solution_markdown.trim())}`);
console.log(`Output: ${outputRelative}`);
console.log(`Report: ${reportRelative}`);
console.log(`CSV: ${csvRelative}`);

function parseLatexFile(file: string): LatexSourceQuestion[] {
  const raw = fs.readFileSync(file, "utf8");
  const relativeFile = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const sourceSlug = sourceFileSlug(file);
  const documentBody = stripDocumentWrapper(raw);
  const questionPaper = sectionBetween(documentBody, /\\section\*?\{[^}]*Question Paper[^}]*\}/i, [/\\section\*?\{[^}]*Answer Key[^}]*\}/i, /\\section\*?\{[^}]*Detailed Solutions[^}]*\}/i, /\\section\*?\{[^}]*Topic-Wise Distribution[^}]*\}/i]) ?? documentBody;
  const solutionBody = sectionBetween(documentBody, /\\section\*?\{[^}]*Detailed Solutions[^}]*\}/i, [/\\section\*?\{[^}]*Topic-Wise Distribution[^}]*\}/i, /\\section\*?\{[^}]*Quality Verification Summary[^}]*\}/i]) ?? "";
  const answerBody = sectionBetween(documentBody, /\\section\*?\{[^}]*Answer Key[^}]*\}/i, [/\\section\*?\{[^}]*Detailed Solutions[^}]*\}/i, /\\section\*?\{[^}]*Topic-Wise Distribution[^}]*\}/i]) ?? "";
  const questionChunks = splitQuestionChunks(questionPaper);
  const solutionChunks = splitSolutionChunks(solutionBody);
  const answerMap = parseAnswerKey(answerBody);

  return questionChunks.map((chunk, index) => {
    const questionNumber = chunk.number || index + 1;
    const meta = extractQuestionMeta(chunk.raw);
    const options = extractOptions(chunk.text);
    const questionText = removeOptionBlock(chunk.text).trim();
    const solution = solutionChunks.get(questionNumber) ?? "";
    const correctAnswer = extractCorrectAnswer(solution) || answerMap.get(questionNumber) || "";
    const missingOptions = meta.questionType === "MCQ" && ![options.a, options.b, options.c, options.d].every(Boolean);
    const parseWarnings = [
      ...(!questionText ? ["missing question text after split"] : []),
      ...(missingOptions ? ["missing one or more MCQ options"] : []),
      ...(!solution ? ["missing detailed solution"] : []),
    ];
    const parseStatus: ParseStatus = questionText && !missingOptions ? "full_parse" : "raw_block_render";
    const rawBlock = [chunk.marker, chunk.text, solution ? `\n\n% Detailed Solution\n${solution}` : ""].filter(Boolean).join("\n").trim();
    const fullRawMarkdown = latexToMarkdown(rawBlock);

    return {
      question_id: `LATEX_CAT_QUANT_${sourceSlug}_Q${String(questionNumber).padStart(3, "0")}`,
      section: "QA",
      exam: "CAT",
      source_tex_file: relativeFile,
      source_question_number: questionNumber,
      topic: meta.topic,
      subtopic: meta.subtopic,
      difficulty: meta.difficulty,
      practice_level: assignPracticeLevel(meta.difficulty),
      question_type: meta.questionType || (options.a || options.b ? "MCQ" : "TITA"),
      question_text_markdown: parseStatus === "raw_block_render" ? fullRawMarkdown : latexToMarkdown(questionText),
      option_a_markdown: options.a ? latexToMarkdown(options.a) : "",
      option_b_markdown: options.b ? latexToMarkdown(options.b) : "",
      option_c_markdown: options.c ? latexToMarkdown(options.c) : "",
      option_d_markdown: options.d ? latexToMarkdown(options.d) : "",
      correct_answer_markdown: correctAnswer ? latexToMarkdown(correctAnswer) : "",
      detailed_solution_markdown: solution ? latexToMarkdown(solution) : "",
      raw_latex_block: rawBlock,
      parse_status: parseStatus,
      display_source: "latex_source_direct",
      student_visible: true,
      plain_preview: makePlainPreview(questionText || rawBlock),
      parse_warnings: parseWarnings,
    };
  });
}

function stripDocumentWrapper(input: string) {
  return input
    .replace(/^[\s\S]*?\\begin\{document\}/i, "")
    .replace(/\\end\{document\}[\s\S]*$/i, "")
    .replace(/\\maketitle/g, "")
    .replace(/\\tableofcontents/g, "")
    .replace(/\\newpage|\\pagebreak/g, "\n")
    .replace(/\\hrule/g, "\n")
    .replace(/\\vspace\*?\{[^}]*\}/g, "\n")
    .replace(/\\titleformat\{[\s\S]*?\}\{[\s\S]*?\}\{[\s\S]*?\}\{[\s\S]*?\}\{[\s\S]*?\}/g, "")
    .trim();
}

function sectionBetween(input: string, startPattern: RegExp, endPatterns: RegExp[]) {
  const startMatch = startPattern.exec(input);
  if (!startMatch || startMatch.index === undefined) return null;
  const start = startMatch.index + startMatch[0].length;
  const rest = input.slice(start);
  const ends = endPatterns
    .map((pattern) => {
      const match = pattern.exec(rest);
      return match?.index ?? -1;
    })
    .filter((index) => index >= 0);
  const end = ends.length ? Math.min(...ends) : rest.length;
  return rest.slice(0, end).trim();
}

function splitQuestionChunks(input: string): QuestionChunk[] {
  const markers = Array.from(input.matchAll(/(?:\\qhead\{(\d+)\}\{[^}]*\}\{[^}]*\}\{[^}]*\}|\\(?:sub)*section\*?\{(?:Question|Q)\s*(\d+)[^}]*\}|\\textbf\{\s*(?:Q|Question)\s*(\d+)\s*\.?(?:[^}]*)\})/gim));
  return markers.map((match, index) => {
    const start = match.index ?? 0;
    const contentStart = start + match[0].length;
    const end = markers[index + 1]?.index ?? input.length;
    return {
      number: Number(match[1] || match[2] || match[3] || index + 1),
      marker: match[0],
      text: input.slice(contentStart, end).trim(),
      raw: input.slice(start, end).trim(),
    };
  });
}

function splitSolutionChunks(input: string) {
  const chunks = new Map<number, string>();
  if (!input.trim()) return chunks;
  const markers = Array.from(input.matchAll(/(?:\\shead\{(\d+)\}|\\(?:sub)*section\*?\{(?:Solution|Sol\.?|Q)\s*(\d+)[^}]*\}|\\textbf\{\s*(?:Solution|Sol\.?|Q)\s*(\d+)\s*\.?(?:[^}]*)\})/gim));
  for (const [index, match] of markers.entries()) {
    const start = match.index ?? 0;
    const contentStart = start + match[0].length;
    const end = markers[index + 1]?.index ?? input.length;
    chunks.set(Number(match[1] || match[2] || match[3] || index + 1), input.slice(contentStart, end).trim());
  }
  return chunks;
}

function extractQuestionMeta(raw: string) {
  const qhead = /\\qhead\{\d+\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}/i.exec(raw);
  const bracket = qhead ? `${qhead[1]} -- ${qhead[2]}, ${qhead[3]}` : (/\\textit\{\s*\[([\s\S]*?)\]\s*\}/.exec(raw)?.[1] ?? /\[([^\]]*(?:MCQ|TITA|Easy|Medium|Hard)[^\]]*)\]/i.exec(raw)?.[1] ?? "");
  const parts = bracket.split(/,\s*/).map((part) => texPlain(part).trim()).filter(Boolean);
  const topicPart = parts[0] ?? "CAT Quant";
  const [topicRaw, subtopicRaw] = topicPart.split(/\s+--\s+|\s+-\s+/);
  const difficulty = parts.find((part) => /easy|medium|hard/i.test(part)) ?? "Unmapped";
  const questionType = parts.find((part) => /\b(MCQ|TITA|MSQ|Descriptive)\b/i.test(part))?.toUpperCase() ?? "";
  return {
    topic: cleanLabel(topicRaw || "CAT Quant"),
    subtopic: cleanLabel(subtopicRaw || "Mixed"),
    difficulty: cleanLabel(difficulty),
    questionType: questionType || "TITA",
  };
}

function extractOptions(input: string) {
  const enumBlock = /\\begin\{enumerate\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{enumerate\}/i.exec(input)?.[1] ?? "";
  const source = enumBlock || input;
  const itemMatches = Array.from(source.matchAll(/\\item\s+/g));
  const items = itemMatches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = itemMatches[index + 1]?.index ?? source.length;
    return source.slice(start, end).trim();
  }).filter(Boolean);

  if (items.length >= 4) return { a: items[0], b: items[1], c: items[2], d: items[3] };

  const letterRegex = /(?:^|\n)\s*(?:\(([A-D])\)|([A-D])[).])\s*([\s\S]*?)(?=(?:\n\s*(?:\([A-D]\)|[A-D][).])\s)|$)/g;
  const found: string[] = [];
  for (const match of source.matchAll(letterRegex)) {
    const value = (match[3] ?? "").trim();
    if (value) found.push(value);
  }
  return { a: found[0] ?? "", b: found[1] ?? "", c: found[2] ?? "", d: found[3] ?? "" };
}

function removeOptionBlock(input: string) {
  return input
    .replace(/\\begin\{enumerate\}(?:\[[^\]]*\])?[\s\S]*?\\end\{enumerate\}/gi, "")
    .trim();
}

function parseAnswerKey(input: string) {
  const answers = new Map<number, string>();
  for (const line of input.split(/\n/)) {
    const cleaned = line.trim();
    const tableMatch = /^(\d+)\s*&[^&]*&\s*([^&\\]+(?:\$[^$]+\$)?[^&\\]*)/.exec(cleaned);
    if (tableMatch) answers.set(Number(tableMatch[1]), tableMatch[2].trim());
    const simpleMatch = /(?:Q|Question)\s*(\d+)\s*[:.-]\s*([^\n]+)/i.exec(cleaned);
    if (simpleMatch) answers.set(Number(simpleMatch[1]), simpleMatch[2].trim());
  }
  return answers;
}

function extractCorrectAnswer(solution: string) {
  const match = /\\textbf\{\s*(?:Answer|Encoded answer)\s*:?\s*([\s\S]*?)\}/i.exec(solution) ?? /(?:Answer|Encoded answer)\s*:?\s*([^\n]+)/i.exec(solution);
  return match?.[1]?.trim() ?? "";
}

function latexToMarkdown(input: string) {
  let value = stripLayoutWrappers(input);
  value = value
    .replace(/\\textbf\{([^{}]*)\}/g, "**$1**")
    .replace(/\\textit\{([^{}]*)\}/g, "*$1*")
    .replace(/\\emph\{([^{}]*)\}/g, "*$1*")
    .replace(/\\underline\{([^{}]*)\}/g, "$1")
    .replace(/\\section\*?\{([^{}]*)\}/g, "### $1")
    .replace(/\\subsection\*?\{([^{}]*)\}/g, "### $1")
    .replace(/\\subsubsection\*?\{([^{}]*)\}/g, "#### $1")
    .replace(/\\\[/g, "\n\n$$\n")
    .replace(/\\\]/g, "\n$$\n\n")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\begin\{(align\*?|aligned|cases|array|matrix|pmatrix|bmatrix)\}([\s\S]*?)\\end\{\1\}/g, (_match, env, body) => `\n\n$$\n\\begin{${env}}${body}\\end{${env}}\n$$\n\n`)
    .replace(/\\begin\{itemize\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{itemize\}/g, (_match, body) => itemizeToMarkdown(body))
    .replace(/\\begin\{enumerate\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{enumerate\}/g, (_match, body) => itemizeToMarkdown(body))
    .replace(/\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}/g, (_match, body) => `\n\n\`\`\`latex\n\\begin{tabular}${body}\\end{tabular}\n\`\`\`\n\n`)
    .replace(/\\rule\{([^{}]*)\}\{([^{}]*)\}/g, "____")
    .replace(/\\hline/g, "")
    .replace(/\\\\/g, "\n")
    .replace(/\\,/g, " ")
    .replace(/~?\\&/g, "&")
    .replace(/\\%/g, "%")
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return value;
}

function stripLayoutWrappers(input: string) {
  return input
    .replace(/\\begin\{(?:center|flushleft|flushright|tcolorbox|minipage|multicols)\}(?:\[[^\]]*\])?(?:\{[^}]*\})?/gi, "\n")
    .replace(/\\end\{(?:center|flushleft|flushright|tcolorbox|minipage|multicols)\}/gi, "\n")
    .replace(/\\vspace\*?\{[^}]*\}/g, "\n")
    .replace(/\\hspace\*?\{[^}]*\}/g, " ")
    .replace(/\\smallskip|\\medskip|\\bigskip|\\noindent/g, "\n")
    .replace(/\\newpage|\\pagebreak/g, "\n");
}

function itemizeToMarkdown(body: string) {
  const itemMatches = Array.from(body.matchAll(/\\item\s+/g));
  if (!itemMatches.length) return body;
  return "\n" + itemMatches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = itemMatches[index + 1]?.index ?? body.length;
    return `- ${body.slice(start, end).trim()}`;
  }).join("\n") + "\n";
}

function texPlain(input: string) {
  return input
    .replace(/\\&/g, "&")
    .replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^{}]*)\})?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makePlainPreview(input: string) {
  return texPlain(input).replace(/\s+/g, " ").slice(0, 260);
}

function cleanLabel(input: string) {
  return texPlain(input).replace(/^[-–—]+|[-–—]+$/g, "").trim() || "Unmapped";
}

function assignPracticeLevel(difficulty: string): PracticeLevel {
  if (/very\s*hard/i.test(difficulty)) return "Advanced";
  if (/hard/i.test(difficulty)) return "Intermediate";
  return "Beginner";
}

function sourceFileSlug(file: string) {
  const basename = path.basename(file, path.extname(file));
  const normalized = basename
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return `${normalized}_${shortHash(basename)}`;
}

function shortHash(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(index) | 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 5);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function buildReport(rows: LatexSourceQuestion[], texFiles: string[], parseWarnings: string[]) {
  const statusCounts = countValues(rows.map((row) => row.parse_status));
  const firstIds = rows.slice(0, 20).map((row, index) => `${index + 1}. \`${row.question_id}\` (${row.source_tex_file} Q${row.source_question_number})`).join("\n");
  return `# CAT Quant LaTeX Direct Bank Report

Generated: ${new Date().toISOString()}

Source folder: \`${latexDirRelative}\`

Output: \`${outputRelative}\`

## Summary

| Metric | Count |
| --- | ---: |
| TeX files found | ${texFiles.length} |
| LaTeX questions parsed | ${rows.length} |
| Rows written to latex-source bank | ${rows.length} |
| Beginner count | ${countBy(rows, (row) => row.practice_level === "Beginner")} |
| Intermediate count | ${countBy(rows, (row) => row.practice_level === "Intermediate")} |
| Advanced count | ${countBy(rows, (row) => row.practice_level === "Advanced")} |
| Full-parse count | ${statusCounts.full_parse ?? 0} |
| Raw-block fallback count | ${statusCounts.raw_block_render ?? 0} |
| Missing option count | ${missingOptionCount(rows)} |
| Missing solution count | ${countBy(rows, (row) => !row.detailed_solution_markdown.trim())} |

## First 20 Generated Question IDs

${firstIds || "- None"}

## Parse Warnings

${parseWarnings.length ? parseWarnings.map((warning) => `- ${warning}`).join("\n") : "- None"}

## Row Warnings

${rows.filter((row) => row.parse_warnings.length).slice(0, 50).map((row) => `- \`${row.question_id}\`: ${row.parse_warnings.join("; ")}`).join("\n") || "- None"}
`;
}

function toCsv(rows: LatexSourceQuestion[]) {
  const headers = ["question_id", "source_tex_file", "source_question_number", "topic", "subtopic", "difficulty", "practice_level", "question_type", "parse_status", "missing_options", "missing_solution", "student_visible"];
  return [headers.join(","), ...rows.map((row) => [
    row.question_id,
    row.source_tex_file,
    String(row.source_question_number),
    row.topic,
    row.subtopic,
    row.difficulty,
    row.practice_level,
    row.question_type,
    row.parse_status,
    String(row.question_type === "MCQ" && ![row.option_a_markdown, row.option_b_markdown, row.option_c_markdown, row.option_d_markdown].every(Boolean)),
    String(!row.detailed_solution_markdown.trim()),
    String(row.student_visible),
  ].map(csvCell).join(","))].join("\n");
}

function csvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function countBy<T>(items: T[], predicate: (item: T) => boolean) {
  return items.filter(predicate).length;
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((record, value) => {
    record[value] = (record[value] ?? 0) + 1;
    return record;
  }, {});
}

function missingOptionCount(rows: LatexSourceQuestion[]) {
  return countBy(rows, (row) => row.question_type === "MCQ" && ![row.option_a_markdown, row.option_b_markdown, row.option_c_markdown, row.option_d_markdown].every(Boolean));
}
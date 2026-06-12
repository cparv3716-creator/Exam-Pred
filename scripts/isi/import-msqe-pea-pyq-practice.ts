import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type Paper = "PEA";
type AccessTier = "public" | "free_login" | "premium";
type SolutionStatus = "missing" | "draft" | "verified" | "disputed";

type Option = { label: string; text: string; latex?: string | null };

type PyqQuestion = {
  id: string;
  exam: "ISI";
  program: "MSQE";
  paper: Paper;
  year: number;
  questionNumber: number;
  questionText: string;
  questionLatex: string;
  options: Option[];
  answer: string;
  solution: string;
  topic: string;
  subtopic: string;
  concept: string;
  difficulty: string;
  questionType: "mcq" | "descriptive" | "multipart";
  source: string;
  solutionSource: string;
  solutionStatus: SolutionStatus;
  needsReview: boolean;
  reviewNotes: string;
};

type PracticeSet = {
  exam: "ISI";
  program: "MSQE";
  paper: Paper;
  year: number;
  title: string;
  questionCount: number;
  status: "ready" | "needs_review" | "pending";
  accessTier: AccessTier;
  questionsPath: string;
  questionPdfPath: string | null;
  questionTexPath: string;
  solutionAvailability: "in_app";
  sourceNote: string;
  branding: string;
  needsReviewCount: number;
  importWarnings: string[];
};

const ROOT = process.cwd();
const YEARS = [2022, 2023, 2024, 2025, 2026];
const paper: Paper = "PEA";
const sourceDir = path.join(ROOT, "public", "resources", "isi", "msqe", "solutions", "pea");
const outputContentRoot = path.join(ROOT, "content", "isi", "msqe", "pyqs", "pea");
const publicPyqRoot = path.join(ROOT, "public", "resources", "isi", "msqe", "pyqs", "pea");
const manifestPath = path.join(ROOT, "content", "isi", "msqe", "pyqs", "practice_manifest.json");
const reportPath = path.join(ROOT, "reports", "isi_msqe_pea_pyq_practice_import_report.md");
const logoPath = findLogo();
const pdflatexAvailable = commandAvailable("pdflatex");

const allReports: string[] = [];
const practiceSets: PracticeSet[] = [];
let totalQuestions = 0;
let totalNeedsReview = 0;
let pdfGeneratedCount = 0;
let pdfSkippedCount = 0;

for (const year of YEARS) {
  const sourceTex = path.join(sourceDir, String(year), `ISI_MSQE_PEA_${year}_Solutions.tex`);
  const yearOutputDir = path.join(outputContentRoot, String(year));
  const yearPublicDir = path.join(publicPyqRoot, String(year));
  fs.mkdirSync(yearOutputDir, { recursive: true });
  fs.mkdirSync(yearPublicDir, { recursive: true });

  const warnings: string[] = [];
  if (!fs.existsSync(sourceTex)) {
    warnings.push(`Source TeX missing: ${sourceTex}`);
    practiceSets.push(createPracticeSet(year, 0, 0, warnings, false));
    continue;
  }

  const tex = fs.readFileSync(sourceTex, "utf8").replace(/^\uFEFF/, "");
  const questions = parseQuestions(tex, year, warnings);
  totalQuestions += questions.length;
  totalNeedsReview += questions.filter((question) => question.needsReview).length;

  const questionsPath = path.join(yearOutputDir, "questions.json");
  writeJson(questionsPath, questions);

  const bookletTexPath = path.join(yearPublicDir, `ISI_MSQE_PEA_${year}_Questions_Statstrive.tex`);
  fs.writeFileSync(bookletTexPath, buildQuestionOnlyBooklet(year, questions), "utf8");

  let pdfCreated = false;
  if (pdflatexAvailable) {
    pdfCreated = compilePdf(yearPublicDir, path.basename(bookletTexPath), warnings);
    if (pdfCreated) pdfGeneratedCount += 1;
    else pdfSkippedCount += 1;
  } else {
    pdfSkippedCount += 1;
    warnings.push("PDF generation skipped because pdflatex was unavailable.");
  }

  practiceSets.push(createPracticeSet(year, questions.length, questions.filter((question) => question.needsReview).length, warnings, pdfCreated));

  allReports.push(`## ${year}`);
  allReports.push(`- Parsed questions: ${questions.length}`);
  allReports.push(`- Needs review: ${questions.filter((question) => question.needsReview).length}`);
  allReports.push(`- Question-only TeX: ${toPublicPath(bookletTexPath)}`);
  allReports.push(`- Question-only PDF: ${pdfCreated ? toPublicPath(bookletTexPath.replace(/\.tex$/, ".pdf")) : "not generated"}`);
  if (warnings.length) allReports.push(`- Warnings: ${warnings.join("; ")}`);
  allReports.push("");
}

writeJson(manifestPath, practiceSets.sort((a, b) => b.year - a.year));
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, buildReport(), "utf8");
console.log(JSON.stringify({ years: YEARS.length, totalQuestions, totalNeedsReview, pdfGeneratedCount, pdfSkippedCount, reportPath }, null, 2));

function parseQuestions(tex: string, year: number, yearWarnings: string[]): PyqQuestion[] {
  const markers = Array.from(tex.matchAll(/\\section\*\{Question\s+(\d+)\}/g));
  if (!markers.length) {
    yearWarnings.push("No question section markers found.");
    return [];
  }

  const questions: PyqQuestion[] = [];
  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const qn = Number(marker[1]);
    const start = (marker.index ?? 0) + marker[0].length;
    const end = markers[index + 1]?.index ?? findEndOfQuestions(tex, start);
    const block = tex.slice(start, end).trim();
    const warnings: string[] = [];

    const questionRaw = extractSubsection(block, "Question", ["Solution"]);
    const solutionRaw = extractSubsection(block, "Solution", ["Final Answer", "Common Trap / Note", "Common Trap", "Note"]);
    const answerRaw = extractSubsection(block, "Final Answer", ["Common Trap / Note", "Common Trap", "Note"]);
    const noteRaw = extractAnySubsection(block, ["Common Trap / Note", "Common Trap", "Note"], []);
    const metadata = extractMetadata(block);

    if (!questionRaw) warnings.push("Question subsection missing or empty.");
    if (!solutionRaw) warnings.push("Solution subsection missing or empty.");
    if (!answerRaw) warnings.push("Final answer subsection missing or empty.");

    const parsedOptions = parseOptions(questionRaw);
    const questionWithoutOptions = removeEnumerate(questionRaw).trim();
    if (!parsedOptions.length) warnings.push("No MCQ options parsed.");

    const answer = extractAnswer(answerRaw);
    if (!answer) warnings.push("Final answer option not clear.");

    const status = metadata.status.toLowerCase();
    const solutionStatus: SolutionStatus = !solutionRaw ? "missing" : status.includes("verified") ? "verified" : status.includes("needs") ? "draft" : status.includes("draft") ? "draft" : "draft";
    const needsReview = warnings.length > 0 || solutionStatus !== "verified" || /needs\s+review/i.test(answerRaw + " " + metadata.status);

    questions.push({
      id: `isi-msqe-pea-${year}-q${String(qn).padStart(2, "0")}`,
      exam: "ISI",
      program: "MSQE",
      paper,
      year,
      questionNumber: qn,
      questionText: toMarkdownish(questionWithoutOptions),
      questionLatex: questionRaw.trim(),
      options: parsedOptions,
      answer,
      solution: toMarkdownish(solutionRaw.trim()),
      topic: metadata.topic || "Unclassified",
      subtopic: metadata.subtopic || "Unclassified",
      concept: metadata.concept || metadata.subtopic || "Unclassified",
      difficulty: metadata.difficulty || "Unclassified",
      questionType: parsedOptions.length ? "mcq" : "descriptive",
      source: "ISI MSQE PEA previous-year question",
      solutionSource: "Statstrive solution TeX",
      solutionStatus,
      needsReview,
      reviewNotes: [...warnings, noteRaw ? `Note: ${compactText(noteRaw)}` : ""].filter(Boolean).join(" | "),
    });
  }
  return questions.sort((a, b) => a.questionNumber - b.questionNumber);
}

function findEndOfQuestions(tex: string, start: number): number {
  const review = tex.indexOf("\\section*{Review Flags}", start);
  const endDocument = tex.indexOf("\\end{document}", start);
  return [review, endDocument, tex.length].filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? tex.length;
}

function extractSubsection(block: string, title: string, nextTitles: string[]): string {
  const titleMarker = `\\subsection*{${title}}`;
  const start = block.indexOf(titleMarker);
  if (start < 0) return "";
  const contentStart = start + titleMarker.length;
  const candidates = nextTitles
    .flatMap((next) => [`\\subsection*{${next}}`])
    .map((marker) => block.indexOf(marker, contentStart))
    .filter((position) => position >= 0);
  const end = candidates.length ? Math.min(...candidates) : block.length;
  return block.slice(contentStart, end).trim();
}

function extractAnySubsection(block: string, titles: string[], nextTitles: string[]): string {
  for (const title of titles) {
    const value = extractSubsection(block, title, nextTitles);
    if (value) return value;
  }
  return "";
}

function extractMetadata(block: string) {
  const topic = extractLabel(block, "Topic");
  const subtopicConcept = extractLabel(block, "Subtopic/Concept");
  const [subtopic, concept] = subtopicConcept.includes(",") ? subtopicConcept.split(/,(.+)/).map((item) => item.trim()).filter(Boolean) : [subtopicConcept, subtopicConcept];
  return {
    topic,
    subtopic: subtopic || "",
    concept: concept || subtopic || "",
    difficulty: extractLabel(block, "Difficulty"),
    status: extractLabel(block, "Status"),
  };
}

function extractLabel(block: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\\\textbf\\{${escaped}:\\}\\s*([\\s\\S]*?)(?=\\\\quad\\s*\\\\textbf\\{|\\\\\\\\|\\n|$)`);
  const match = block.match(regex);
  return match ? cleanInlineLatex(match[1]) : "";
}

function parseOptions(questionRaw: string): Option[] {
  const enumerateMatch = questionRaw.match(/\\begin\{enumerate\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{enumerate\}/);
  if (!enumerateMatch) return [];
  const body = enumerateMatch[1].trim();
  const parts = Array.from(body.matchAll(/\\item\s*([\s\S]*?)(?=\\item|$)/g)).map((match) => match[1].trim()).filter(Boolean);
  return parts.map((text, index) => ({ label: String.fromCharCode(65 + index), text: toMarkdownish(text), latex: text }));
}

function removeEnumerate(value: string): string {
  return value.replace(/\\begin\{enumerate\}(?:\[[^\]]*\])?[\s\S]*?\\end\{enumerate\}/g, "");
}

function extractAnswer(answerRaw: string): string {
  if (!answerRaw || /needs\s+review/i.test(answerRaw)) return "";
  const option = answerRaw.match(/Option\s+([A-D])/i)?.[1];
  if (option) return option.toUpperCase();
  const boxedText = answerRaw.match(/\\boxed\{([\s\S]*?)\}/)?.[1];
  return boxedText ? compactText(cleanInlineLatex(boxedText)) : "";
}

function toMarkdownish(value: string): string {
  return value
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\begin\{itemize\}/g, "")
    .replace(/\\end\{itemize\}/g, "")
    .replace(/\\item\s+/g, "- ")
    .trim();
}

function cleanInlineLatex(value: string): string {
  return value.replace(/\\+$/g, "").replace(/\s+/g, " ").trim();
}

function compactText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildQuestionOnlyBooklet(year: number, questions: PyqQuestion[]): string {
  const relLogo = "../../../../../../brand/statstrive-logo.png";
  const logoExists = logoPath !== null;
  const preamble = [
    "\\documentclass[11pt]{article}",
    "\\usepackage[a4paper,margin=0.85in]{geometry}",
    "\\usepackage{amsmath}",
    "\\usepackage{amssymb}",
    "\\usepackage{enumitem}",
    "\\usepackage{xcolor}",
    "\\usepackage{hyperref}",
    "\\usepackage{fancyhdr}",
    "\\usepackage{eso-pic}",
    logoExists ? "\\usepackage{graphicx}" : "",
    "\\definecolor{StatBlue}{HTML}{0752B8}",
    "\\definecolor{StatOrange}{HTML}{FF7A1A}",
    "\\hypersetup{colorlinks=true,linkcolor=StatBlue,urlcolor=StatBlue}",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\parskip}{6pt}",
    "\\pagestyle{fancy}",
    "\\fancyhf{}",
    `\\lhead{\\textbf{Statstrive}}`,
    `\\rhead{ISI MSQE PEA ${year}}`,
    "\\cfoot{\\thepage}",
    "\\AddToShipoutPictureBG{\\AtPageCenter{\\makebox(0,0){\\rotatebox{35}{\\textcolor[gray]{0.94}{\\fontsize{44}{44}\\selectfont STATSTRIVE}}}}}",
    "\\begin{document}",
    "\\begin{titlepage}",
    "\\centering",
    "\\vspace*{1.2cm}",
    logoExists ? `\\includegraphics[width=0.28\\textwidth]{${relLogo}}\\par\\vspace{0.8cm}` : "{\\Huge\\bfseries\\color{StatBlue} Statstrive\\par}\\vspace{0.8cm}",
    `{\\Huge\\bfseries ISI MSQE PEA ${year} PYQ Practice Booklet\\par}`,
    "\\vspace{0.4cm}",
    "{\\Large Organized by Statstrive for structured practice\\par}",
    "\\vfill",
    "\\begin{minipage}{0.86\\textwidth}",
    "\\small Previous-year questions are organized for practice and revision. Statstrive is not affiliated with ISI or any official examination body. This booklet contains questions only; solutions are available inside the Statstrive practice viewer.",
    "\\end{minipage}",
    "\\vfill",
    "{\\small Generated from structured Statstrive PYQ practice content.}",
    "\\end{titlepage}",
    "\\tableofcontents",
    "\\newpage",
  ].filter(Boolean).join("\n");

  const body = questions.map((question) => {
    const lines = [
      `\\section*{Question ${question.questionNumber}}`,
      `\\addcontentsline{toc}{section}{Question ${question.questionNumber}}`,
      question.questionLatex ? latexForBooklet(removeEnumerate(question.questionLatex).trim()) : latexForBooklet(question.questionText),
    ];
    if (question.options.length) {
      lines.push("\\begin{enumerate}[label=(\\Alph*)]");
      for (const option of question.options) lines.push(`\\item ${latexForBooklet(option.latex ?? option.text)}`);
      lines.push("\\end{enumerate}");
    }
    lines.push("\\vspace{0.35cm}", "\\hrule", "\\vspace{0.25cm}");
    return lines.join("\n");
  }).join("\n\n");

  return `${preamble}\n${body}\n\\end{document}\n`;
}


function latexForBooklet(value: string): string {
  return value
    .replace(/\\toprule/g, "\\hline")
    .replace(/\\midrule/g, "\\hline")
    .replace(/\\bottomrule/g, "\\hline");
}
function createPracticeSet(year: number, questionCount: number, needsReviewCount: number, warnings: string[], pdfCreated: boolean): PracticeSet {
  const texPublic = `/resources/isi/msqe/pyqs/pea/${year}/ISI_MSQE_PEA_${year}_Questions_Statstrive.tex`;
  const pdfPublic = `/resources/isi/msqe/pyqs/pea/${year}/ISI_MSQE_PEA_${year}_Questions_Statstrive.pdf`;
  return {
    exam: "ISI",
    program: "MSQE",
    paper,
    year,
    title: `ISI MSQE PEA ${year} PYQ Practice Set`,
    questionCount,
    status: questionCount > 0 ? "ready" : "pending",
    accessTier: "free_login",
    questionsPath: `content/isi/msqe/pyqs/pea/${year}/questions.json`,
    questionPdfPath: pdfCreated ? pdfPublic : null,
    questionTexPath: texPublic,
    solutionAvailability: "in_app",
    sourceNote: "Previous-year questions organized for practice. Solutions prepared by Statstrive.",
    branding: "Statstrive question-only booklet",
    needsReviewCount,
    importWarnings: warnings,
  };
}

function compilePdf(cwd: string, texFile: string, warnings: string[]): boolean {
  const args = ["-interaction=nonstopmode", "-halt-on-error", texFile];
  cleanupLatex(cwd, texFile);
  const first = spawnSync("pdflatex", args, { cwd, encoding: "utf8" });
  if (first.status !== 0) {
    warnings.push(`pdflatex failed for ${texFile}: ${first.stderr || first.stdout}`.slice(0, 600));
    return false;
  }
  spawnSync("pdflatex", args, { cwd, encoding: "utf8" });
  cleanupLatex(cwd, texFile);
  return fs.existsSync(path.join(cwd, texFile.replace(/\.tex$/, ".pdf")));
}

function cleanupLatex(cwd: string, texFile: string) {
  const base = texFile.replace(/\.tex$/, "");
  for (const ext of ["aux", "log", "out", "toc"]) {
    const file = path.join(cwd, `${base}.${ext}`);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

function commandAvailable(command: string): boolean {
  const result = spawnSync(command, ["--version"], { encoding: "utf8" });
  return result.status === 0;
}

function findLogo(): string | null {
  const candidates = [
    path.join(ROOT, "public", "brand", "statstrive-logo.png"),
    path.join(ROOT, "public", "statstrive-logo.png"),
    path.join(ROOT, "public", "logo.png"),
    path.join(ROOT, "app", "icon.png"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function toPublicPath(filePath: string): string {
  const publicRoot = path.join(ROOT, "public");
  return filePath.startsWith(publicRoot) ? `/${path.relative(publicRoot, filePath).replace(/\\/g, "/")}` : filePath;
}

function buildReport() {
  return [
    "# ISI MSQE PEA PYQ Practice Import Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Source years: ${YEARS.join(", ")}`,
    `TeX solution files parsed: ${YEARS.length}`,
    `Total questions imported: ${totalQuestions}`,
    `Needs review count: ${totalNeedsReview}`,
    `Question-only PDFs generated: ${pdfGeneratedCount}`,
    `PDF generation skipped/failed: ${pdfSkippedCount}`,
    `pdflatex available: ${pdflatexAvailable ? "yes" : "no"}`,
    `Logo used: ${logoPath ? toPublicPath(logoPath) : "text fallback"}`,
    "",
    ...allReports,
  ].join("\n");
}

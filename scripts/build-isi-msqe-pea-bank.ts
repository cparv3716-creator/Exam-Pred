import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type { IsiQuestion, IsiQuestionOption, IsiMsqePyqResource } from "@/types/isi";

type ParsedQuestion = IsiQuestion & {
  sourceTexPath: string;
  sourceQuestionTex: string;
  sourceSolutionTex: string;
  reviewReasons: string[];
};

const years = [2022, 2023, 2024, 2025, 2026];
const root = process.cwd();
const publicRoot = path.join(root, "public");
const solutionRoot = path.join(publicRoot, "resources", "isi", "msqe", "solutions", "pea");
const pyqRoot = path.join(publicRoot, "resources", "isi", "msqe", "pyqs", "pea");
const bankPath = path.join(root, "content", "isi", "msqe", "question_bank", "pea", "isi_msqe_pea_2022_2026_questions.json");
const pyqManifestPath = path.join(root, "content", "isi", "msqe", "pyqs", "resource_manifest.json");
const reportPath = path.join(root, "reports", "isi_msqe_pea_pyq_practice_import_report.md");

const generatedResources: IsiMsqePyqResource[] = [];
const allQuestions: ParsedQuestion[] = [];
const reportLines: string[] = [
  "# ISI MSQE PEA PYQ Practice Import Report",
  "",
  `Generated at: ${new Date().toISOString()}`,
  `Source years: ${years.join(", ")}`,
  `TeX solution files parsed: ${years.length}`,
  "",
];

for (const year of years) {
  const texPath = path.join(solutionRoot, String(year), `ISI_MSQE_PEA_${year}_Solutions.tex`);
  const tex = fs.readFileSync(texPath, "utf8").replace(/^\uFEFF/, "");
  const questions = parseSolutionTex(tex, year, texPath);
  allQuestions.push(...questions);

  const outDir = path.join(pyqRoot, String(year));
  fs.mkdirSync(outDir, { recursive: true });
  const texFileName = `ISI_MSQE_PEA_${year}_Questions_Statstrive.tex`;
  const pdfFileName = `ISI_MSQE_PEA_${year}_Questions_Statstrive.pdf`;
  const questionTexPath = path.join(outDir, texFileName);
  fs.writeFileSync(questionTexPath, buildQuestionOnlyTex(year, questions), "utf8");

  const pdfResult = spawnSync("pdflatex", ["-interaction=nonstopmode", "-halt-on-error", texFileName], {
    cwd: outDir,
    encoding: "utf8",
  });
  const pdfGenerated = pdfResult.status === 0 && fs.existsSync(path.join(outDir, pdfFileName));
  removeLatexAuxiliaries(outDir, `ISI_MSQE_PEA_${year}_Questions_Statstrive`);

  generatedResources.push({
    exam: "ISI",
    program: "MSQE",
    paper: "PEA",
    year,
    title: `ISI MSQE PEA ${year} Branded Question Paper`,
    resourceType: "question_paper",
    pdfPath: pdfGenerated ? `/resources/isi/msqe/pyqs/pea/${year}/${pdfFileName}` : null,
    textPath: null,
    texPath: `/resources/isi/msqe/pyqs/pea/${year}/${texFileName}`,
    status: questions.some((question) => question.needsReview) ? "needs_review" : "verified",
    sourceFile: path.relative(root, texPath).replaceAll("\\", "/"),
    note: "Regenerated from the local Statstrive solution TeX source. Items with incomplete original wording/options remain marked needsReview in the practice bank.",
  });

  reportLines.push(`## ${year}`);
  reportLines.push(`- Parsed questions: ${questions.length}`);
  reportLines.push(`- Needs review: ${questions.filter((question) => question.needsReview).length}`);
  reportLines.push(`- Question-only TeX: /resources/isi/msqe/pyqs/pea/${year}/${texFileName}`);
  reportLines.push(`- Question-only PDF: ${pdfGenerated ? `/resources/isi/msqe/pyqs/pea/${year}/${pdfFileName}` : "generation failed"}`);
  if (!pdfGenerated) {
    reportLines.push(`- pdflatex exit: ${pdfResult.status ?? "unknown"}`);
  }
  reportLines.push("");
}

const publicQuestions = allQuestions.map(({ sourceTexPath, sourceQuestionTex, sourceSolutionTex, reviewReasons, ...question }) => question);
fs.mkdirSync(path.dirname(bankPath), { recursive: true });
fs.writeFileSync(bankPath, `${JSON.stringify(publicQuestions, null, 2)}\n`, "utf8");
updatePyqManifest(generatedResources);

reportLines.splice(6, 0, `Total questions imported: ${allQuestions.length}`);
reportLines.splice(7, 0, `Needs review count: ${allQuestions.filter((question) => question.needsReview).length}`);
reportLines.splice(8, 0, `Question-only PDFs generated: ${generatedResources.filter((resource) => Boolean(resource.pdfPath)).length}`);
reportLines.splice(9, 0, `PDF generation skipped/failed: ${generatedResources.filter((resource) => !resource.pdfPath).length}`);
reportLines.splice(10, 0, "Branding: Statstrive ExamIQ text header");
reportLines.splice(11, 0, "");
fs.writeFileSync(reportPath, `${reportLines.join("\n").trim()}\n`, "utf8");

console.log(`Imported ${allQuestions.length} ISI MSQE PEA questions.`);
console.log(`Needs review: ${allQuestions.filter((question) => question.needsReview).length}`);
console.log(`Question bank: ${path.relative(root, bankPath)}`);

function parseSolutionTex(tex: string, year: number, texPath: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const regex = /\\section\*\{Question\s+(\d+)\}([\s\S]*?)(?=\\section\*\{Question\s+\d+\}|\\end\{document\})/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(tex)) !== null) {
    const questionNumber = Number(match[1]);
    const block = match[2].trim();
    const questionTex = extractSection(block, "Question", "Solution").trim();
    const solutionTex = extractSection(block, "Solution", "Final Answer").trim();
    const finalAnswerTex = extractSection(block, "Final Answer", "Common Trap / Note").trim();
    const noteTex = extractSection(block, "Common Trap / Note", null).trim();
    const metadataTex = block.slice(0, Math.max(0, block.indexOf("\\subsection*{Question}")));
    const { questionTextTex, options } = splitQuestionAndOptions(questionTex);
    const answer = parseAnswerLabel(finalAnswerTex);
    const status = readMeta(metadataTex, "Status") || "Unverified";
    const reviewReasons = getReviewReasons({ questionTextTex, options, answer, status });
    const needsReview = reviewReasons.length > 0;
    const topic = readMeta(metadataTex, "Topic") || "Unclassified";
    const concept = readMeta(metadataTex, "Subtopic/Concept") || "Unclassified";

    questions.push({
      id: `ISI_MSQE_PEA_${year}_Q${String(questionNumber).padStart(2, "0")}`,
      exam: "ISI",
      program: "MSQE",
      paper: "PEA",
      year,
      source: "statstrive_solution_tex",
      section: topic,
      questionNumber: `${year} PEA Q${questionNumber}`,
      questionText: normalizeTexForMarkdown(questionTextTex),
      questionLatex: questionTex,
      options: options.map((option) => ({
        label: option.label,
        text: normalizeTexForMarkdown(option.text),
        latex: option.text,
      })),
      answer,
      solution: normalizeTexForMarkdown(solutionTex),
      markingNotes: needsReview ? `Needs review: ${reviewReasons.join("; ")}.` : normalizeTexForMarkdown(noteTex),
      explanation: `Imported from ${path.relative(root, texPath).replaceAll("\\", "/")}. Question wording is retained from the available local TeX source; incomplete option blocks or ambiguous source status are flagged for review.`,
      topic,
      subtopic: concept,
      concept,
      difficulty: readMeta(metadataTex, "Difficulty") || "Unclassified",
      questionType: "MCQ",
      tags: [
        "isi",
        "msqe",
        "pea",
        String(year),
        needsReview ? "needs-review" : "verified-source",
      ],
      inferenceScore: null,
      needsReview,
      sourceFile: path.relative(root, texPath).replaceAll("\\", "/"),
      sourceTexPath: texPath,
      sourceQuestionTex: questionTex,
      sourceSolutionTex: solutionTex,
      reviewReasons,
    });
  }

  return questions;
}

function extractSection(block: string, startTitle: string, endTitle: string | null): string {
  const start = block.indexOf(`\\subsection*{${startTitle}}`);
  if (start === -1) return "";
  const contentStart = start + `\\subsection*{${startTitle}}`.length;
  const contentEnd = endTitle ? block.indexOf(`\\subsection*{${endTitle}}`, contentStart) : -1;
  return block.slice(contentStart, contentEnd === -1 ? undefined : contentEnd);
}

function splitQuestionAndOptions(questionTex: string): { questionTextTex: string; options: IsiQuestionOption[] } {
  const optionBlock = questionTex.match(/\\begin\{enumerate\}(?:\[[^\]]+\])?([\s\S]*?)\\end\{enumerate\}/);
  if (!optionBlock) return { questionTextTex: questionTex, options: [] };

  let options = optionBlock[1]
    .split(/\\item\b/g)
    .slice(1)
    .map((text, index) => ({
      label: String.fromCharCode("A".charCodeAt(0) + index),
      text: text.trim(),
    }))
    .filter((option) => option.text.length > 0);

  if (options.length === 1) {
    const compact = splitCompactOptionLine(options[0].text);
    if (compact.length === 4) options = compact;
  }

  return {
    questionTextTex: questionTex.replace(optionBlock[0], "").trim(),
    options,
  };
}

function splitCompactOptionLine(text: string): IsiQuestionOption[] {
  const parts = text.split(/\\quad\s*\(([B-D])\)\s*/g);
  if (parts.length < 7) return [];
  const options = [{ label: "A", text: parts[0].trim() }];
  for (let index = 1; index < parts.length; index += 2) {
    options.push({ label: parts[index], text: (parts[index + 1] ?? "").trim() });
  }
  return options.filter((option) => /^[A-D]$/.test(option.label) && option.text.length > 0);
}

function parseAnswerLabel(finalAnswerTex: string): string | null {
  const optionMatch = finalAnswerTex.match(/Option\s+([A-D])/i);
  if (optionMatch) return optionMatch[1].toUpperCase();
  const bareOption = finalAnswerTex.match(/\\boxed\{\\text\{([A-D])\}\}/i);
  if (bareOption) return bareOption[1].toUpperCase();
  return null;
}

function readMeta(metadataTex: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = metadataTex.match(new RegExp(`\\\\textbf\\{${escaped}:\\}\\s*([\\s\\S]*?)(?=\\\\quad|\\\\\\\\|\\\\textbf\\{|$)`, "i"));
  return match ? cleanInlineTex(match[1]) : "";
}

function getReviewReasons(input: { questionTextTex: string; options: IsiQuestionOption[]; answer: string | null; status: string }): string[] {
  const reasons: string[] = [];
  if (input.options.length !== 4) reasons.push("source TeX does not provide a full four-option MCQ block");
  if (!input.answer) reasons.push("answer option could not be parsed confidently");
  if (!/verified/i.test(input.status)) reasons.push(`source status is ${cleanInlineTex(input.status) || "not verified"}`);
  return reasons;
}

function normalizeTexForMarkdown(tex: string): string {
  return tex
    .replace(/\r\n/g, "\n")
    .replace(/% ={8,}[\s\S]*$/g, "")
    .replace(/% -{8,}[\s\S]*$/g, "")
    .replace(/\\begin\{align\*\}/g, () => "$$\n\\begin{aligned}")
    .replace(/\\end\{align\*\}/g, () => "\\end{aligned}\n$$")
    .replace(/\\begin\{equation\*\}/g, () => "$$\n")
    .replace(/\\end\{equation\*\}/g, () => "\n$$")
    .replace(/\\\[/g, () => "$$\n")
    .replace(/\\\]/g, () => "\n$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\begin\{enumerate\}(?:\[[^\]]+\])?/g, "")
    .replace(/\\end\{enumerate\}/g, "")
    .replace(/\\item\b/g, "\n- ")
    .replace(/\\subsection\*\{([^}]+)\}/g, "\n### $1\n")
    .replace(/\\section\*\{([^}]+)\}/g, "\n## $1\n")
    .replace(/\\textbf\{([^{}]+)\}/g, "**$1**")
    .replace(/\\emph\{([^{}]+)\}/g, "*$1*")
    .replace(/\\noindent/g, "")
    .replace(/\\medskip|\\bigskip|\\smallskip/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanInlineTex(tex: string): string {
  return tex
    .replace(/\\textbf\{([^{}]+)\}/g, "$1")
    .replace(/\\emph\{([^{}]+)\}/g, "$1")
    .replace(/\\quad/g, " ")
    .replace(/\\\\/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildQuestionOnlyTex(year: number, questions: ParsedQuestion[]): string {
  const rows = questions.map((question) => `${question.questionNumber.replace(`${year} PEA Q`, "")} & ${escapeTable(question.topic)} & ${question.needsReview ? "Needs Review" : "Ready"} \\\\`).join("\n");
  const bodies = questions.map((question) => {
    const reviewNote = question.needsReview
      ? `\\par\\noindent\\textcolor{StatAmber}{\\textbf{Review note:} ${escapeTex(question.reviewReasons.join("; "))}.}\n`
      : "";
    return [
      `\\section*{Question ${question.questionNumber.replace(`${year} PEA Q`, "")}}`,
      `\\addcontentsline{toc}{section}{Question ${question.questionNumber.replace(`${year} PEA Q`, "")}}`,
      `\\noindent\\textbf{Topic:} ${question.topic} \\quad \\textbf{Difficulty:} ${question.difficulty} \\quad \\textbf{Status:} ${question.needsReview ? "Needs Review" : "Ready"}`,
      reviewNote,
      question.sourceQuestionTex,
    ].join("\n\n");
  }).join("\n\n\\newpage\n\n");

  return String.raw`\documentclass[11pt]{article}
\usepackage[a4paper,margin=0.82in]{geometry}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{booktabs,longtable,array}
\usepackage{fancyhdr}
\usepackage[colorlinks=true,linkcolor=StatBlue,urlcolor=StatBlue]{hyperref}

\definecolor{StatBlue}{HTML}{1D4ED8}
\definecolor{StatInk}{HTML}{111827}
\definecolor{StatAmber}{HTML}{B45309}

\setlength{\parindent}{0pt}
\setlength{\parskip}{5pt}
\setlist[enumerate]{itemsep=4pt,topsep=6pt}
\pagestyle{fancy}
\fancyhf{}
\lhead{\textcolor{StatBlue}{\textbf{Statstrive ExamIQ}}}
\rhead{ISI MSQE PEA ${year}}
\cfoot{\thepage}

\begin{document}

\begin{center}
{\Huge \textbf{Statstrive ExamIQ}}\\[6pt]
{\Large ISI MSQE PEA ${year} Question Paper}\\[4pt]
{\small Regenerated from the local solution TeX source. Items missing full source detail are marked Needs Review.}
\end{center}

\vspace{0.5cm}
\begin{longtable}{c l c}
\toprule
Question & Topic & Website Status \\
\midrule
\endhead
${rows}
\bottomrule
\end{longtable}

\newpage
\tableofcontents
\newpage

${bodies}

\end{document}
`;
}

function escapeTex(value: string): string {
  return value.replace(/[&_#%]/g, (char) => `\\${char}`);
}

function escapeTable(value: string): string {
  return escapeTex(value.replace(/\$/g, ""));
}

function updatePyqManifest(resources: IsiMsqePyqResource[]) {
  const existing = fs.existsSync(pyqManifestPath)
    ? JSON.parse(fs.readFileSync(pyqManifestPath, "utf8").replace(/^\uFEFF/, "")) as IsiMsqePyqResource[]
    : [];
  const generatedPaths = new Set(resources.map((resource) => resource.texPath));
  const retained = existing.filter((resource) => !resource.texPath || !generatedPaths.has(resource.texPath));
  fs.writeFileSync(pyqManifestPath, `${JSON.stringify([...retained, ...resources], null, 4)}\n`, "utf8");
}

function removeLatexAuxiliaries(outDir: string, basename: string) {
  for (const extension of [".aux", ".log", ".out", ".toc"]) {
    const filePath = path.join(outDir, `${basename}${extension}`);
    if (fs.existsSync(filePath)) fs.rmSync(filePath);
  }
}

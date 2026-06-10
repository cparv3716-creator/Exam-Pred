import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "../lib/content/csv";
import { validatePyqRows } from "../lib/content/validators/pyq-validator";
import type { LocalPyqCleanRow } from "../lib/content/validators/types";

type PyqManifest = {
  exam_slug: string;
  updated_at: string;
  total_validated_rows: number;
  files: Array<{
    file: string;
    row_count: number;
    imported_at: string;
  }>;
};

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: npm run import:pyq -- <path-to-csv>");
  process.exit(1);
}

const absoluteInputPath = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);

if (!fs.existsSync(absoluteInputPath)) {
  console.error(`Input CSV not found: ${absoluteInputPath}`);
  process.exit(1);
}

const csvText = fs.readFileSync(absoluteInputPath, "utf8");
const rows = parseCsv(csvText);
const validation = validatePyqRows(rows);
const validRows = validation.rows.filter((row) => row.errors.length === 0).map((row) => row.clean);
const importedAt = new Date().toISOString();

ensureDir("reports/local_imports");

const grouped = groupByExam(validRows);
const writtenFiles: string[] = [];

for (const [examSlug, examRows] of Object.entries(grouped)) {
  const validatedDir = path.join(process.cwd(), "content", examSlug, "pyqs", "validated");
  const manifestDir = path.join(process.cwd(), "content", examSlug, "manifests");
  fs.mkdirSync(validatedDir, { recursive: true });
  fs.mkdirSync(manifestDir, { recursive: true });

  const baseName = path.basename(inputPath, path.extname(inputPath)).replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
  const outputFileName = `${baseName}_${Date.now()}.json`;
  const outputPath = path.join(validatedDir, outputFileName);
  fs.writeFileSync(outputPath, JSON.stringify(examRows, null, 2), "utf8");
  writtenFiles.push(path.relative(process.cwd(), outputPath));

  const manifestPath = path.join(manifestDir, "pyq_manifest.json");
  const manifest = readManifest(manifestPath, examSlug);
  const nextManifest: PyqManifest = {
    exam_slug: examSlug,
    updated_at: importedAt,
    total_validated_rows: manifest.total_validated_rows + examRows.length,
    files: [
      ...manifest.files,
      {
        file: path.relative(process.cwd(), outputPath).replace(/\\/g, "/"),
        row_count: examRows.length,
        imported_at: importedAt,
      },
    ],
  };
  fs.writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2), "utf8");
  writtenFiles.push(path.relative(process.cwd(), manifestPath));
}

const reportPath = path.join(process.cwd(), "reports", "local_imports", `pyq_import_${Date.now()}.md`);
fs.writeFileSync(reportPath, buildReport(inputPath, validation.summary, writtenFiles), "utf8");

console.log(`Validated rows: ${validation.summary.validRows}/${validation.summary.totalRows}`);
console.log(`Rows with errors: ${validation.summary.errorRows}`);
console.log(`Rows with warnings: ${validation.summary.warningRows}`);
console.log(`Rows cleaned: ${validation.summary.cleanedRows}`);
console.log(`Rows still suspicious: ${validation.summary.suspiciousRows}`);
console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
for (const file of writtenFiles) {
  console.log(`Wrote: ${file}`);
}

if (validation.summary.errorRows > 0) {
  process.exitCode = 1;
}

function groupByExam(rowsToGroup: LocalPyqCleanRow[]) {
  return rowsToGroup.reduce<Record<string, LocalPyqCleanRow[]>>((groups, row) => {
    groups[row.exam_slug] ??= [];
    groups[row.exam_slug].push(row);
    return groups;
  }, {});
}

function readManifest(manifestPath: string, examSlug: string): PyqManifest {
  if (!fs.existsSync(manifestPath)) {
    return {
      exam_slug: examSlug,
      updated_at: "",
      total_validated_rows: 0,
      files: [],
    };
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as PyqManifest;
  } catch {
    return {
      exam_slug: examSlug,
      updated_at: "",
      total_validated_rows: 0,
      files: [],
    };
  }
}

function buildReport(input: string, summary: typeof validation.summary, files: string[]) {
  return `# Local PYQ Import Report

Generated: ${importedAt}

Input: \`${input}\`

## Summary

| Metric | Value |
| --- | ---: |
| Total rows | ${summary.totalRows} |
| Valid rows | ${summary.validRows} |
| Rows with errors | ${summary.errorRows} |
| Rows with warnings | ${summary.warningRows} |
| Rows cleaned | ${summary.cleanedRows} |
| Rows still suspicious | ${summary.suspiciousRows} |
| Free rows | ${summary.freeCount} |
| Premium rows | ${summary.premiumCount} |
| Topics detected | ${summary.topics.length} |
| Subtopics detected | ${summary.subtopics.length} |

## Top Cleaning Warnings

${summary.cleaningWarnings.length ? summary.cleaningWarnings.map((warning) => `- ${warning.code}: ${warning.count}`).join("\n") : "- None"}

## Question IDs Needing Manual Review

${summary.questionIdsNeedingManualReview.length ? summary.questionIdsNeedingManualReview.map((questionId) => `- ${questionId}`).join("\n") : "- None"}

## New Topics Flagged

${summary.newTopics.length ? summary.newTopics.map((topic) => `- ${topic}`).join("\n") : "- None"}

## New Subtopics Flagged

${summary.newSubtopics.length ? summary.newSubtopics.map((subtopic) => `- ${subtopic}`).join("\n") : "- None"}

## Files Written

${files.length ? files.map((file) => `- \`${file.replace(/\\/g, "/")}\``).join("\n") : "- No files written because no rows passed validation."}

## Legal Reminder

Only owned, generated, licensed, or otherwise legally permitted content should be imported. ExamIQ does not claim leaked, official, exact, guaranteed, or sure-shot questions.
`;
}

function ensureDir(relativePath: string) {
  fs.mkdirSync(path.join(process.cwd(), relativePath), { recursive: true });
}

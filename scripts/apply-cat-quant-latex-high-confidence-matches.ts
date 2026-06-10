import fs from "node:fs";
import path from "node:path";
import {
  applyLatexFields,
  auditReportRelative,
  isHighMatch,
  latexJsonRelative,
  mappingCsvHeaders,
  mappingCsvRelative,
  matchLatexToOld,
  matchRecordToCsv,
  oldJsonRelative,
  projectRoot,
  readJsonArray,
  repairCandidate,
  reviewCsvHeaders,
  reviewCsvRelative,
  reviewReportRelative,
  writeCsv,
  writeJson,
  writeText,
  mdTable,
} from "./cat-quant-latex-map-utils";

const oldRows = readJsonArray(oldJsonRelative);
const latexRows = readJsonArray(latexJsonRelative);
const beforeHigh = oldRows.filter((row) => row.latex_match_confidence === "high").length;
const backupPath = createBackup();

const { matches, unmatchedOld } = matchLatexToOld(latexRows, oldRows);
const highMatches = matches.filter((match) => isHighMatch(match.match_class));
const usedOld = new Set<number>();
let rowsUpgraded = 0;

for (const match of highMatches.sort((a, b) => b.score - a.score)) {
  if (match.old_index < 0 || usedOld.has(match.old_index)) continue;
  const old = oldRows[match.old_index];
  const latex = latexRows[match.latex_index];
  const wasHigh = old.latex_match_confidence === "high" && old.display_source === "latex_source";
  applyLatexFields(old, latex, "high");
  old.latex_import_notes = match.notes;
  if (!wasHigh) rowsUpgraded += 1;
  usedOld.add(match.old_index);
}

const highOldIds = new Set(highMatches.map((match) => match.old_question_id));
const pdfOnlyRows = oldRows.filter((row) => !highOldIds.has(row.question_id) && row.latex_match_confidence !== "high");
const reviewRows = pdfOnlyRows.map((row) => {
  const repair = repairCandidate(row);
  row.question_text_markdown_candidate = repair.question_text_markdown_candidate;
  row.option_a_markdown_candidate = repair.option_a_markdown_candidate;
  row.option_b_markdown_candidate = repair.option_b_markdown_candidate;
  row.option_c_markdown_candidate = repair.option_c_markdown_candidate;
  row.option_d_markdown_candidate = repair.option_d_markdown_candidate;
  row.detailed_solution_markdown_candidate = repair.detailed_solution_markdown_candidate;
  row.candidate_repair_confidence = repair.candidate_repair_confidence;
  row.candidate_repair_notes = repair.candidate_repair_notes;
  row.review_status = repair.review_status;
  return repair;
});

writeJson(oldJsonRelative, oldRows);
writeCsv(mappingCsvRelative, mappingCsvHeaders, [
  ...matches.map((match) => matchRecordToCsv(match)),
  ...unmatchedOld.map((match) => matchRecordToCsv(match, "unmatched_old_json")),
]);
writeCsv(reviewCsvRelative, reviewCsvHeaders, reviewRows);
writeText(auditReportRelative, buildApplyAuditReport());
writeText(reviewReportRelative, buildReviewReport());

const afterHigh = oldRows.filter((row) => row.latex_match_confidence === "high").length;
console.log(`Old JSON questions: ${oldRows.length}`);
console.log(`Parsed LaTeX questions: ${latexRows.length}`);
console.log(`High-confidence matches before: ${beforeHigh}`);
console.log(`High-confidence matches after: ${afterHigh}`);
console.log(`Rows upgraded: ${rowsUpgraded}`);
console.log(`Old rows still PDF-only: ${pdfOnlyRows.length}`);
console.log(`Candidate repairs created: ${reviewRows.filter((row) => row.question_text_markdown_candidate).length}`);
console.log(`Rows needing human review: ${reviewRows.filter((row) => row.review_status !== "safe_candidate_ready").length}`);
console.log(`Backup: ${path.relative(projectRoot, backupPath).replace(/\\/g, "/")}`);
console.log(`Mapping CSV: ${mappingCsvRelative}`);
console.log(`Review CSV: ${reviewCsvRelative}`);

function createBackup() {
  const source = path.join(projectRoot, oldJsonRelative);
  const backupDir = path.join(projectRoot, "content/cat/practice/generated/backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(backupDir, `cat_quant_generated_practice_before_high_conf_latex_${timestamp}.json`);
  fs.copyFileSync(source, target);
  return target;
}

function buildApplyAuditReport() {
  const classCounts = matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.match_class] = (acc[match.match_class] ?? 0) + 1;
    return acc;
  }, {});
  const afterHigh = oldRows.filter((row) => row.latex_match_confidence === "high").length;
  const highTotal = (classCounts.exact_match ?? 0) + (classCounts.high_confidence_match ?? 0);
  return [
    "# CAT Quant LaTeX To JSON Mapping Audit",
    "",
    "High-confidence LaTeX matches have been applied. Medium and low matches remain review-only.",
    "",
    mdTable(
      ["metric", "count"],
      [
        ["total old JSON questions", oldRows.length],
        ["total parsed LaTeX questions", latexRows.length],
        ["high-confidence matches before", beforeHigh],
        ["exact matches", classCounts.exact_match ?? 0],
        ["high-confidence matches", highTotal],
        ["medium candidates", classCounts.medium_confidence_candidate ?? 0],
        ["low candidates", classCounts.low_confidence_candidate ?? 0],
        ["unmatched LaTeX questions", classCounts.unmatched_latex ?? 0],
        ["unmatched old JSON questions", unmatchedOld.length],
        ["old rows upgraded from LaTeX", rowsUpgraded],
        ["high-confidence matches after", afterHigh],
        ["old rows still PDF-only", pdfOnlyRows.length],
      ],
    ),
    "",
    "## 30 Examples Of High-Confidence Mappings",
    "",
    mdTable(
      ["latex_question_id", "old_question_id", "class", "score", "source", "notes"],
      highMatches.slice(0, 30).map((match) => [
        match.latex_question_id,
        match.old_question_id,
        match.match_class,
        match.score.toFixed(4),
        `${match.source_tex_file} #${match.source_question_number}`,
        match.notes.join("; "),
      ]),
    ),
    "",
    "## 30 Examples Of Medium-Confidence Mappings",
    "",
    mdTable(
      ["latex_question_id", "old_question_id", "score", "source", "notes"],
      matches
        .filter((match) => match.match_class === "medium_confidence_candidate")
        .slice(0, 30)
        .map((match) => [
          match.latex_question_id,
          match.old_question_id,
          match.score.toFixed(4),
          `${match.source_tex_file} #${match.source_question_number}`,
          match.notes.join("; "),
        ]),
    ),
    "",
    "## 30 Examples Of PDF-Only Review Rows",
    "",
    mdTable(
      ["question_id", "batch_id", "review_status", "confidence", "notes"],
      reviewRows.slice(0, 30).map((row) => [
        row.question_id,
        row.batch_id,
        row.review_status,
        row.candidate_repair_confidence,
        row.candidate_repair_notes,
      ]),
    ),
  ].join("\n") + "\n";
}

function buildReviewReport() {
  const candidateRepairs = reviewRows.filter((row) => row.question_text_markdown_candidate).length;
  const humanReview = reviewRows.filter((row) => row.review_status !== "safe_candidate_ready").length;
  const count = (status: string) => reviewRows.filter((row) => row.review_status === status).length;
  return [
    "# CAT Quant PDF-Only Review Queue",
    "",
    "PDF-only rows are old JSON rows without a high-confidence LaTeX match. Candidate Markdown fields are review-only and must not be shown to students automatically.",
    "",
    mdTable(
      ["metric", "count"],
      [
        ["old rows still PDF-only", reviewRows.length],
        ["candidate repairs created", candidateRepairs],
        ["candidate repairs needing human review", humanReview],
        ["safe candidate ready", count("safe_candidate_ready")],
        ["insufficient source", count("insufficient_source")],
        ["likely incomplete", count("likely_incomplete")],
        ["mathematical ambiguity", count("mathematical_ambiguity")],
        ["needs human review", count("needs_human_review")],
      ],
    ),
    "",
    "## 30 PDF-Only Review Examples",
    "",
    mdTable(
      ["question_id", "topic", "subtopic", "review_status", "confidence", "notes"],
      reviewRows.slice(0, 30).map((row) => [
        row.question_id,
        row.topic,
        row.subtopic,
        row.review_status,
        row.candidate_repair_confidence,
        row.candidate_repair_notes,
      ]),
    ),
  ].join("\n") + "\n";
}

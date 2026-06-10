import {
  auditReportRelative,
  isHighMatch,
  latexJsonRelative,
  mappingCsvHeaders,
  mappingCsvRelative,
  matchLatexToOld,
  matchRecordToCsv,
  mdTable,
  oldJsonRelative,
  readJsonArray,
  repairCandidate,
  reviewCsvHeaders,
  reviewCsvRelative,
  reviewReportRelative,
  writeCsv,
  writeText,
} from "./cat-quant-latex-map-utils";

const oldRows = readJsonArray(oldJsonRelative);
const latexRows = readJsonArray(latexJsonRelative);
const { matches, unmatchedOld } = matchLatexToOld(latexRows, oldRows);
const highMatches = matches.filter((match) => isHighMatch(match.match_class));
const highOldIds = new Set(highMatches.map((match) => match.old_question_id));
const pdfOnlyRows = oldRows.filter((row) => !highOldIds.has(row.question_id) && row.latex_match_confidence !== "high");
const reviewRows = pdfOnlyRows.map(repairCandidate);

const mappingRows = [
  ...matches.map((match) => matchRecordToCsv(match)),
  ...unmatchedOld.map((match) => matchRecordToCsv(match, "unmatched_old_json")),
];

writeCsv(mappingCsvRelative, mappingCsvHeaders, mappingRows);
writeCsv(reviewCsvRelative, reviewCsvHeaders, reviewRows);
writeText(auditReportRelative, buildAuditReport());
writeText(reviewReportRelative, buildReviewReport());

const counts = classCounts();
console.log(`Old JSON questions: ${oldRows.length}`);
console.log(`Parsed LaTeX questions: ${latexRows.length}`);
console.log(`Exact matches: ${counts.exact_match ?? 0}`);
console.log(`High-confidence matches: ${(counts.exact_match ?? 0) + (counts.high_confidence_match ?? 0)}`);
console.log(`Medium candidates: ${counts.medium_confidence_candidate ?? 0}`);
console.log(`Low candidates: ${counts.low_confidence_candidate ?? 0}`);
console.log(`Unmatched LaTeX: ${counts.unmatched_latex ?? 0}`);
console.log(`Unmatched old JSON: ${unmatchedOld.length}`);
console.log(`PDF-only review rows: ${reviewRows.length}`);
console.log(`Mapping report: ${auditReportRelative}`);
console.log(`Review report: ${reviewReportRelative}`);
console.log(`Mapping CSV: ${mappingCsvRelative}`);
console.log(`Review CSV: ${reviewCsvRelative}`);

function classCounts() {
  return matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.match_class] = (acc[match.match_class] ?? 0) + 1;
    return acc;
  }, {});
}

function countReview(status: string) {
  return reviewRows.filter((row) => row.review_status === status).length;
}

function buildAuditReport() {
  const counts = classCounts();
  const oldHigh = oldRows.filter((row) => row.latex_match_confidence === "high").length;
  const highTotal = (counts.exact_match ?? 0) + (counts.high_confidence_match ?? 0);
  const lines = [
    "# CAT Quant LaTeX To JSON Mapping Audit",
    "",
    "This audit does not modify the practice JSON. It reports conservative LaTeX-to-old-JSON matches and leaves medium/low matches for review.",
    "",
    "## Summary",
    "",
    mdTable(
      ["metric", "count"],
      [
        ["total old JSON questions", oldRows.length],
        ["total parsed LaTeX questions", latexRows.length],
        ["old rows already marked high", oldHigh],
        ["exact matches", counts.exact_match ?? 0],
        ["high-confidence matches", highTotal],
        ["medium candidates", counts.medium_confidence_candidate ?? 0],
        ["low candidates", counts.low_confidence_candidate ?? 0],
        ["unmatched LaTeX questions", counts.unmatched_latex ?? 0],
        ["unmatched old JSON questions", unmatchedOld.length],
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
  ];
  return `${lines.join("\n")}\n`;
}

function buildReviewReport() {
  const candidateRepairs = reviewRows.filter((row) => row.question_text_markdown_candidate).length;
  const humanReview = reviewRows.filter((row) => row.review_status !== "safe_candidate_ready").length;
  const lines = [
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
        ["safe candidate ready", countReview("safe_candidate_ready")],
        ["insufficient source", countReview("insufficient_source")],
        ["likely incomplete", countReview("likely_incomplete")],
        ["mathematical ambiguity", countReview("mathematical_ambiguity")],
        ["needs human review", countReview("needs_human_review")],
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
  ];
  return `${lines.join("\n")}\n`;
}

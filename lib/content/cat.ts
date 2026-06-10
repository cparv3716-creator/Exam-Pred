import "server-only";

import fs from "node:fs";
import path from "node:path";
import type {
  CatBacktestSummary,
  CatCandidateScores,
  CatContentStatus,
  CatDashboardStats,
  CatDownload,
  CatFinalRecommendation,
  CatPredictedPaper,
  CatPredictionSpecs,
  CatSelectedPaper,
  ContentFileStatus,
  CsvRow,
} from "@/types/content";
import {
  extractBoldRiskNote,
  extractBulletValue,
  parseMarkdownTable,
  readMarkdownDocument,
} from "@/lib/content/markdown";
import { readCsvRows } from "@/lib/content/csv";

const reportsDir = "content/cat/reports";
const predictedPapersDir = "content/cat/predicted-papers";
const dataDir = "content/cat/data";
const downloadsDir = "public/downloads/cat";

const finalRecommendationPath = `${reportsDir}/FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS.md`;
const pipelineSummaryPath = `${reportsDir}/FULL_PIPELINE_SUMMARY.md`;
const latexReportPath = `${reportsDir}/LATEX_CANDIDATE_PROCESSING_REPORT.md`;
const scoredCandidatesPath = `${dataDir}/scored_latex_candidates.csv`;
const selectedPoolPath = `${dataDir}/best_latex_qa_candidate_pool.csv`;
const predictionSpecsPath = `${dataDir}/prediction_specs.csv`;
const backtestPath = `${dataDir}/variant_backtest_report.csv`;
const portfolioWeightsPath = `${dataDir}/final_prediction_portfolio_weights.json`;

const predictedPaperFiles = [
  {
    id: "balanced",
    relativePath: `${predictedPapersDir}/final_predicted_paper_A_balanced.md`,
    pdfFile: "final_predicted_paper_A_balanced.pdf",
  },
  {
    id: "arithmetic-heavy",
    relativePath: `${predictedPapersDir}/final_predicted_paper_B_arithmetic_heavy.md`,
    pdfFile: "final_predicted_paper_B_arithmetic_heavy.pdf",
  },
  {
    id: "reasoning-heavy",
    relativePath: `${predictedPapersDir}/final_predicted_paper_C_reasoning_heavy.md`,
    pdfFile: "final_predicted_paper_C_reasoning_heavy.pdf",
  },
  {
    id: "recent-trend",
    relativePath: `${predictedPapersDir}/final_predicted_paper_D_recent_trend.md`,
    pdfFile: "final_predicted_paper_D_recent_trend.pdf",
  },
  {
    id: "wildcard",
    relativePath: `${predictedPapersDir}/final_predicted_paper_E_wildcard.md`,
    pdfFile: "final_predicted_paper_E_wildcard.pdf",
  },
];

export function getCatFinalRecommendation(): CatFinalRecommendation {
  const report = readMarkdownDocument(finalRecommendationPath);
  const tableRows = parseMarkdownTable(report.body, "Selected Papers");
  const selectedPapers: CatSelectedPaper[] = tableRows.map((row) => ({
    variant: row.Variant ?? "",
    type: row.Type ?? "",
    expectedOverlap: toNumber(row["Expected Overlap"]),
    risk: toNumber(row.Risk),
    diversity: toNumber(row.Diversity),
    reason: row.Reason ?? "",
  }));

  return {
    report,
    selectedPapers,
    stats: {
      selectedCandidatePool: toNumber(extractBulletValue(report.body, "Selected candidate pool")),
      selectedPaperEligible: toNumber(extractBulletValue(report.body, "Selected paper-eligible candidates")),
      selectedLatexCandidates: toNumber(extractBulletValue(report.body, "Selected LaTeX candidates")),
      specsRepresented: toNumber(extractBulletValue(report.body, "Specs represented")),
      readiness: extractBulletValue(report.body, "Final assembly readiness override") ?? "Unknown",
      coverageRiskNote:
        extractBoldRiskNote(report.body, "CAT_QA_SPEC_14") ||
        "CAT_QA_SPEC_14 Circles remains under-covered.",
    },
  };
}

export function getCatPredictedPapers(): CatPredictedPaper[] {
  return predictedPaperFiles.map((paper) => {
    const markdown = readMarkdownDocument(paper.relativePath);
    const pdfPath = downloadExists(paper.pdfFile) ? `/downloads/cat/${paper.pdfFile}` : undefined;

    return {
      id: paper.id,
      title: markdown.title,
      variantType: extractBulletValue(markdown.body, "Variant type") ?? paper.id,
      strategy: extractBulletValue(markdown.body, "Strategy") ?? "Pattern-weighted predicted practice paper.",
      targetSectionMix: extractBulletValue(markdown.body, "Target section mix") ?? "QA candidate scope.",
      expectedOverlap: toNumber(extractBulletValue(markdown.body, "Expected overlap score")),
      riskScore: toNumber(extractBulletValue(markdown.body, "Risk score")),
      diversityScore: toNumber(extractBulletValue(markdown.body, "Diversity score")),
      questionCount: (markdown.body.match(/^###\s+Q\d+/gm) ?? []).length,
      markdown,
      pdfPath,
    };
  });
}

export function getCatCandidateScores(): CatCandidateScores {
  const scoredRows = readCsvRows(scoredCandidatesPath);
  const selectedPoolRows = readCsvRows(selectedPoolPath);
  const sourceRows = selectedPoolRows.length > 0 ? selectedPoolRows : scoredRows;
  const paperEligibleCount = sourceRows.filter((row) => row.paper_eligible?.toUpperCase() === "YES").length;
  const verifiedCount = sourceRows.filter((row) => row.verification_status?.toUpperCase() === "VERIFIED").length;
  const specs = new Set(sourceRows.map((row) => row.spec_id).filter(Boolean));

  return {
    scoredRows,
    selectedPoolRows,
    scoredCount: scoredRows.length,
    selectedPoolCount: selectedPoolRows.length,
    paperEligibleCount,
    verifiedCount,
    uniqueSpecsRepresented: specs.size,
    topCandidates: sortByScore(sourceRows, "final_question_value_score").slice(0, 8),
  };
}

export function getCatPredictionSpecs(): CatPredictionSpecs {
  const rows = readCsvRows(predictionSpecsPath);

  return {
    rows,
    count: rows.length,
    topSpecs: sortByScore(rows, "spec_priority_score").slice(0, 8),
  };
}

export function getCatBacktestSummary(): CatBacktestSummary {
  const rows = readCsvRows(backtestPath);
  const scores = rows.map((row) => toNumber(row.total_score)).filter((score): score is number => score !== null);
  const best = [...rows].sort((a, b) => (toNumber(b.total_score) ?? 0) - (toNumber(a.total_score) ?? 0))[0];

  return {
    rows,
    rowCount: rows.length,
    averageTotalScore: scores.length ? round(scores.reduce((sum, score) => sum + score, 0) / scores.length, 3) : null,
    bestVariantId: best?.variant_id ?? "",
    bestTotalScore: best ? toNumber(best.total_score) : null,
  };
}

export function getCatDownloads(): CatDownload[] {
  const absoluteDir = path.join(process.cwd(), downloadsDir);
  if (!fs.existsSync(absoluteDir)) return [];

  const labelMap: Record<string, string> = {
    FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS: "Recommended CAT Predicted Papers",
    final_predicted_paper_A_balanced: "Balanced Paper PDF",
    final_predicted_paper_B_arithmetic_heavy: "Arithmetic-heavy Paper PDF",
    final_predicted_paper_C_reasoning_heavy: "Reasoning-heavy Paper PDF",
    final_predicted_paper_D_recent_trend: "Recent-trend Paper PDF",
    final_predicted_paper_E_wildcard: "Wildcard Paper PDF",
  };

  const order = [
    "FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS",
    "final_predicted_paper_A_balanced",
    "final_predicted_paper_B_arithmetic_heavy",
    "final_predicted_paper_C_reasoning_heavy",
    "final_predicted_paper_D_recent_trend",
    "final_predicted_paper_E_wildcard",
  ];

  return fs
    .readdirSync(absoluteDir)
    .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
    .map((fileName) => {
      const absolutePath = path.join(absoluteDir, fileName);
      const id = fileName.replace(/\.pdf$/i, "");
      return {
        id,
        label: labelMap[id] ?? id.replace(/_/g, " "),
        href: `/downloads/cat/${fileName}`,
        fileName,
        sizeBytes: fs.statSync(absolutePath).size,
        tier: id === "FINAL_RECOMMENDED_CAT_PREDICTED_PAPERS" ? ("free" as const) : ("premium" as const),
      };
    })
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

export function getCatDashboardStats(): CatDashboardStats {
  const recommendation = getCatFinalRecommendation();
  const candidates = getCatCandidateScores();
  const backtest = getCatBacktestSummary();
  const downloads = getCatDownloads();
  const topPaper = recommendation.selectedPapers[0];

  return {
    selectedCandidatePool: recommendation.stats.selectedCandidatePool ?? candidates.selectedPoolCount,
    selectedPaperEligible: recommendation.stats.selectedPaperEligible ?? candidates.paperEligibleCount,
    specsRepresented: recommendation.stats.specsRepresented ?? candidates.uniqueSpecsRepresented,
    expectedOverlap: topPaper?.expectedOverlap ?? null,
    riskScore: topPaper?.risk ?? null,
    coverageRiskNote: recommendation.stats.coverageRiskNote,
    latestFinalRecommendation: recommendation.report.title,
    topPredictedPaper: topPaper?.variant ?? "CAT predicted paper portfolio",
    readiness: recommendation.stats.readiness,
    pdfDownloadCount: downloads.length,
    backtestAverageScore: backtest.averageTotalScore,
  };
}

export function getCatPipelineSummary() {
  return readMarkdownDocument(pipelineSummaryPath);
}

export function getCatLatexProcessingReport() {
  return readMarkdownDocument(latexReportPath);
}

export function getCatPortfolioWeights() {
  const absolutePath = path.join(process.cwd(), portfolioWeightsPath);
  if (!fs.existsSync(absolutePath)) return {};
  return JSON.parse(fs.readFileSync(absolutePath, "utf8")) as Record<string, number>;
}

export function getCatContentStatus(): CatContentStatus {
  const coreFiles: ContentFileStatus[] = [
    status("Final recommendation markdown", finalRecommendationPath),
    status("Full pipeline summary markdown", pipelineSummaryPath),
    status("LaTeX candidate processing report", latexReportPath),
    status("Scored LaTeX candidates CSV", scoredCandidatesPath),
    status("Best LaTeX QA candidate pool CSV", selectedPoolPath),
    status("Prediction specs CSV", predictionSpecsPath),
    status("Variant backtest report CSV", backtestPath),
    status("Portfolio weights JSON", portfolioWeightsPath),
    ...predictedPaperFiles.map((paper) => status(`${paper.id} predicted paper markdown`, paper.relativePath)),
    ...getCatDownloads().map((download) => ({
      label: download.label,
      relativePath: `public${download.href}`,
      exists: true,
      sizeBytes: download.sizeBytes,
    })),
  ];

  return {
    files: coreFiles,
    predictedPaperCount: predictedPaperFiles.filter((paper) => fs.existsSync(path.join(process.cwd(), paper.relativePath))).length,
    pdfCount: getCatDownloads().length,
    allCoreFilesPresent: coreFiles.every((file) => file.exists),
  };
}

function status(label: string, relativePath: string): ContentFileStatus {
  const absolutePath = path.join(process.cwd(), relativePath);
  const exists = fs.existsSync(absolutePath);
  return {
    label,
    relativePath,
    exists,
    sizeBytes: exists ? fs.statSync(absolutePath).size : undefined,
  };
}

function downloadExists(fileName: string) {
  return fs.existsSync(path.join(process.cwd(), downloadsDir, fileName));
}

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function sortByScore(rows: CsvRow[], key: string) {
  return [...rows].sort((a, b) => (toNumber(b[key]) ?? 0) - (toNumber(a[key]) ?? 0));
}

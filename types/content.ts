export type ContentFileStatus = {
  label: string;
  relativePath: string;
  exists: boolean;
  sizeBytes?: number;
};

export type MarkdownDocument = {
  title: string;
  body: string;
  excerpt: string;
  relativePath: string;
  exists: boolean;
};

export type CatSelectedPaper = {
  variant: string;
  type: string;
  expectedOverlap: number | null;
  risk: number | null;
  diversity: number | null;
  reason: string;
};

export type CatRecommendationStats = {
  selectedCandidatePool: number | null;
  selectedPaperEligible: number | null;
  selectedLatexCandidates: number | null;
  specsRepresented: number | null;
  readiness: string;
  coverageRiskNote: string;
};

export type CatFinalRecommendation = {
  report: MarkdownDocument;
  selectedPapers: CatSelectedPaper[];
  stats: CatRecommendationStats;
};

export type CatPredictedPaper = {
  id: string;
  title: string;
  variantType: string;
  strategy: string;
  targetSectionMix: string;
  expectedOverlap: number | null;
  riskScore: number | null;
  diversityScore: number | null;
  questionCount: number;
  markdown: MarkdownDocument;
  pdfPath?: string;
};

export type CsvRow = Record<string, string>;

export type CatCandidateScores = {
  scoredRows: CsvRow[];
  selectedPoolRows: CsvRow[];
  scoredCount: number;
  selectedPoolCount: number;
  paperEligibleCount: number;
  verifiedCount: number;
  uniqueSpecsRepresented: number;
  topCandidates: CsvRow[];
};

export type CatPredictionSpecs = {
  rows: CsvRow[];
  count: number;
  topSpecs: CsvRow[];
};

export type CatBacktestSummary = {
  rows: CsvRow[];
  rowCount: number;
  averageTotalScore: number | null;
  bestVariantId: string;
  bestTotalScore: number | null;
};

export type CatDownload = {
  id: string;
  label: string;
  href: string;
  fileName: string;
  sizeBytes: number;
  tier: "free" | "premium";
};

export type CatDashboardStats = {
  selectedCandidatePool: number;
  selectedPaperEligible: number;
  specsRepresented: number;
  expectedOverlap: number | null;
  riskScore: number | null;
  coverageRiskNote: string;
  latestFinalRecommendation: string;
  topPredictedPaper: string;
  readiness: string;
  pdfDownloadCount: number;
  backtestAverageScore: number | null;
};

export type CatContentStatus = {
  files: ContentFileStatus[];
  predictedPaperCount: number;
  pdfCount: number;
  allCoreFilesPresent: boolean;
};

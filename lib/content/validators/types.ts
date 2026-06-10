export type LocalQuestionType = "MCQ" | "TITA" | "MSQ" | "descriptive";

export type LocalDifficulty = "Easy" | "Medium" | "Medium-Hard" | "Hard";

export type LocalPyqInputRow = Record<string, string | number | boolean | null | undefined>;

export type LocalPyqCleanRow = {
  exam_slug: string;
  section: string;
  year: number | null;
  slot: string;
  paper_code: string;
  question_id: string;
  question_text: string;
  question_type: LocalQuestionType;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  detailed_solution: string;
  topic: string;
  subtopic: string;
  archetype: string;
  difficulty: LocalDifficulty;
  source_reference: string;
  frequency_weight: number | null;
  probability_score: number | null;
  trend_score: number | null;
  is_free: boolean;
  is_premium: boolean;
  tags: string[];
  status: "draft" | "published";
};

export type ValidationIssue = {
  field?: string;
  message: string;
  severity: "error" | "warning";
};

export type RowValidationResult<TClean = LocalPyqCleanRow> = {
  rowIndex: number;
  original: LocalPyqInputRow;
  clean: TClean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type ValidationSummary = {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  cleanedRows: number;
  suspiciousRows: number;
  cleaningWarnings: Array<{
    code: string;
    count: number;
  }>;
  questionIdsNeedingManualReview: string[];
  topics: string[];
  subtopics: string[];
  newTopics: string[];
  newSubtopics: string[];
  freeCount: number;
  premiumCount: number;
};

export type PyqValidationResult = {
  rows: RowValidationResult[];
  summary: ValidationSummary;
};

export type ReportManifestInput = Record<string, unknown>;

export type ReportValidationResult = {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  clean: {
    exam_slug: string;
    title: string;
    source_markdown_path: string;
    pdf_download_path: string;
    access_tier: "free" | "premium";
    status: "draft" | "review" | "published" | "unpublished";
    content_rights: string;
  };
};

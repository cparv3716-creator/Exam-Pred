export type IsiProgram = "MSQE" | "MStat" | "MMath" | string;
export type MsqePaper = "PEA" | "PEB";
export type IsiQuestionType = "MCQ" | "descriptive" | "multipart" | string;
export type IsiDifficulty = "Foundation" | "Moderate" | "Advanced" | "Unclassified" | string;

export type IsiQuestionOption = {
  label: string;
  text: string;
  latex?: string | null;
};

export type IsiQuestion = {
  id: string;
  exam: "ISI";
  program: "MSQE";
  paper: MsqePaper;
  year: number | null;
  source: string;
  section: string;
  questionNumber: string;
  questionText: string;
  questionLatex?: string | null;
  options: IsiQuestionOption[];
  answer?: string | null;
  solution?: string | null;
  markingNotes?: string | null;
  explanation?: string | null;
  topic: string;
  subtopic: string;
  concept: string;
  difficulty: IsiDifficulty;
  questionType: IsiQuestionType;
  tags: string[];
  inferenceScore?: number | null;
  needsReview: boolean;
  sourceFile: string;
};

export type MsqeManifest = {
  exam: "ISI";
  program: "MSQE";
  status: string;
  version: string;
  websiteSourcePolicy: string;
  activeQuestionFile: string;
  sourceInventory: {
    structuredFilesFound: number;
    reportedExternalPeaCount: number | null;
    reportedExternalPebCount: number | null;
    note: string;
  };
  modules: Array<{
    id: string;
    label: string;
    status: string;
    path: string;
  }>;
};

export type MsqeOverview = {
  sampleQuestionCount: number;
  peaCount: number;
  pebCount: number;
  topicCount: number;
  needsReviewCount: number;
  sourceMode: "sample_dev" | "structured_local";
};

export type MsqeInferenceModule = {
  id: string;
  title: string;
  description: string;
  status: "ready" | "report_module_ready" | "not_uploaded";
};

export type MsqeTopicStat = {
  topic: string;
  count: number;
  peaCount: number;
  pebCount: number;
};

export type MsqePracticeSet = {
  id: string;
  title: string;
  description: string;
  paper: "PEA" | "PEB" | "Mixed";
  questionIds: string[];
  status: string;
};

export type IsiResourceStatus = "verified" | "draft" | "needs_review" | "source";

export type IsiMsqeSolutionResource = {
  exam: "ISI";
  program: "MSQE";
  paper: MsqePaper;
  year: number;
  title: string;
  pdfPath?: string | null;
  texPath?: string | null;
  status: IsiResourceStatus;
  questionCount: number | null;
  source: string;
  sourceFile?: string;
  lastUpdated: string;
};

export type IsiMsqePyqResource = {
  exam: "ISI";
  program: "MSQE";
  paper: MsqePaper;
  year: number | null;
  title: string;
  resourceType: "question_paper" | "question_paper_archive" | "extracted_text" | string;
  pdfPath?: string | null;
  textPath?: string | null;
  texPath?: string | null;
  status: IsiResourceStatus;
  sourceFile: string;
  note?: string | null;
};
export type IsiAccessTier = "public" | "free_login" | "premium";
export type IsiSolutionStatus = "missing" | "draft" | "verified" | "disputed";

export type IsiMsqePyqQuestion = {
  id: string;
  exam: "ISI";
  program: "MSQE";
  paper: MsqePaper;
  year: number;
  questionNumber: number;
  questionText: string;
  questionLatex: string;
  options: IsiQuestionOption[];
  answer: string;
  solution: string;
  topic: string;
  subtopic: string;
  concept: string;
  difficulty: string;
  questionType: "mcq" | "descriptive" | "multipart" | string;
  source: string;
  solutionSource: string;
  solutionStatus: IsiSolutionStatus;
  needsReview: boolean;
  reviewNotes: string;
};

export type IsiMsqePyqPracticeSet = {
  exam: "ISI";
  program: "MSQE";
  paper: MsqePaper;
  year: number;
  title: string;
  questionCount: number;
  status: "ready" | "needs_review" | "pending" | string;
  accessTier: IsiAccessTier;
  questionsPath: string;
  questionPdfPath: string | null;
  questionTexPath: string | null;
  solutionAvailability: "in_app";
  sourceNote: string;
  branding: string;
  needsReviewCount: number;
  importWarnings: string[];
};
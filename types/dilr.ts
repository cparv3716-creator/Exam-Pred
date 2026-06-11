export type DilrSetMetadata = {
  set_id: string;
  title: string;
  exam: string;
  section: string;
  surface_family: string;
  engine_archetype: string;
  engine_hybrid_of: string[];
  difficulty_label: string;
  quality_level: number;
  website_ready: "ready" | "review_required" | "draft" | string;
  question_count: number;
  estimated_time_min: number;
  has_tita: boolean;
  has_mcq: boolean;
  has_determinacy_question: boolean;
  source: string;
  status: string;
};

export type DilrQuestion = {
  id: string;
  type: "MCQ" | "TITA" | "MSQ" | "descriptive" | string;
  markdown: string;
};

export type DilrAnswerKey = {
  set_id: string;
  answers: Array<{
    question_id: string;
    type: "MCQ" | "TITA" | "MSQ" | "descriptive" | string;
    answer: string;
  }>;
};

export type DilrSetContent = {
  metadata: DilrSetMetadata;
  setMarkdown: string;
  passageMarkdown: string;
  questions: DilrQuestion[];
  solutionMarkdown: string;
  answerKey: DilrAnswerKey;
  assets: {
    pdf?: string;
    tex?: string;
  };
};
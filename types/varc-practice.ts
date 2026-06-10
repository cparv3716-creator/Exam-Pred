import type { PracticeLevel } from "./practice";

export type VarcType =
  | "RC"
  | "Para Jumble"
  | "Odd Sentence Out"
  | "Para Summary"
  | "Sentence Placement"
  | "Para Completion"
  | "Critical Reasoning"
  | "Other";

export type VarcParseStatus =
  | "complete_rc_set"
  | "complete_va_question"
  | "raw_block_fallback"
  | "missing_answer"
  | "missing_options"
  | "incomplete_parse"
  | "needs_manual_review";

export type VarcSourceQuestion = {
  question_id: string;
  exam: "CAT";
  section: "VARC";
  source_file: string;
  source_set_number: number;
  source_question_number: number;
  varc_type: VarcType;
  passage_id: string;
  passage_title: string;
  passage_text_markdown: string;
  question_text_markdown: string;
  option_a_markdown: string;
  option_b_markdown: string;
  option_c_markdown: string;
  option_d_markdown: string;
  option_e_markdown: string;
  correct_answer: string;
  detailed_solution_markdown: string;
  difficulty: string;
  practice_level: PracticeLevel;
  topic: string;
  subtopic: string;
  source_raw_block: string;
  parse_status: VarcParseStatus;
  parse_warnings: string[];
  student_visible: boolean;
};

export type VarcSourceStats = {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  rcPassages: number;
  rcQuestions: number;
  vaQuestions: number;
  studentVisible: number;
  hiddenOrReview: number;
  completeRcSet: number;
  completeVaQuestion: number;
  rawBlockFallback: number;
  missingAnswer: number;
  missingOptions: number;
  parseStatusCounts: Array<{ label: string; count: number }>;
  varcTypeCounts: Array<{ label: string; count: number }>;
  sourceFiles: string[];
};

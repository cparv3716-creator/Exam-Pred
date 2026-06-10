import type { PracticeLevel } from "./practice";

export type LatexSourceParseStatus = "full_parse" | "raw_block_render";

export type LatexSourcePracticeQuestion = {
  question_id: string;
  section: "QA";
  exam: "CAT";
  source_tex_file: string;
  source_question_number: number;
  topic: string;
  subtopic: string;
  difficulty: string;
  practice_level: PracticeLevel;
  question_type: string;
  question_text_markdown: string;
  option_a_markdown: string;
  option_b_markdown: string;
  option_c_markdown: string;
  option_d_markdown: string;
  correct_answer_markdown: string;
  detailed_solution_markdown: string;
  raw_latex_block: string;
  parse_status: LatexSourceParseStatus;
  display_source: "latex_source_direct";
  student_visible: true;
  plain_preview: string;
  parse_warnings: string[];
};

export type LatexSourcePracticeStats = {
  total: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  fullParse: number;
  rawFallback: number;
  missingOptions: number;
  missingSolutions: number;
  filesFound: number;
  sourceFiles: string[];
  topicCount: number;
  subtopicCount: number;
  parseStatusCounts: Array<{ label: string; count: number }>;
};
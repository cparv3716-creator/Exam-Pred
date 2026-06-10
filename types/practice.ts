export type PracticeLevel = "Beginner" | "Intermediate" | "Advanced";

export type PracticeAccessTier = "free" | "free_limited" | "premium";

export type ProbabilityBucket = "not_scored" | "low" | "medium" | "high";

export type PracticeContentStatus =
  | "clean"
  | "safe_display"
  | "needs_math_review"
  | "needs_solution_review"
  | "incomplete_question"
  | "broken_options"
  | "hide_from_student";

export type PracticeCompletenessStatus =
  | "complete"
  | "repaired_from_source"
  | "repaired_from_latex_source"
  | "likely_incomplete"
  | "source_not_found"
  | "needs_manual_review"
  | "hide_until_repaired";

export type GeneratedPracticeQuestion = {
  exam_slug: string;
  section: string;
  content_type: string;
  pool_type: string;
  batch_id: string;
  question_id: string;
  question_text: string;
  question_text_display?: string;
  question_text_latex?: string;
  question_text_markdown?: string;
  question_text_repaired?: string;
  question_type: string;
  option_a: string;
  option_a_display?: string;
  option_a_latex?: string;
  option_a_markdown?: string;
  option_a_repaired?: string;
  option_b: string;
  option_b_display?: string;
  option_b_latex?: string;
  option_b_markdown?: string;
  option_b_repaired?: string;
  option_c: string;
  option_c_display?: string;
  option_c_latex?: string;
  option_c_markdown?: string;
  option_c_repaired?: string;
  option_d: string;
  option_d_display?: string;
  option_d_latex?: string;
  option_d_markdown?: string;
  option_d_repaired?: string;
  correct_answer: string;
  correct_answer_display?: string;
  correct_answer_markdown?: string;
  detailed_solution: string;
  detailed_solution_display?: string;
  detailed_solution_latex?: string;
  detailed_solution_markdown?: string;
  detailed_solution_repaired?: string;
  math_review_status?: "clean" | "safe_display" | "needs_review" | "latex_source_clean";
  math_cleanup_notes?: string[];
  content_status?: PracticeContentStatus;
  content_issue_types?: string[];
  completeness_status?: PracticeCompletenessStatus;
  completeness_issue_types?: string[];
  repair_source?: string;
  repair_confidence?: "high" | "medium" | "low";
  latex_source_available?: boolean;
  latex_source_file?: string;
  latex_source_question_number?: number;
  latex_match_confidence?: "high" | "medium" | "low" | "unmatched";
  display_source?: "latex_source" | "repaired_pdf" | "normalized_pdf" | "raw";
  latex_import_notes?: string[];
  question_text_latex_candidate?: string;
  detailed_solution_latex_candidate?: string;
  student_visible?: boolean;
  topic: string;
  subtopic: string;
  topic_group: string;
  difficulty: string;
  estimated_time: string;
  source_reference: string;
  quality_tier: string;
  is_free: boolean;
  is_premium: boolean;
  tags: string[];
  practice_level: PracticeLevel;
  access_tier: PracticeAccessTier;
  topic_probability_score: number | null;
  topic_probability_bucket: ProbabilityBucket;
  exam_likelihood_label: string;
  cleanup_notes: string[];
};

export type GeneratedPracticeManifest = {
  exam_slug: "cat";
  section: "QA";
  content_type: "generated_practice";
  source_file: string;
  output_file: string;
  imported_at: string;
  total_questions: number;
  beginner_count: number;
  intermediate_count: number;
  advanced_count: number;
  free_access_count: number;
  premium_only_count: number;
  free_limited_count?: number;
  pnc_probability_count: number;
  rows_needing_cleanup: number;
  hard_very_hard_in_beginner?: number;
  easy_medium_in_advanced?: number;
  cleanup_warning_count?: number;
};


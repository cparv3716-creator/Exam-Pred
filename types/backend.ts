/**
 * Backend types for ExamIQ practice progress.
 *
 * These mirror the SQL schema in supabase/migrations/001_practice_progress.sql.
 * Field names use the snake_case the database returns; input types use the same
 * shape (minus server-generated columns) so callers can pass plain objects.
 */

export type ExamSlug = "cat" | "jee" | "neet" | "upsc" | (string & {});
export type SectionCode = "QA" | "VARC" | "DILR" | (string & {});

/** Where a question came from, so attempts/bookmarks stay unambiguous. */
export type QuestionSource = "latex_source" | "varc_source" | "generated" | (string & {});

/** A user profile row (1:1 with auth.users). */
export type Profile = {
  id: string; // = auth.users.id
  display_name: string | null;
  plan: "free" | "premium" | string;
  created_at: string;
  updated_at: string;
};

/** A single answered/attempted question. */
export type PracticeAttempt = {
  id: string;
  user_id: string;
  exam: ExamSlug;
  section: SectionCode;
  question_id: string;
  question_source: QuestionSource;
  selected_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  time_spent_seconds: number | null;
  difficulty: string | null;
  topic: string | null;
  subtopic: string | null;
  attempted_at: string;
};

/** Payload for recording an attempt (server fills id/attempted_at). */
export type PracticeAttemptInput = {
  userId: string;
  exam: ExamSlug;
  section: SectionCode;
  questionId: string;
  questionSource: QuestionSource;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  isCorrect?: boolean | null;
  timeSpentSeconds?: number | null;
  difficulty?: string | null;
  topic?: string | null;
  subtopic?: string | null;
};

/** A bookmarked question. */
export type QuestionBookmark = {
  id: string;
  user_id: string;
  exam: ExamSlug;
  section: SectionCode;
  question_id: string;
  question_source: QuestionSource;
  created_at: string;
};

/** Payload for toggling a bookmark. */
export type BookmarkInput = {
  userId: string;
  exam: ExamSlug;
  section: SectionCode;
  questionId: string;
  questionSource: QuestionSource;
};

export type ToggleBookmarkResult = {
  bookmarked: boolean;
  bookmark: QuestionBookmark | null;
};

/** A practice session (a contiguous run of attempts). */
export type PracticeSession = {
  id: string;
  user_id: string;
  exam: ExamSlug;
  section: SectionCode | null;
  started_at: string;
  ended_at: string | null;
  questions_attempted: number;
  questions_correct: number;
  total_time_seconds: number;
};

/** Aggregated progress for a user (computed, not stored). */
export type PracticeSummary = {
  totalAttempts: number;
  uniqueQuestions: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0..1
  totalTimeSeconds: number;
  bySection: Array<{ section: SectionCode; attempts: number; correct: number; accuracy: number }>;
};

/** Empty summary used as the no-auth / unconfigured fallback. */
export const EMPTY_PRACTICE_SUMMARY: PracticeSummary = {
  totalAttempts: 0,
  uniqueQuestions: 0,
  correct: 0,
  incorrect: 0,
  accuracy: 0,
  totalTimeSeconds: 0,
  bySection: [],
};

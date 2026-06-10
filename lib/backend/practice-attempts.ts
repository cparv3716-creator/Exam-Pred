import { getSupabaseClient } from "@/lib/backend/supabase";
import {
  EMPTY_PRACTICE_SUMMARY,
  type PracticeAttempt,
  type PracticeAttemptInput,
  type PracticeSummary,
  type SectionCode,
} from "@/types/backend";

const TABLE = "practice_attempts";

/**
 * Record a practice attempt. Returns the saved row, or `null` when Supabase is
 * not configured / the user is anonymous / the write fails. Callers should
 * treat `null` as "not persisted" and continue working locally.
 */
export async function savePracticeAttempt(input: PracticeAttemptInput): Promise<PracticeAttempt | null> {
  const client = getSupabaseClient();
  if (!client || !input.userId) return null;

  const row = {
    user_id: input.userId,
    exam: input.exam,
    section: input.section,
    question_id: input.questionId,
    question_source: input.questionSource,
    selected_answer: input.selectedAnswer ?? null,
    correct_answer: input.correctAnswer ?? null,
    is_correct: input.isCorrect ?? null,
    time_spent_seconds: input.timeSpentSeconds ?? null,
    difficulty: input.difficulty ?? null,
    topic: input.topic ?? null,
    subtopic: input.subtopic ?? null,
  };

  const { data, error } = await client.from(TABLE).insert(row).select().single();
  if (error) {
    console.error("[backend] savePracticeAttempt failed:", error.message);
    return null;
  }
  return data as PracticeAttempt;
}

/** All attempts for a user, newest first. Returns `[]` when unavailable. */
export async function getPracticeAttemptsByUser(
  userId: string,
  options: { exam?: string; section?: string; limit?: number } = {},
): Promise<PracticeAttempt[]> {
  const client = getSupabaseClient();
  if (!client || !userId) return [];

  let query = client.from(TABLE).select("*").eq("user_id", userId).order("attempted_at", { ascending: false });
  if (options.exam) query = query.eq("exam", options.exam);
  if (options.section) query = query.eq("section", options.section);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[backend] getPracticeAttemptsByUser failed:", error.message);
    return [];
  }
  return (data ?? []) as PracticeAttempt[];
}

/** Every attempt a user has made on one specific question, newest first. */
export async function getQuestionAttemptHistory(
  userId: string,
  questionId: string,
): Promise<PracticeAttempt[]> {
  const client = getSupabaseClient();
  if (!client || !userId || !questionId) return [];

  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .order("attempted_at", { ascending: false });

  if (error) {
    console.error("[backend] getQuestionAttemptHistory failed:", error.message);
    return [];
  }
  return (data ?? []) as PracticeAttempt[];
}

/** Aggregated progress for a user. Returns a zeroed summary when unavailable. */
export async function getPracticeSummary(userId: string, exam?: string): Promise<PracticeSummary> {
  const client = getSupabaseClient();
  if (!client || !userId) return EMPTY_PRACTICE_SUMMARY;

  const attempts = await getPracticeAttemptsByUser(userId, { exam });
  if (attempts.length === 0) return EMPTY_PRACTICE_SUMMARY;

  const correct = attempts.filter((a) => a.is_correct === true).length;
  const incorrect = attempts.filter((a) => a.is_correct === false).length;
  const uniqueQuestions = new Set(attempts.map((a) => a.question_id)).size;
  const totalTimeSeconds = attempts.reduce((sum, a) => sum + (a.time_spent_seconds ?? 0), 0);

  const sections = new Map<SectionCode, { attempts: number; correct: number }>();
  for (const a of attempts) {
    const entry = sections.get(a.section) ?? { attempts: 0, correct: 0 };
    entry.attempts += 1;
    if (a.is_correct === true) entry.correct += 1;
    sections.set(a.section, entry);
  }

  return {
    totalAttempts: attempts.length,
    uniqueQuestions,
    correct,
    incorrect,
    accuracy: attempts.length ? correct / attempts.length : 0,
    totalTimeSeconds,
    bySection: Array.from(sections.entries()).map(([section, v]) => ({
      section,
      attempts: v.attempts,
      correct: v.correct,
      accuracy: v.attempts ? v.correct / v.attempts : 0,
    })),
  };
}

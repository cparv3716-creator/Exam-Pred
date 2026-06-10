import { getSupabaseClient } from "@/lib/backend/supabase";
import type { BookmarkInput, QuestionBookmark, ToggleBookmarkResult } from "@/types/backend";

const TABLE = "question_bookmarks";

/**
 * Toggle a bookmark for a question. Adds it if absent, removes it if present.
 * Returns the resulting state, or `null` when Supabase is unconfigured / the
 * user is anonymous, so the UI can fall back to local state.
 */
export async function toggleBookmark(input: BookmarkInput): Promise<ToggleBookmarkResult | null> {
  const client = getSupabaseClient();
  if (!client || !input.userId) return null;

  const { data: existing, error: findError } = await client
    .from(TABLE)
    .select("*")
    .eq("user_id", input.userId)
    .eq("question_id", input.questionId)
    .maybeSingle();

  if (findError) {
    console.error("[backend] toggleBookmark lookup failed:", findError.message);
    return null;
  }

  if (existing) {
    const { error: delError } = await client.from(TABLE).delete().eq("id", (existing as QuestionBookmark).id);
    if (delError) {
      console.error("[backend] toggleBookmark delete failed:", delError.message);
      return null;
    }
    return { bookmarked: false, bookmark: null };
  }

  const { data, error: insError } = await client
    .from(TABLE)
    .insert({
      user_id: input.userId,
      exam: input.exam,
      section: input.section,
      question_id: input.questionId,
      question_source: input.questionSource,
    })
    .select()
    .single();

  if (insError) {
    console.error("[backend] toggleBookmark insert failed:", insError.message);
    return null;
  }
  return { bookmarked: true, bookmark: data as QuestionBookmark };
}

/** All bookmarks for a user, newest first. Returns `[]` when unavailable. */
export async function getUserBookmarks(
  userId: string,
  options: { exam?: string; section?: string } = {},
): Promise<QuestionBookmark[]> {
  const client = getSupabaseClient();
  if (!client || !userId) return [];

  let query = client.from(TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (options.exam) query = query.eq("exam", options.exam);
  if (options.section) query = query.eq("section", options.section);

  const { data, error } = await query;
  if (error) {
    console.error("[backend] getUserBookmarks failed:", error.message);
    return [];
  }
  return (data ?? []) as QuestionBookmark[];
}

/** Convenience: which of the given question ids are bookmarked by the user. */
export async function getBookmarkedQuestionIds(userId: string): Promise<Set<string>> {
  const bookmarks = await getUserBookmarks(userId);
  return new Set(bookmarks.map((b) => b.question_id));
}

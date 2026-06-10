"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentUserId, isSupabaseConfigured } from "@/lib/backend/supabase";
import { savePracticeAttempt } from "@/lib/backend/practice-attempts";
import { toggleBookmark } from "@/lib/backend/bookmarks";
import type { BookmarkInput, PracticeAttemptInput } from "@/types/backend";

/**
 * Minimal, safe client hooks for wiring practice progress into the UI later.
 *
 * Everything here degrades gracefully:
 *  - If Supabase is not configured or the user is not logged in, nothing
 *    throws — saves no-op and bookmarks fall back to local component state.
 *  - These are intentionally lightweight placeholders; auth is not wired yet.
 */

/** Resolve the current user id (null until auth is wired / signed out). */
export function useCurrentUserId(): { userId: string | null; loading: boolean; configured: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;
    if (!configured) {
      setLoading(false);
      return;
    }
    getCurrentUserId()
      .then((id) => {
        if (active) setUserId(id);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [configured]);

  return { userId, loading, configured };
}

/**
 * Returns a `record` function that persists an attempt when possible.
 * Resolves to `true` if saved to the backend, `false` if it was a local no-op.
 * Never throws — safe to call from option-check handlers.
 */
export function useAttemptRecorder() {
  const { userId } = useCurrentUserId();

  const record = useCallback(
    async (input: Omit<PracticeAttemptInput, "userId">): Promise<boolean> => {
      if (!userId) return false; // anonymous → practice still works, just not persisted
      try {
        const saved = await savePracticeAttempt({ ...input, userId });
        return Boolean(saved);
      } catch {
        return false;
      }
    },
    [userId],
  );

  return { record, canPersist: Boolean(userId) };
}

/**
 * Bookmark state for a single question. Persists when logged in; otherwise
 * keeps an in-memory local toggle so the button still works in the session.
 */
export function useBookmark(params: Omit<BookmarkInput, "userId">, initialBookmarked = false) {
  const { userId } = useCurrentUserId();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  const toggle = useCallback(async () => {
    // Optimistic local toggle (covers the anonymous / unconfigured case).
    setBookmarked((prev) => !prev);
    if (!userId) return;

    setPending(true);
    try {
      const result = await toggleBookmark({ ...params, userId });
      if (result) setBookmarked(result.bookmarked);
    } catch {
      // keep the optimistic state; the next page load will reconcile
    } finally {
      setPending(false);
    }
  }, [params, userId]);

  return { bookmarked, toggle, pending, canPersist: Boolean(userId) };
}

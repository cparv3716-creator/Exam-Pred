"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/backend/supabase";
import { getCurrentUser, signOut as signOutUser, type AuthUser } from "@/lib/backend/auth";
import { savePracticeAttempt } from "@/lib/backend/practice-attempts";
import { isBookmarked, toggleBookmark } from "@/lib/backend/bookmarks";
import type { BookmarkInput, PracticeAttemptInput } from "@/types/backend";

/**
 * Minimal, safe client hooks for wiring practice progress into the UI.
 *
 * Everything degrades gracefully:
 *  - If Supabase is not configured or the user is not logged in, nothing
 *    throws — saves no-op and bookmarks fall back to local component state.
 */

/** Reactive auth state. Subscribes to Supabase auth changes when configured. */
export function useAuthUser(): {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;
    if (!configured) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((u) => {
        if (active) setUser(u);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const client = getSupabaseClient();
    const sub = client?.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });

    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [configured]);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  return { user, loading, configured, signOut };
}

/** Resolve just the current user id (null until auth wired / signed out). */
export function useCurrentUserId(): { userId: string | null; loading: boolean; configured: boolean } {
  const { user, loading, configured } = useAuthUser();
  return { userId: user?.id ?? null, loading, configured };
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
 * Bookmark state for a single question. Loads the persisted state on mount when
 * logged in; otherwise keeps an in-memory toggle so the button still works.
 */
export function useBookmark(params: Omit<BookmarkInput, "userId">) {
  const { userId } = useCurrentUserId();
  const [bookmarked, setBookmarked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setBookmarked(false);
      return;
    }
    isBookmarked(userId, params.questionId).then((b) => {
      if (active) setBookmarked(b);
    });
    return () => {
      active = false;
    };
  }, [userId, params.questionId]);

  const toggle = useCallback(async () => {
    // Optimistic local toggle (covers anonymous / unconfigured).
    setBookmarked((prev) => !prev);
    if (!userId) return;
    setPending(true);
    try {
      const result = await toggleBookmark({ ...params, userId });
      if (result) setBookmarked(result.bookmarked);
    } catch {
      // keep optimistic state; reconciles on next load
    } finally {
      setPending(false);
    }
  }, [params, userId]);

  return { bookmarked, toggle, pending, canPersist: Boolean(userId) };
}

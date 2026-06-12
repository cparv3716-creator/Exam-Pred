"use client";

/**
 * Local-first DILR practice progress (no backend required).
 *
 * Stores attempts, correctness, bookmarks, last-visited set and completion
 * per set in localStorage under a versioned key. All reads/writes happen on
 * the client only; components render a neutral state until mounted. A custom
 * event keeps every subscribed component (practice page, dashboard, CAT hub)
 * in sync within the same tab; the native storage event covers other tabs.
 *
 * Sign-in sync is intentionally out of scope for this pass.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "statstrive:dilr-progress:v1";
const SYNC_EVENT = "statstrive:dilr-progress-sync";

export type DilrAttemptRecord = {
  answer: string;
  correct: boolean;
  checkedAt: number;
};

export type DilrSetProgress = {
  setId: string;
  title: string;
  questionCount: number;
  attempts: Record<string, DilrAttemptRecord>;
  bookmarked: boolean;
  bookmarkedQuestions: string[];
  updatedAt: number;
};

export type DilrProgressStore = {
  lastSetId: string | null;
  sets: Record<string, DilrSetProgress>;
};

const EMPTY_STORE: DilrProgressStore = { lastSetId: null, sets: {} };

function readStore(): DilrProgressStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STORE, sets: {} };
    const parsed = JSON.parse(raw) as Partial<DilrProgressStore>;
    return {
      lastSetId: typeof parsed.lastSetId === "string" ? parsed.lastSetId : null,
      sets: parsed.sets && typeof parsed.sets === "object" ? (parsed.sets as DilrProgressStore["sets"]) : {},
    };
  } catch {
    return { ...EMPTY_STORE, sets: {} };
  }
}

function writeStore(store: DilrProgressStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage may be unavailable (private mode); practice still works in-memory */
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
}

function emptySet(meta: { setId: string; title: string; questionCount: number }): DilrSetProgress {
  return {
    setId: meta.setId,
    title: meta.title,
    questionCount: meta.questionCount,
    attempts: {},
    bookmarked: false,
    bookmarkedQuestions: [],
    updatedAt: Date.now(),
  };
}

/** Normalised answer comparison: letters case-insensitive, numerics by value. */
export function isAnswerCorrect(given: string, expected: string): boolean {
  const a = given.trim().toLowerCase();
  const b = expected.trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;
  return false;
}

export type DilrProgressSummary = {
  attempted: number;
  correct: number;
  bookmarks: number;
  lastSet: {
    setId: string;
    title: string;
    questionCount: number;
    attemptedCount: number;
    completionPct: number;
  } | null;
};

export function summarizeProgress(store: DilrProgressStore): DilrProgressSummary {
  let attempted = 0;
  let correct = 0;
  let bookmarks = 0;
  for (const set of Object.values(store.sets)) {
    const records = Object.values(set.attempts);
    attempted += records.length;
    correct += records.filter((r) => r.correct).length;
    bookmarks += set.bookmarkedQuestions.length + (set.bookmarked ? 1 : 0);
  }
  const last = store.lastSetId ? store.sets[store.lastSetId] : undefined;
  return {
    attempted,
    correct,
    bookmarks,
    lastSet: last
      ? {
          setId: last.setId,
          title: last.title,
          questionCount: last.questionCount,
          attemptedCount: Object.keys(last.attempts).length,
          completionPct: last.questionCount
            ? Math.round((Object.keys(last.attempts).length / last.questionCount) * 100)
            : 0,
        }
      : null,
  };
}

/** Read-only subscription to the whole progress store (dashboard, CAT hub). */
export function useDilrProgressStore(): DilrProgressStore | null {
  const [store, setStore] = useState<DilrProgressStore | null>(null);

  useEffect(() => {
    const refresh = () => setStore(readStore());
    refresh();
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return store;
}

/** Read/write progress for one set (practice viewer). */
export function useDilrSetProgress(meta: { setId: string; title: string; questionCount: number }) {
  const [setProgress, setSetProgress] = useState<DilrSetProgress | null>(null);
  const { setId, title, questionCount } = meta;

  // mark as last-visited + ensure the entry exists (once per mount)
  useEffect(() => {
    const store = readStore();
    const existing = store.sets[setId] ?? emptySet({ setId, title, questionCount });
    existing.title = title;
    existing.questionCount = questionCount;
    store.sets[setId] = existing;
    store.lastSetId = setId;
    writeStore(store);
    setSetProgress(existing);

    const refresh = () => setSetProgress(readStore().sets[setId] ?? null);
    window.addEventListener(SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [setId, title, questionCount]);

  const mutate = useCallback(
    (fn: (set: DilrSetProgress) => void) => {
      const store = readStore();
      const entry = store.sets[setId] ?? emptySet({ setId, title, questionCount });
      fn(entry);
      entry.updatedAt = Date.now();
      store.sets[setId] = entry;
      store.lastSetId = setId;
      writeStore(store);
      setSetProgress({ ...entry });
    },
    [setId, title, questionCount],
  );

  const recordAttempt = useCallback(
    (questionId: string, answer: string, correct: boolean) => {
      mutate((entry) => {
        entry.attempts[questionId] = { answer, correct, checkedAt: Date.now() };
      });
    },
    [mutate],
  );

  const toggleQuestionBookmark = useCallback(
    (questionId: string) => {
      mutate((entry) => {
        entry.bookmarkedQuestions = entry.bookmarkedQuestions.includes(questionId)
          ? entry.bookmarkedQuestions.filter((id) => id !== questionId)
          : [...entry.bookmarkedQuestions, questionId];
      });
    },
    [mutate],
  );

  const toggleSetBookmark = useCallback(() => {
    mutate((entry) => {
      entry.bookmarked = !entry.bookmarked;
    });
  }, [mutate]);

  return { setProgress, recordAttempt, toggleQuestionBookmark, toggleSetBookmark };
}

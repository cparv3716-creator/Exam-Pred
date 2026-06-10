# Backend Practice Progress — Architecture Plan

_Branch: `backend-practice-progress-v1`_

This is the first real backend layer for ExamIQ. It lets the app persist user
**practice attempts**, **bookmarks**, and **progress** without disturbing the
existing static, source-grounded practice content.

## Principles

1. **Additive and non-breaking.** No generated question JSON, parser/import
   scripts, question/answer/passage content, or Next.js output config are
   touched. All existing static practice pages keep working.
2. **Builds without configuration.** If Supabase env vars are absent (local dev,
   first deploy, anonymous users), nothing throws. Clients are created lazily
   and data-access functions fall back to safe no-ops.
3. **Anonymous-first.** Practice works fully without login; progress is simply
   not persisted until a user signs in. No feature is gated on auth being wired.
4. **Minimal dependencies.** Only `@supabase/supabase-js` was added.

## Layers

```
UI (later)
  └─ lib/backend/use-practice-progress.ts   ← client hooks (placeholders)
       ├─ lib/backend/practice-attempts.ts  ← save / query / summary
       ├─ lib/backend/bookmarks.ts          ← toggle / list
       └─ lib/backend/supabase.ts           ← lazy, guarded clients
            └─ Supabase / PostgreSQL (RLS)
                 └─ supabase/migrations/001_practice_progress.sql
types/backend.ts  ← shared row + input + summary types
```

### `lib/backend/supabase.ts`
- `isSupabaseConfigured()` — true when the public env vars exist.
- `getSupabaseClient()` — cached anon (RLS) client, or `null`.
- `getSupabaseServiceClient()` — server-only service-role client, or `null`.
- `getCurrentUserId()` — current session user id, or `null`.

### `lib/backend/practice-attempts.ts`
- `savePracticeAttempt(input)` → row | `null`
- `getPracticeAttemptsByUser(userId, opts)` → `PracticeAttempt[]`
- `getQuestionAttemptHistory(userId, questionId)` → `PracticeAttempt[]`
- `getPracticeSummary(userId, exam?)` → `PracticeSummary` (zeroed when empty)

### `lib/backend/bookmarks.ts`
- `toggleBookmark(input)` → `{ bookmarked, bookmark }` | `null`
- `getUserBookmarks(userId, opts)` → `QuestionBookmark[]`
- `getBookmarkedQuestionIds(userId)` → `Set<string>`

### `lib/backend/use-practice-progress.ts` (client)
- `useCurrentUserId()` — `{ userId, loading, configured }`
- `useAttemptRecorder()` — `{ record(input), canPersist }`
- `useBookmark(params, initial)` — `{ bookmarked, toggle, pending, canPersist }`

## Data model

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`; display name + plan. Auto-created on signup. |
| `practice_attempts` | One row per answered/attempted question. |
| `question_bookmarks` | Saved questions (unique per user + question). |
| `practice_sessions` | A contiguous run of attempts (for streaks/time). |

Row Level Security is enabled on all four tables: a user can only read/write
their own rows (`auth.uid() = user_id`).

## How the UI will connect (next steps)

1. **Auth** — wire Supabase Auth (email/OAuth), replace the role-store demo
   switcher, and have `getCurrentUserId()` return a real session id.
2. **Option checking → attempt save** — in the question viewers, call
   `useAttemptRecorder().record({ exam, section, questionId, questionSource,
   selectedAnswer, correctAnswer, isCorrect, ... })` when a user checks an answer.
3. **Bookmark button** — drop a button into the question detail header bound to
   `useBookmark(...)`.
4. **Progress dashboard** — read `getPracticeSummary(userId)` /
   `getPracticeAttemptsByUser(userId)` for `/dashboard`.

## Out of scope for this pass

- Real authentication / session cookies (`@supabase/ssr`).
- Server actions / route handlers (functions are callable from client or server
  today; route handlers can wrap them later for service-role writes).
- Session lifecycle writes to `practice_sessions` (table is ready; wiring later).

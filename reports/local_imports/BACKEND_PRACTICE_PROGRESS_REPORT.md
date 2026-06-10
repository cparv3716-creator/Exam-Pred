# Backend Practice Progress — Implementation Report

_Branch: `backend-practice-progress-v1`_

First real backend layer for ExamIQ: persist practice **attempts**, **bookmarks**,
and **progress**. Fully additive — no question content, generated JSON, parser
scripts, or Next.js config were modified.

## Files created

| File | Purpose |
|---|---|
| `lib/backend/supabase.ts` | Lazy, guarded Supabase clients (`isSupabaseConfigured`, `getSupabaseClient`, `getSupabaseServiceClient`, `getCurrentUserId`). Never throws when env is missing. |
| `lib/backend/practice-attempts.ts` | `savePracticeAttempt`, `getPracticeAttemptsByUser`, `getQuestionAttemptHistory`, `getPracticeSummary`. |
| `lib/backend/bookmarks.ts` | `toggleBookmark`, `getUserBookmarks`, `getBookmarkedQuestionIds`. |
| `lib/backend/use-practice-progress.ts` | Client hooks: `useCurrentUserId`, `useAttemptRecorder`, `useBookmark`. Degrade gracefully without login. |
| `types/backend.ts` | Shared row, input, and summary types (`PracticeAttempt`, `QuestionBookmark`, `PracticeSession`, `Profile`, `PracticeSummary`, …). |
| `supabase/migrations/001_practice_progress.sql` | Schema + RLS + indexes + triggers. |
| `docs/BACKEND_PRACTICE_PROGRESS_PLAN.md` | Architecture plan and next steps. |
| `.env.example` | Documents required env vars (no secrets). |
| `reports/local_imports/BACKEND_PRACTICE_PROGRESS_REPORT.md` | This report. |

Dependency added: **`@supabase/supabase-js`** (the only package; resolves correctly). No other dependencies.

## Database tables proposed

| Table | Key columns |
|---|---|
| `profiles` | `id` (=auth.users.id), `display_name`, `plan`, timestamps. Auto-created on signup via trigger. |
| `practice_attempts` | `id, user_id, exam, section, question_id, question_source, selected_answer, correct_answer, is_correct, time_spent_seconds, difficulty, topic, subtopic, attempted_at`. |
| `question_bookmarks` | `id, user_id, exam, section, question_id, question_source, created_at` + `unique(user_id, question_id)`. |
| `practice_sessions` | `id, user_id, exam, section, started_at, ended_at, questions_attempted, questions_correct, total_time_seconds`. |

All four tables have **Row Level Security** enabled so each user can only
read/write their own rows (`auth.uid() = user_id`). Indexes cover the common
lookups (by user, by user+question, by user+exam+section, by recency).

## Functions created

- **Attempts:** `savePracticeAttempt`, `getPracticeAttemptsByUser`, `getQuestionAttemptHistory`, `getPracticeSummary`.
- **Bookmarks:** `toggleBookmark`, `getUserBookmarks`, `getBookmarkedQuestionIds`.
- **Client hooks:** `useCurrentUserId`, `useAttemptRecorder`, `useBookmark`.

Every function treats an unconfigured Supabase / anonymous user as a safe no-op
(returns `null`, `[]`, or a zeroed summary) so nothing crashes.

## What is wired

- Backend client + data-access layer + types are complete and **type-check
  clean** (`tsc --noEmit` passes on all new files against the project's strict config).
- Client hooks are ready to drop into the UI.
- SQL migration is ready to apply to a Supabase project.

## Does the frontend still work without login?

**Yes.** No UI was changed. Practice pages remain fully static and functional.
With no Supabase env vars (or no session): clients are `null`, saves no-op, and
`useBookmark` falls back to in-memory local state — the app builds and runs
exactly as before. Persistence simply switches on once env vars + auth exist.

## What remains

1. **Auth** — wire Supabase Auth (email/OAuth) so `getCurrentUserId()` returns a
   real session id (consider `@supabase/ssr` for cookie-based SSR sessions).
2. **UI wiring** — call `useAttemptRecorder().record(...)` on answer-check; add a
   bookmark button via `useBookmark(...)`; build the `/dashboard` progress view
   from `getPracticeSummary` / `getPracticeAttemptsByUser`.
3. **Sessions** — write `practice_sessions` rows (table + types ready).
4. **Apply migration** — run `supabase/migrations/001_practice_progress.sql`.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Scope | Needed |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | now (to enable persistence) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | now (to enable persistence) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | later (trusted server tasks; never `NEXT_PUBLIC_`) |

No secrets are hardcoded; `.env.example` documents the keys with empty values.

## Build result

- **New backend code: type-checks clean** — `tsc --noEmit` exits 0 on
  `lib/backend/*` and `types/backend.ts`, and `@supabase/supabase-js` resolves.
- **`npm run build` could not complete in this sandbox** for the same
  environment reason documented in `UI_POLISH_REPORT.md`: the bundled SWC native
  binary terminates with `Bus error (core dumped)` / `SIGBUS` on this sandbox CPU
  — reproduced even from a clean native-disk copy of the project. This is
  unrelated to the code. Run `npm run build` on the Windows dev machine or let
  Vercel build the branch; the changes are additive, guarded, and Vercel-safe.

## Safety confirmation

- Generated question JSON: **untouched** (no write issued to `content/cat/practice/generated/`).
- `content/cat/practice/generated/`: **untouched**.
- Parser / import / recovery scripts (`scripts/`): **untouched**.
- Question text / options / answers / passages / solutions: **unchanged**.
- `next.config.ts` / Next.js output config: **unchanged**.
- Existing static practice pages: **not modified**.

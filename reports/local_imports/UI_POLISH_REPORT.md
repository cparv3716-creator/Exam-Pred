# ExamIQ — UI / Design Polish Report

**Branch:** `design-system-polish-v1`
**Scope:** Premium UI/design overhaul of marketing, CAT dashboard, Quant & VARC practice, question detail, navigation, footer, and a reusable design system. **No data, parsing, or generated content was touched.**

---

## 1. Summary

The site was upgraded from a functional-but-plain layout into a high-trust, Linear/Vercel-grade dark SaaS surface. The work introduced a small reusable design-system module and applied it consistently across the homepage, a new dedicated CAT intelligence dashboard, the Quant and VARC listing/level pages, the question detail viewers, the global navigation, and the footer.

Design direction honoured: dark-neutral premium surfaces, restrained gradients, sharp typography, clean cards, strong hierarchy, smooth (not excessive) hover states, mobile-first stacking, no childish colours, no clutter, no false "guaranteed prediction / 100% accuracy" claims.

---

## 2. Components created (new design system)

New file: **`components/ui/premium.tsx`** — a dependency-free kit built on the existing Tailwind palette and tokens.

| Component | Purpose |
|---|---|
| `PremiumPanel` | Base glassy surface with optional hover lift. |
| `PageHero` | Inner-page hero: eyebrow, title, lede, breadcrumb, actions, stat strip. |
| `PremiumSectionHeader` | Premium section heading with accent eyebrow + optional action. |
| `PremiumStatCard` | Icon + value + label stat tile. |
| `ExamSectionCard` | Exam-section card with Live / Coming-soon status (soon = non-clickable). |
| `PracticeLaunchCard` | Level launcher (Beginner / Intermediate / Advanced) with count + CTA. |
| `FeaturePillarCard` | Platform-pillar feature card. |
| `TrustSignalCard` | Quality/trust assurance card. |
| `DifficultyBadge` | Flexible badge mapping free-form difficulty strings to a calm 3-step scale. |
| `ProgressPill` | Status pill (Live / Coming soon / counts) with optional pulsing dot. |
| `RouteCTA` | Consistent link-button (primary / secondary / ghost). |
| `EmptyState` | Empty/no-results state. |
| `Breadcrumb` | Lightweight breadcrumb (also used on detail pages). |
| `QuickLinkCard` | Compact navigational tile for quick-link rows. |

All twelve requested primitives are present (plus `Breadcrumb` and `QuickLinkCard` as supporting helpers).

---

## 3. Pages changed / created

### Created
- **`app/exams/cat/page.tsx`** — new premium **CAT intelligence dashboard**: CAT hero with live coverage stats, Quant (live) / VARC (live) / DILR (coming soon) section cards, quick links to `/exams/cat/quant/latex-source`, `/exams/cat/varc/source`, `/exams/cat/reports`, a live practice-coverage panel, and clear "Start practice" CTAs.

### Edited
- `app/page.tsx` — homepage redesign: hero (CTA → CAT, CTA → practice), 4 platform pillars (Prediction engine, Practice bank, Section analytics, Difficulty calibration), exam coverage (CAT live; JEE/NEET/UPSC coming soon), a CAT spotlight, a 4-card quality/trust section, FAQ, and final CTA.
- `app/globals.css` — added a `.rich-math-reading` typography variant (larger type, ~1.9 line-height, comfortable column) for long RC passages.
- `app/exams/[examSlug]/page.tsx` — `generateStaticParams` now excludes `cat` so the new static `/exams/cat` dashboard does not collide with the dynamic route. (No other behaviour changed; all other exam pages still render via this route.)
- `app/exams/cat/quant/latex-source/page.tsx` + `beginner`, `intermediate`, `advanced` — premium hero, breadcrumbs, level launch cards, student-friendly stats (internal pipeline metadata removed).
- `app/exams/cat/varc/source/page.tsx` + `beginner`, `intermediate`, `advanced` — same treatment for VARC.
- `app/exams/cat/quant/latex-source/practice/[questionId]/page.tsx` — breadcrumbs, cleaner badges, removed source-file/internal-metadata leakage.
- `app/exams/cat/varc/source/practice/[questionId]/page.tsx` — same.

### Components edited
- `components/marketing/HeroSection.tsx` — copy + CTAs now point to CAT and practice.
- `components/layout/Footer.tsx` — restructured with CAT + Platform link columns, status pills, legal line.
- `components/layout/PremiumNavbar.tsx` — added a **CAT dropdown** (Dashboard, Quant, VARC, Reports) and a **non-clickable DILR "Soon"** entry; mobile menu mirrors it.
- `components/practice/LatexSourcePracticeBrowser.tsx` — premium 2-column clickable cards, search affordance, `DifficultyBadge`, `EmptyState`, mobile-safe pagination; **removed TeX filename / parse-status leakage.**
- `components/practice/VarcSourcePracticeBrowser.tsx` — same treatment; **removed source-file leakage.**
- `components/practice/LatexSourceQuestionViewer.tsx` — readable question, clean option cards, elegant **reveal answer & solution** toggle, structured solution block.
- `components/practice/VarcSourceQuestionViewer.tsx` — premium RC **reading interface** (max-width reading column, airy leading), clean option cards, elegant answer reveal, structured solution.
- `components/practice/RichMathRenderer.tsx` — added optional `reading` prop for passage typography.

---

## 4. Routes checked

`/` · `/exams` · `/exams/cat` (new) · `/exams/cat/quant/latex-source` (+ beginner/intermediate/advanced) · `/exams/cat/quant/latex-source/practice/[questionId]` · `/exams/cat/varc/source` (+ beginner/intermediate/advanced) · `/exams/cat/varc/source/practice/[questionId]` · `/exams/cat/reports` · global nav + footer links. No working routes were removed.

---

## 5. Mobile considerations

- Hero and CTA rows stack vertically and go full-width below `sm`.
- Practice listing cards collapse from 2 columns → 1 column; filters collapse to a stacked grid; the search field spans full width.
- Pagination hides verbose "Previous/Next" labels on the smallest screens (icons remain).
- Long equations scroll horizontally inside their boxes (existing `.katex-display` rule) — no page-level horizontal overflow.
- RC passages use a constrained reading column for comfortable line lengths on all widths.
- Navbar CAT menu is a hover dropdown on desktop and an expanded section in the mobile sheet (which scrolls if tall).

---

## 6. Safety / non-regression

- **Generated JSON untouched:** YES — `content/cat/practice/generated/` and all generated question JSON were never opened for writing.
- **Parser / import / recovery scripts untouched:** YES — nothing under `scripts/` (Quant/VARC/DILR parser, import, recovery) was modified.
- **Question / passage / answer / option / solution content untouched:** YES — viewers render the same source fields; no content strings were altered.
- **`next.config.ts` output behaviour untouched:** YES — not modified.
- No `.next*`, `node_modules`, cache, or backup artifacts were added to the working tree.
- No "AI guaranteed prediction" / "100% accuracy" claims were introduced; existing honest disclaimers were preserved.

---

## 6b. `git status --short` (verified)

Obtained with `GIT_OPTIONAL_LOCKS=0` (the sandbox denies writing `.git/index.lock`). Result — exactly the intended surface, nothing else:

```
 M app/exams/[examSlug]/page.tsx
 M app/exams/cat/quant/latex-source/advanced/page.tsx
 M app/exams/cat/quant/latex-source/beginner/page.tsx
 M app/exams/cat/quant/latex-source/intermediate/page.tsx
 M app/exams/cat/quant/latex-source/page.tsx
 M app/exams/cat/quant/latex-source/practice/[questionId]/page.tsx
 M app/exams/cat/varc/source/advanced/page.tsx
 M app/exams/cat/varc/source/beginner/page.tsx
 M app/exams/cat/varc/source/intermediate/page.tsx
 M app/exams/cat/varc/source/page.tsx
 M app/exams/cat/varc/source/practice/[questionId]/page.tsx
 M app/globals.css
 M app/page.tsx
 M components/layout/Footer.tsx
 M components/layout/PremiumNavbar.tsx
 M components/marketing/HeroSection.tsx
 M components/practice/LatexSourcePracticeBrowser.tsx
 M components/practice/LatexSourceQuestionViewer.tsx
 M components/practice/RichMathRenderer.tsx
 M components/practice/VarcSourcePracticeBrowser.tsx
 M components/practice/VarcSourceQuestionViewer.tsx
?? app/exams/cat/page.tsx
?? components/ui/premium.tsx
```

`git diff --name-only` confirms **no `content/`, no `content/cat/practice/generated/`, no `scripts/`, and no `next.config.ts`** in the change set. (CRLF notices git prints for those files during its working-tree scan are line-ending attribute checks, not modifications.) The generated JSON directory was confirmed still intact on disk.

## 7. Build result

`npm run build` **could not be executed inside this Linux build sandbox** due to two environment-level blockers that are independent of the code changes:

1. **SWC native binary cannot load in this sandbox.** `next build` loads `@next/swc-linux-x64-gnu` and the process terminates with `Bus error (core dumped)` on load — even when the binary is copied byte-identical (9,015,296 bytes) to native tmpfs and loaded directly, confirming it is the binary itself, not a file-read/truncation issue. The sandbox CPU exposes `avx2`/`sse4_2`, so the incompatibility is at a deeper level (instruction set / glibc ABI), and is independent of the source changes. This happens before any source is compiled, so the build cannot proceed at all here.
2. **The shell's view of the project mount is not coherent with freshly written files**, so shell-based tooling (and a copied-out build) read truncated source. The editor/file layer holds the correct, complete files (verified), but the shell cannot see them reliably, and git index operations fail with `index.lock: Operation not permitted`.

Because of (1) the build is not runnable here at all, and (2) prevents a reliable copied-source fallback.

**Action required:** run the build in the project's normal environment (the Windows dev machine or Vercel), where the correct platform SWC binary is present:

```bash
npm run build
```

The changes are confined to `app/` pages, `components/`, and `app/globals.css`; they use only existing dependencies (Tailwind, lucide-react, framer-motion, react-markdown/katex) and existing data-access functions, and are written to be Vercel-compatible. No server/runtime config was changed.

---

## 8. Remaining UI improvement ideas

- Wire `PremiumStatCard` into the dashboard shells (`/dashboard`) for visual consistency with the new system.
- Add active-route highlighting in the navbar (e.g. CAT chip lit on `/exams/cat/*`).
- Add a sticky in-page "Reveal answer" affordance for very long RC passages so the control is always reachable.
- Consider a topic-coverage visual (bar/heat) on the CAT dashboard once a student-safe aggregate is available.
- Add skeleton loaders (the `.skeleton` utility already exists) to practice browsers for perceived speed.
- Apply the premium hero/breadcrumb pattern to `/exams` and `/pricing` for full consistency.
- A subtle "X new this week" pill on section cards once update metadata is exposed in a student-safe form.

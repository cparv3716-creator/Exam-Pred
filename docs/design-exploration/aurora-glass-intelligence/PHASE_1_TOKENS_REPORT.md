# Phase 1 — Tokens & Utilities Report

> Aurora Glass Intelligence · Phase 1 (global theme tokens + reusable, opt‑in visual utilities). **No page was redesigned.** Everything here is additive and opt‑in: existing pages render identically unless they choose to use an `.aurora-*` class or an `aurora-*` Tailwind utility.

---

## 1. Scope & guardrails honoured

- **Files touched (only these):**
  - `app/globals.css` — appended tokens, utilities, keyframes, reduced‑motion rules.
  - `tailwind.config.ts` — additive `theme.extend` entries (namespaced).
  - `docs/design-exploration/aurora-glass-intelligence/PHASE_1_TOKENS_REPORT.md` — this report.
- **Not touched:** any app page, homepage, dashboard, DILR pages, `app/layout.tsx`, `package.json`. No dependencies added. No project structure invented. No `components/aurora/` files were needed.
- **Namespacing for safety:** every new CSS variable is prefixed `--aurora-*`; every new class is prefixed `.aurora-*`; every new keyframe/animation is prefixed `aurora-*`. The existing dark‑theme `:root` vars (`--bg-base`, `--border-ghost`), the existing `.glass` / `.glass-strong` utilities, and existing keyframes (`fadeUp`, `float`, `pulseGlow`, `shimmer`, `orbit`, `gradientShift`) were **left exactly as‑is**. No existing name is redefined or overridden.

---

## 2. CSS variables added (`app/globals.css`, in `:root`)

Sourced from `DESIGN.md` §5/§8/§9/§11. All namespaced `--aurora-*`.

**Base surfaces:** `--aurora-background` `#F8FBFF` · `--aurora-background-soft` `#EEF4FF` · `--aurora-surface` `#FFFFFF` · `--aurora-surface-glass` `rgba(255,255,255,0.72)` · `--aurora-surface-glass-strong` `rgba(255,255,255,0.85)`

**Text:** `--aurora-text-primary` `#0F172A` · `--aurora-text-secondary` `#475569` · `--aurora-text-muted` `#64748B`

**Accents:** `--aurora-primary` `#4F46E5` · `--aurora-primary-bright` `#6366F1` · `--aurora-cyan` `#06B6D4` · `--aurora-violet` `#8B5CF6` · `--aurora-success` `#10B981` · `--aurora-warning` `#F59E0B` · `--aurora-danger` `#F43F5E`

**Borders & glow colors:** `--aurora-border-soft` · `--aurora-border-strong` · `--aurora-glow-primary` · `--aurora-glow-cyan` · `--aurora-glow-violet`

**Aurora gradient stops:** `--aurora-1` `#6366F1` · `--aurora-2` `#06B6D4` · `--aurora-3` `#8B5CF6`

**Radius scale:** `--aurora-radius-xs` 8px · `-sm` 12px · `-md` 16px · `-lg` 20px · `-xl` 28px · `-pill` 999px

**Shadows & glow:** `--aurora-shadow-1` · `--aurora-shadow-2` · `--aurora-shadow-3` · `--aurora-shadow-glass` · `--aurora-glow-sm` · `--aurora-glow-md` · `--aurora-glow-cyan-md`

**Motion (durations):** `--aurora-dur-instant` 90ms · `-fast` 160ms · `-base` 240ms · `-slow` 420ms · `-slower` 700ms
**Motion (easing):** `--aurora-ease-out` · `--aurora-ease-in-out` · `--aurora-ease-spring`

---

## 3. Utility classes added (`app/globals.css`)

All opt‑in (apply nothing until a class is used on an element).

| Class | Purpose |
|---|---|
| `.aurora-glass` | Signature light‑theme glass surface; blur + translucent white + inner highlight via `--aurora-shadow-glass`. **Solid `--aurora-surface` fallback** when `backdrop-filter` is unsupported (`@supports` guard). |
| `.aurora-surface` | Plain opaque card: surface bg, hairline border, `--aurora-shadow-1`. |
| `.aurora-soft-bg` | Flat background with one faint corner glow (Command/Library wash). |
| `.aurora-gradient-bg` | Low‑opacity indigo→cyan→violet wash (Showcase/Lab headers; never behind body text). |
| `.aurora-orb-bg` | Decorative drifting orb field via `::before`/`::after` (blurred radial gradients, `aurora-drift`). Pseudo‑elements are `pointer-events:none`. |
| `.aurora-glow-primary` | Indigo glow ring (`--aurora-glow-md`). |
| `.aurora-glow-cyan` | Cyan glow ring (`--aurora-glow-cyan-md`). |
| `.aurora-card-hover` | Hover lift (−3px) + shadow step, `--aurora-dur-fast` / `--aurora-ease-out`. |
| `.aurora-focus-ring` | 2px `--aurora-primary-bright` ring on `:focus-visible`, 2px offset. |
| `.aurora-reading-surface` | Calm opaque reading card (Focus passages/questions), 1.85 line‑height. |
| `.aurora-chip` | Filter/topic pill; `[aria-pressed="true"]` gets indigo text + `--aurora-glow-sm`. |
| `.aurora-badge` | Status/difficulty pill on soft background. |
| `.aurora-button-primary` | Indigo→blue‑violet gradient CTA, 44px min height, hover lift + focus ring. |
| `.aurora-button-secondary` | Surface + hairline border button, hover lift + focus ring. |

**Animation helper classes (opt‑in):** `.aurora-fade-slide-up` (single calm entrance), `.aurora-float-slow` (idle bob), `.aurora-soft-pulse` (accent pulse).

---

## 4. Keyframes added

Namespaced and safe; long/looping ones are disabled under reduced motion.

- `aurora-drift` — slow translate/scale loop for aurora orbs/washes.
- `aurora-float-slow` — ±10px translateY idle float.
- `aurora-fade-slide-up` — opacity 0→1, translateY 16→0 (page‑load entrance).
- `aurora-soft-pulse` — opacity 0.55↔1 (live/AI accent).

---

## 5. Reduced‑motion fallback

`@media (prefers-reduced-motion: reduce)`, scoped to aurora utilities only (does not touch unrelated app animations):

- Disables looping/decorative motion: `.aurora-orb-bg` pseudo‑elements, `.aurora-float-slow`, `.aurora-soft-pulse`, `.aurora-fade-slide-up` (`animation: none`).
- `.aurora-fade-slide-up` snaps to final state (`opacity:1; transform:none`).
- Hover/state transitions on cards, buttons, and chips collapse to ~0ms.

---

## 6. Tailwind config additions (`tailwind.config.ts`)

All under `theme.extend`, all namespaced; nothing existing was changed.

- **`colors.aurora.*`** — token‑driven utilities (`bg-aurora-surface`, `text-aurora-primary`, etc.), each mapped to its `var(--aurora-*)`.
- **`borderRadius.aurora-xs … aurora-pill`** — mapped to the radius tokens.
- **`boxShadow.aurora-1/2/3`, `aurora-glass`, `aurora-glow-sm/md/cyan-md`** — mapped to shadow tokens.
- **`transitionTimingFunction.aurora-out / aurora-in-out / aurora-spring`** — the motion curves.
- **`animation.aurora-drift / aurora-float-slow / aurora-fade-slide-up / aurora-soft-pulse`** and matching **`keyframes`** entries.

Existing `ink` colors, `cyan`/`purple` shadows, and the original animations/keyframes remain untouched.

---

## 7. Verification performed

- **No collisions:** confirmed the existing `.glass`/`.glass-strong` and original keyframes are unchanged; every new identifier carries an `aurora` prefix.
- **CSS:** brace balance verified (79 open / 79 close).
- **Tailwind config:** parsed successfully; confirmed 13 aurora colors, 6 aurora radii, 4 aurora keyframes registered.
- **Visual no‑op:** because all variables/classes are namespaced and unused by existing markup, no existing page changes appearance.

> Note: `npm run build` was **not** run in this sandbox (it is not the full app repo and lacks `node_modules`/pages). Run `npm run build` and `npm run lint` after copying these files into the real repo, per `IMPLEMENTATION_PLAN.md` Phase 1 validation.

---

## 8. ⚠️ Manual copy‑back required

This sandbox is a **styling‑only copy**, not the live application. These changes do **not** reach the running product automatically. To ship Phase 1, manually copy the modified files into the real ExamIQ repo:

1. `app/globals.css` — merge the appended **“AURORA GLASS INTELLIGENCE — PHASE 1”** block (everything after the original `gradientShift` keyframe). Keep the existing dark‑theme rules above it intact.
2. `tailwind.config.ts` — copy the namespaced `aurora` additions inside `theme.extend` (colors, borderRadius, boxShadow, transitionTimingFunction, animation, keyframes).
3. `docs/design-exploration/aurora-glass-intelligence/PHASE_1_TOKENS_REPORT.md` — this report.

Then on a dedicated Phase‑1 branch run `npm run build` and `npm run lint`, and `git diff --name-only` to confirm only the intended files changed before opening a PR.

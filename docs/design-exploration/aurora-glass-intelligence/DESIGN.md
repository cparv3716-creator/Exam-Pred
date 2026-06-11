# Aurora Glass Intelligence — Master Design Specification

> Design exploration only. **No UI code is changed by this document.** This is the brand + system spec that Phases 1–7 (see `IMPLEMENTATION_PLAN.md`) will implement later, mode by mode.

---

## 1. Theme overview

**Aurora Glass Intelligence** is a light, luminous, glass‑first design language for ExamIQ. It reads as an *AI exam cockpit + futuristic study lab + serious student dashboard*. The base is an icy, near‑white canvas; intelligence is expressed through restrained aurora gradients (indigo → cyan → violet), translucent glass surfaces, soft inner light, and precise motion. It is futuristic without being neon, premium without being heavy, and — critically — calm enough to read for two hours.

The system is **multi‑mode**: one brand, six visual intensities. A marketing hero may rotate a glowing intelligence core; a passage‑solving screen shows almost no motion at all. The DNA (type, color tokens, radius, spacing, button language, motion curves) never changes — only the *amount* of futurism changes.

The six modes, by intensity:

| Mode | Animation | Futuristic | Readability | Used for |
|---|---|---|---|---|
| Showcase | 9/10 | 10/10 | medium | homepage, marketing, banners |
| Intelligence Lab | 7/10 | 8/10 | medium | AI insights, reports, prediction, heatmaps |
| Command | 6/10 | 7/10 | medium‑high | dashboard, daily plan, cockpit |
| Library | 5/10 | 6/10 | high | Quant/VARC/DILR listings, browsers |
| Utility | 3/10 | 5/10 | high | login, signup, account, settings, onboarding |
| Focus | 3/10 | 4/10 | 10/10 | practice viewers, passages, mock test, solutions |

---

## 2. Brand personality

- **Intelligent, not gimmicky.** Every glow implies signal, not decoration.
- **Confident & calm.** Senior, exam‑serious; speaks like a great mentor, not a hype app.
- **Precise.** Sharp type, exact spacing, honest numbers. No "guaranteed rank" theatrics.
- **Quietly futuristic.** The future shows up at the *edges* (aurora, orb, glass), never on top of the content a student is solving.
- **Trustworthy.** Analytics feel like instruments. The product earns belief by being legible.

Voice in one line: *"Know what matters before the exam does."*

---

## 3. Design principles

1. **Content first, futurism second.** The closer a surface is to text a student reads, the calmer it gets. Effects live around the edges of the solving area, never inside it.
2. **One brand, many intensities.** Mode changes intensity, never identity.
3. **Glass means hierarchy.** Translucency separates "chrome/intelligence" layers from "content" layers; it is not used on dense reading text.
4. **Motion = meaning.** Animation communicates state (loading, progress, reveal, focus). Idle decorative motion is allowed only in Showcase/Lab and always respects reduced‑motion.
5. **Light theme, deep contrast.** Icy background, deep‑navy text — always AA+ for body.
6. **Tokens over values.** Every color, radius, shadow, and duration is a CSS variable. No hard‑coded hexes in components.
7. **Accessible by default.** Keyboard, focus rings, contrast, reduced‑motion are part of "done," not a follow‑up.

---

## 4. Shared brand DNA (constant across every mode)

These never vary, regardless of mode:

- **Type families & scale** (Section 6).
- **Color tokens** (Section 5) — modes may emphasize different accents but draw from the same palette.
- **Button language** — same shapes, radii, sizes, hover/press behavior, focus rings.
- **Icon style** — single line icon set (lucide‑react, already in repo), 1.5px stroke, rounded joins, sized 14/16/18/20/22.
- **Border radius scale** (Section 8).
- **Spacing scale** (Section 7) — 4px base grid.
- **Motion timing tokens & easing** (Section 11) — the *speed and curve* of a hover lift is identical everywhere; only whether an effect exists changes.
- **Component behavior** — a chip, badge, ring, or card behaves identically; only its surrounding intensity shifts.
- **Glass recipe** — same blur/border/tint formula; modes choose *whether* and *how often* to use it.

---

## 5. Color system

Light, icy base with an indigo→cyan→violet aurora accent triad. Proposed tokens (to be added in Phase 1, not now):

```css
:root {
  /* Base */
  --background:        #F8FBFF;  /* icy white */
  --background-soft:   #EEF4FF;  /* pale blue wash */
  --surface:           #FFFFFF;  /* solid card */
  --surface-glass:     rgba(255, 255, 255, 0.72); /* translucent glass */
  --surface-glass-strong: rgba(255, 255, 255, 0.85);

  /* Text */
  --text-primary:      #0F172A;  /* deep navy */
  --text-secondary:    #475569;  /* slate */
  --text-muted:        #64748B;  /* cool gray */

  /* Accents */
  --primary:           #4F46E5;  /* indigo */
  --primary-bright:    #6366F1;  /* blue-violet */
  --cyan:              #06B6D4;  /* electric cyan */
  --violet:            #8B5CF6;  /* aurora violet */
  --success:           #10B981;  /* mint */
  --warning:           #F59E0B;  /* amber */
  --danger:            #F43F5E;  /* rose */

  /* Lines, glow */
  --border-soft:       rgba(148, 163, 184, 0.28);
  --border-strong:     rgba(148, 163, 184, 0.45);
  --glow-primary:      rgba(99, 102, 241, 0.35);
  --glow-cyan:         rgba(6, 182, 212, 0.25);
  --glow-violet:       rgba(139, 92, 246, 0.28);

  /* Aurora gradient stops (for backgrounds, never behind body text) */
  --aurora-1: #6366F1;
  --aurora-2: #06B6D4;
  --aurora-3: #8B5CF6;
}
```

**Usage rules**
- **Aurora gradient** = brand signature for hero/header washes and the intelligence core. Always low‑opacity, blurred, behind glass — never directly behind paragraph text.
- **Primary indigo** = main CTAs, active nav, key focus.
- **Cyan** = "live/AI/now" signal (live badges, active progress, AI tags).
- **Violet** = prediction/forecast layer (predicted percentile, future‑looking widgets).
- **Semantic trio** (mint/amber/rose) = correctness, caution, error/weak‑area only. Never decorative.
- **Difficulty mapping** (consistent everywhere): Easy → mint, Medium → cyan, Hard → indigo/violet, Very Hard → rose.
- **Dark mode (future):** the same tokens invert to a deep‑navy canvas (`#070B16` family) with the identical accent triad. Out of scope for Phases 0–7 but the token names are chosen to support it.

**Contrast guarantees:** body text uses `--text-primary`/`--text-secondary` on `--surface` (≥ 7:1 and ≥ 4.5:1). Accent colors are for ≥ 18px/bold or non‑text UI only unless verified ≥ 4.5:1.

---

## 6. Typography system

No new dependencies. Use a modern grotesque already loadable via the existing stack (Inter is referenced in the repo today); Geist/Satoshi are acceptable swaps if added later through `next/font` — **not part of this task.**

- **Display / headings:** Inter (or Geist Sans / Satoshi‑like). Weights 600–700, tight tracking (`-0.01em` to `-0.02em`).
- **Body:** Inter / Geist Sans, weight 400–500, `line-height: 1.6` (1.75–1.9 for long passages in Focus Mode).
- **Numbers & analytics:** a monospaced face (Geist Mono / JetBrains Mono style) for stats, timers, scores, percentile — gives the "instrument" feel and prevents digit jitter during count‑ups. Until a mono font is added, use `font-variant-numeric: tabular-nums`.

**Type scale (rem, 16px base):**

| Token | Size | Use |
|---|---|---|
| display | 3.0–3.75 | hero headline (Showcase) |
| h1 | 2.25 | page title |
| h2 | 1.75 | section title |
| h3 | 1.25 | card title |
| body‑lg | 1.125 | lead paragraph, passages |
| body | 1.0 | default |
| small | 0.875 | secondary |
| caption | 0.75 | labels, eyebrows (uppercase, `tracking-[0.16em]`) |
| mono‑stat | 1.5–3.0 | big numbers / readiness / timer |

Eyebrows (uppercase micro‑labels) are a brand signature and appear in every mode.

---

## 7. Spacing system

4px base grid. Token scale: `0, 1(4px), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64), 20(80), 24(96)`.

- **Card padding:** 20–24px (Library/Command), 24–32px (Showcase/Focus reading cards).
- **Section rhythm:** 64–96px vertical between major sections (Showcase), 32–48px (Command/Library).
- **Content max‑widths:** marketing 1200–1280px; dashboard 1200px; **reading column 64–72ch** (Focus); auth card 420–460px.
- **Touch targets:** ≥ 44px min on mobile for any interactive element.

---

## 8. Border radius & card shape system

| Token | Radius | Use |
|---|---|---|
| radius-xs | 8px | chips, badges, inputs (small) |
| radius-sm | 12px | buttons, small cards |
| radius-md | 16px | standard cards, inputs |
| radius-lg | 20px | feature/practice cards, panels |
| radius-xl | 28px | hero glass slabs, modals |
| radius-pill | 999px | pills, progress chips, orb halo |

Cards are soft rectangles with a 1px `--border-soft` hairline. Glass cards add an inner top highlight (1px white inset) to read as "lit glass." Avoid sharp 0px corners and avoid overly round (>28px) on dense content.

---

## 9. Shadow & glow system

Two stacks: **elevation** (neutral, for legibility) and **glow** (accent, for intelligence).

```css
--shadow-1: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06);
--shadow-2: 0 4px 12px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.05);
--shadow-3: 0 12px 32px rgba(15,23,42,0.10), 0 6px 14px rgba(15,23,42,0.06);
--shadow-glass: 0 8px 30px rgba(79,70,229,0.08), inset 0 1px 0 rgba(255,255,255,0.6);

--glow-sm: 0 0 0 1px var(--glow-primary), 0 0 18px -6px var(--glow-primary);
--glow-md: 0 0 28px -8px var(--glow-primary);
--glow-cyan-md: 0 0 28px -8px var(--glow-cyan);
```

**Rules**
- Elevation shadows are allowed everywhere (they aid legibility).
- **Glow is rationed by mode:** Showcase/Lab use glow freely on chrome; Command/Library use it only on hover/active; **Focus uses glow only on the edge frame and the active answer/timer — never under text.**
- Never stack glow on top of dense paragraphs.

---

## 10. Glassmorphism rules

The signature surface. Recipe (single source of truth):

```css
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow: var(--shadow-glass);
  border-radius: var(--radius-lg);
}
```

**Do**
- Use glass for navbars, sidebars, floating widgets, stat/insight cards, modals, auth cards.
- Place glass over an aurora or soft gradient so the blur has something to refract.
- Provide a **solid fallback** (`--surface`) when `backdrop-filter` is unsupported or when contrast would drop.

**Don't**
- Don't put glass directly over long body text or passages (reading happens on `--surface`, opaque).
- Don't nest more than two glass layers (blur compounds → mud).
- Don't let glass opacity fall below ~0.6 where text sits on it.

---

## 11. Motion & animation rules

**Timing tokens**

```css
--dur-instant: 90ms;   --dur-fast: 160ms;   --dur-base: 240ms;
--dur-slow: 420ms;     --dur-slower: 700ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);     /* enter / lift */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* moves */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);/* playful pop (Showcase only) */
```

**Effect catalogue** (where each is allowed):

- **Aurora gradient movement** — slow drift, 18–28s loop, `ease-in-out`, opacity ≤ 0.5. *Showcase, Lab; edges only in Utility.* Never in Focus reading area.
- **Floating cards** — translateY ±8–12px, 6–9s, staggered. *Showcase only.*
- **3D orb / intelligence core rotation** — continuous slow rotate + parallax, GPU transforms only. *Showcase only* (Lab may use a smaller static/low‑rotation variant).
- **Page load fade‑slide** — opacity 0→1, translateY 16→0, `--dur-slow`, `--ease-out`, ≤120ms stagger. *All modes* (Focus uses a single calm fade, no slide).
- **Card hover lift** — translateY −2 to −4px + shadow‑2→3 (+ optional glow on Showcase/Library), `--dur-fast`. *All interactive cards.*
- **Progress ring count‑up** — animate stroke‑dashoffset + number count, `--dur-slower`, `--ease-out`, once on view. *Command, Lab.*
- **Solution expand/collapse** — height/opacity reveal, `--dur-base`, `--ease-in-out`; chevron rotates. *Focus, Library.* Calm, no glow burst.
- **Answer option hover** — border + subtle bg tint, `--dur-fast`; selected = ring; correct = mint, wrong = rose (post‑check). *Focus, Library.*
- **Active chip glow** — `--glow-sm` ring on selected filter/topic chip, `--dur-fast`. *Library, Command.*
- **Number/stat tween** — tabular‑nums count‑up on first reveal. *Command, Lab.*

**Reduced motion:** see Section 13. **Rule of thumb:** if motion sits within 200px of text a student must read for >10s, it must be off or near‑zero.

---

## 12. Accessibility rules

- **Contrast:** body ≥ 4.5:1, large/bold ≥ 3:1, UI borders perceivable. Verify accent‑on‑glass combinations.
- **Focus:** visible 2px focus ring (`--primary-bright`, 2px offset) on every interactive element; never remove outlines without a replacement.
- **Keyboard:** full tab order; answer options operable with arrow keys + space/enter; timer/navigator reachable.
- **Semantics:** real `<button>`/`<a>`, `aria-pressed` on toggles (bookmark, option), `aria-expanded` on disclosures (solution), `aria-live="polite"` on count‑ups/timers, labelled inputs.
- **Targets:** ≥ 44px on touch.
- **Text:** never below 14px for content; line length 64–72ch in Focus; respects 200% zoom.
- **Color independence:** never use color alone — pair correctness/difficulty with icon or label.
- **Glass legibility:** if a glass surface can't hold ≥ 4.5:1 for its text, switch to the solid fallback.

---

## 13. Reduced‑motion fallback rules

Honour `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Disable: aurora drift, floating cards, orb rotation, parallax, count‑ups (show final value immediately), auto‑looping anything.
- Keep: instant state changes, focus rings, opacity changes ≤ 90ms, expand/collapse may snap open.
- Provide a manual **"Reduce effects"** preference (future Settings) that maps to the same code path — useful on low‑end devices.

---

## 14. Responsive design rules

- **Breakpoints:** sm 640, md 768, lg 1024, xl 1280, 2xl 1536.
- **Mobile‑first.** Single column by default; grids expand at `sm`/`lg`.
- **Sidebar (Command):** off‑canvas drawer < lg; persistent glass rail ≥ lg.
- **Showcase:** orb/3D scales down to a lightweight static glow under `md`; floating cards stack and stop floating on touch.
- **Focus:** reading column stays 64–72ch; timer/navigator becomes a sticky bottom bar on mobile (not a side rail); zero decorative motion.
- **No horizontal overflow** ever; wide tables/charts scroll inside their own container.
- **Tap‑friendly:** larger targets, no hover‑only affordances (always a tap/focus equivalent).

---

## 15. What MUST remain consistent across all modes

Typography families & scale · color tokens · button language (shape/size/states) · icon set & stroke · radius scale · spacing grid · motion timing tokens & easing curves · component behavior (chip/badge/ring/card/forms) · glass recipe · focus‑ring & accessibility contract · "eyebrow" micro‑label style · semantic color meaning (mint/amber/rose, difficulty mapping).

## 16. What CAN vary by page mode

Animation intensity (0→9) · density and frequency of glow · presence of aurora/orb/3D · background treatment (gradient wash vs flat) · how much glass vs solid surface · section spacing rhythm · hero/illustration presence · decorative depth/parallax · count‑up vs static numbers.

---

## 17. Final design summary

Aurora Glass Intelligence gives ExamIQ a single, unmistakable identity — an icy, luminous, glass‑and‑aurora "AI exam cockpit" — while letting each section dial its own intensity. The marketing surface dazzles (orb, aurora, floating glass); the dashboard reads like a command center; the library feels like mission selection; the practice viewer is a calm, near‑monochrome reading lab; the intelligence pages turn data into trustworthy instruments; and account flows are quiet, centered glass. The DNA — type, tokens, radius, spacing, button language, motion curves, accessibility — is shared and immutable, so the platform always feels like *one* brand, exam‑serious and future‑facing, and never childish or like a generic SaaS dashboard. Implementation is staged and reversible (see `IMPLEMENTATION_PLAN.md`), beginning with **Phase 1 tokens** and the **Showcase homepage**.

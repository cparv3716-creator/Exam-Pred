# Component Guidelines — Aurora Glass Intelligence

> Design exploration only. No components are changed by this document. Each entry: **purpose · visual style · motion · accessibility · modes that use it.** All components draw from the shared DNA in `DESIGN.md`.

Legend for modes: **SH** Showcase · **CM** Command · **LB** Library · **FO** Focus · **IL** Intelligence Lab · **UT** Utility.

---

## 1. App Shell
- **Purpose:** the outer frame (background layer + nav + content slot + footer) that injects the correct mode wrapper.
- **Visual:** sets `--background`; mounts the decorative layer per mode (aurora/orb for SH, faint corner glow for CM/IL, **nothing decorative for FO**). Content max‑width per mode.
- **Motion:** mode‑level load fade; decorative layers are `pointer-events:none`.
- **A11y:** one `<main>`, skip‑to‑content link, landmark roles; decorative layers `aria-hidden`.
- **Modes:** all (Focus uses the "bare" variant).

## 2. Navbar
- **Purpose:** top‑level navigation + auth/account entry + CAT submenu.
- **Visual:** glass bar, hairline bottom border, blur; logo (orb mark), primary links, CTA button. Active link uses indigo text + underline/glow.
- **Motion:** hover bg tint (`--dur-fast`); dropdown fade‑slide; sticky show/hide optional (off in reduced‑motion).
- **A11y:** `nav` landmark, keyboard‑open menus, `aria-expanded` on dropdown, focus‑visible.
- **Modes:** SH, CM, LB, IL, UT (Focus shows a minimal/condensed bar to protect reading).

## 3. Sidebar
- **Purpose:** dashboard/cockpit navigation.
- **Visual:** glass rail (≥ lg) with icon + label items; active item gets `--glow-sm` + indigo text; collapses to off‑canvas drawer < lg.
- **Motion:** active indicator slide, hover tint; drawer slide‑in (snaps in reduced‑motion).
- **A11y:** `nav`, current page `aria-current="page"`, drawer focus‑trap + Esc to close, 44px targets.
- **Modes:** CM (and IL when shown inside the cockpit).

## 4. Glass Cards
- **Purpose:** the signature surface for chrome/intelligence content.
- **Visual:** the `.glass` recipe (blur + translucent white + inner highlight + `--shadow-glass`), `--radius-lg`. Solid fallback when unsupported.
- **Motion:** hover lift (−2/−4px) + shadow step; optional glow on SH/IL.
- **A11y:** ensure text on glass ≥ 4.5:1 or switch to solid; never trap content behind blur.
- **Modes:** SH, CM, IL, UT (sparingly LB; **never** as a passage surface in FO).

## 5. Practice Cards (set/question launchers)
- **Purpose:** entry points to a practice set or question in the library.
- **Visual:** solid `--surface`, hairline border, `--radius-lg`; difficulty badge, topic chips, progress indicator, title, meta (count · est. time), "Start" affordance. DILR variant = **set** card (set type, #questions).
- **Motion:** hover lift + indigo edge; staggered entrance once; no idle motion.
- **A11y:** entire card is one link/button with descriptive label ("Start Hard DILR set: Tournament Routing, 6 questions"); badges have text, not color only.
- **Modes:** LB (compact variant in CM "continue practice").

## 6. Stat Cards
- **Purpose:** single metric (readiness, accuracy, percentile, streak, counts).
- **Visual:** glass card, eyebrow label, big **mono** number, optional delta chip (↑/↓ with mint/rose), small icon.
- **Motion:** number count‑up once on view; hover lift.
- **A11y:** `aria-live="polite"` during count‑up; delta direction conveyed by icon + sign, not color alone.
- **Modes:** CM, IL, SH (as floating cards).

## 7. Progress Rings
- **Purpose:** completion / readiness / accuracy as a circular gauge.
- **Visual:** SVG ring, track in `--border-soft`, progress arc in indigo→cyan gradient; center holds a mono % and tiny label.
- **Motion:** stroke‑dashoffset draw + number count‑up (`--dur-slower`, once).
- **A11y:** `role="img"` + `aria-label="Readiness 63 percent"`; final value rendered in DOM for SR/reduced‑motion.
- **Modes:** CM, IL, SH (hero stat), FO (timer ring — calm, no glow).

## 8. Badges / Chips
- **Purpose:** difficulty, topic, status (Live/Soon/Premium), filters.
- **Visual:** pill, `--radius-xs/pill`; difficulty mapped (Easy mint, Med cyan, Hard indigo/violet, Very Hard rose); filter chips toggle to filled state.
- **Motion:** selected filter gets glow ring (`--dur-fast`); no idle motion.
- **A11y:** filter chips are buttons with `aria-pressed`; status conveyed by text + icon; ≥ 44px hit area on mobile.
- **Modes:** LB, CM, IL (status badges everywhere).

## 9. Buttons
- **Purpose:** actions; one consistent language across modes.
- **Visual:** **Primary** = indigo→blue‑violet gradient, white text, `--radius-sm`, `--shadow-1`. **Secondary** = `--surface`/glass with hairline border. **Ghost** = text + hover tint. Sizes sm (36px) / md (44px) / lg (52px). Icon optional, 16–18px.
- **Motion:** hover lift 1px + brightness; active press −1px; focus ring; loading spinner replaces icon.
- **A11y:** real `<button>`/`<a>`; disabled has `aria-disabled` + non‑color cue; min 44px on touch; never rely on color for the only state cue.
- **Modes:** all.

## 10. Forms
- **Purpose:** auth, settings, search, answer entry.
- **Visual:** inputs 44px, `--radius-md`, hairline border, label above, helper/error below; focus = 2px indigo ring; inline validation (icon + message).
- **Motion:** focus border transition; error shake ≤ 1 cycle; success check fade.
- **A11y:** `<label for>` always; `aria-invalid` + `aria-describedby` on error; errors in text, not color only; logical tab order.
- **Modes:** UT, LB (search/filter), FO (answer inputs/TITA).

## 11. Question Cards
- **Purpose:** present a single question (and its set context) for solving.
- **Visual:** opaque white, hairline border, generous padding; eyebrow ("Question 2 of 6 in this set"), question text in `body-lg`, options below. **No glow under text.**
- **Motion:** calm load fade; none idle.
- **A11y:** semantic heading for the question; options as a radio group (arrow‑key navigable); math/passages preserved exactly.
- **Modes:** FO (read‑style variant in LB previews).

## 12. Answer Options
- **Purpose:** selectable MCQ/TITA answers with grading feedback.
- **Visual:** option row with letter/number token + text; states: default (hairline), hover (tint), selected (indigo ring), correct (mint bg+check, post‑check), wrong‑selected (rose bg+x). TITA = numeric input.
- **Motion:** hover/selected `--dur-fast`; grade state appears on "Check"; no flashing.
- **A11y:** `role="radio"`/`aria-checked` (or native radios); keyboard operable; correctness shown via icon + label + color (not color alone); `aria-live` announces result.
- **Modes:** FO, LB (preview).

## 13. Timer Panel
- **Purpose:** sticky time + progress + navigator during practice/mock.
- **Visual:** calm card (side rail ≥ lg, bottom bar on mobile); mono timer, small progress ring, question navigator dots (done/current/unseen), prev/next + submit.
- **Motion:** numeric tick only (no flashing); active dot subtle scale.
- **A11y:** `aria-live="polite"` (announce sparingly, e.g. each minute), navigator dots are labelled buttons, reachable by keyboard; never trap focus.
- **Modes:** FO.

## 14. Solution Panel
- **Purpose:** reveal answer + detailed solution after an attempt.
- **Visual:** disclosure under the question; collapsed shows "Solution"; expanded shows answer block (mint accent) + structured solution (violet accent header). Calm, opaque.
- **Motion:** height/opacity expand `--dur-base` `--ease-in-out`; chevron rotates; **no glow burst.** Snaps open in reduced‑motion.
- **A11y:** `aria-expanded` + `aria-controls`; keyboard toggle; content order logical for SR.
- **Modes:** FO, LB (preview), IL (explanation cards).

## 15. Tables
- **Purpose:** DILR caselet data, comparison/coverage data, analytics.
- **Visual:** clean HTML table, header in `--text-secondary` uppercase caption, zebra via `--background-soft`, hairline cell borders, `tabular-nums`; horizontal scroll inside a bordered container when wide.
- **Motion:** none (data must be stable); optional row hover tint in analytics.
- **A11y:** real `<table>` with `<th scope>`; caption; scroll container focusable + labelled; never render data as an image.
- **Modes:** FO (DILR sets), IL, CM.

## 16. Mobile Versions
- **App shell:** single column; decorative motion reduced/off; safe‑area padding.
- **Navbar:** hamburger → full‑screen glass sheet; CTA pinned.
- **Sidebar:** off‑canvas drawer with focus‑trap.
- **Cards/stat/practice:** 1‑column stack; hover→tap; entrance stagger capped.
- **Progress rings:** scale down, keep mono number legible.
- **Timer panel (FO):** becomes a **sticky bottom bar** (timer + nav + submit), not a side rail; navigator dots scroll horizontally.
- **Tables:** horizontal scroll within container; never shrink text below 14px.
- **Forms:** 44px+ targets, numeric keypad for TITA, avoid tiny tap zones.
- **Rule:** every hover affordance has a tap/focus equivalent; no horizontal page overflow anywhere.

# Page Modes — Aurora Glass Intelligence

> Design exploration only. No UI is changed by this document. Each mode shares the DNA in `DESIGN.md`; only intensity varies.

Quick map:

| Mode | Routes (current repo) |
|---|---|
| Showcase | `/`, marketing/feature/banner sections |
| Command | `/dashboard`, daily plan, progress overview |
| Library | `/exams/cat/quant/...`, `/exams/cat/varc/source`, `/exams/cat/dilr/...`, browsers |
| Focus | practice viewers (`.../practice/[questionId]`), passages, mock test, solutions |
| Intelligence Lab | `/exams/cat/reports`, AI insights, prediction, heatmaps |
| Utility | `/login`, `/signup`, `/account`, settings, onboarding |

Each section below: **where · mood · layout · background · cards · animation · avoid · wireframe · implementation notes.**

---

## 1. Showcase Mode

**Where:** homepage, marketing/feature pages, banners. **Mood:** awe + trust — "AI‑native exam intelligence." **Animation 9/10 · Futuristic 10/10 · Readability medium.**

**Layout:** full‑bleed hero with centered headline + dual CTA; a glowing **intelligence core (AI orb)** as the focal object; floating glass stat cards orbiting/parallaxing around it; below, alternating feature bands and an exam‑coverage strip.

**Background:** animated aurora wash (indigo→cyan→violet, opacity ≤ 0.5) drifting slowly behind a faint grid; vignette mask so edges fade. **Cards:** floating glass (`--surface-glass`, blur, inner highlight), gentle 6–9s bob, hover lift + glow.

**Animation:** aurora drift, orb rotation/parallax, floating cards, scroll fade‑slide reveals, CTA hover glow. **Avoid:** motion behind any paragraph of real copy; auto‑playing audio/video; more than one orb; text contrast dropping under the aurora (keep headline on a calm band).

**Wireframe:**
```
┌──────────────────────────────────────────────┐
│  ▒▒ aurora drift ▒▒        (navbar: glass)     │
│                                                │
│        [ eyebrow: AI EXAM INTELLIGENCE ]       │
│        Know what matters before the exam.      │
│        [ Start CAT Practice ] [ Explore ]      │
│                                                │
│            ⟮  ◉  AI INTELLIGENCE CORE ⟯         │
│      ╭───────────╮     ╭────────────────╮      │
│      │CAT Ready  │     │ Predicted Focus│      │
│      │   63%     │     │ Flow Networks  │      │
│      ╰───────────╯     │ + Algebra      │      │
│   ╭────────────╮       ╰────────────────╯      │
│   │Today's Plan│   ╭───────────────╮           │
│   │  72 min    │   │ Weak Area:    │           │
│   ╰────────────╯   │ DILR Networks │           │
│                    ╰───────────────╯           │
└──────────────────────────────────────────────┘
  [ Platform pillars ]  [ Exam coverage ]  [ CTA ]
```

**Implementation notes:** orb = layered radial gradients + blurred rings + slow CSS rotate (no heavy 3D lib required; a Canvas/WebGL orb is optional and must lazy‑load + reduce‑motion fallback to a static glow). Floating cards = `transform: translateY` keyframes, GPU‑only, staggered delays. All decorative layers `pointer-events:none`. Respect reduced‑motion (static composition).

---

## 2. Command Mode

**Where:** `/dashboard`, daily plan, progress overview, student cockpit. **Mood:** focused control — "my mission control." **Animation 6/10 · Futuristic 7/10 · Readability medium‑high.**

**Layout:** persistent **glass sidebar** (rail ≥ lg, drawer < lg) + top greeting bar; responsive grid of analytics cards; readiness ring as hero stat; secondary row for streak/continue/plan; lower rows for weak areas + recent attempts.

**Background:** flat `--background` with one faint corner aurora glow (static). **Cards:** glass stat cards, `--shadow-2`, hover lift (no idle motion). Progress rings and numbers count up once on first view.

**Animation:** ring count‑up, number tween, hover lift, sidebar item active‑glow, panel fade‑slide on load. **Avoid:** floating cards, orb, aurora drift, anything that competes with reading your own data.

**Wireframe:**
```
┌────┬───────────────────────────────────────────┐
│ ◉  │  Good evening, Aditya     [ streak 🔥 12 ] │
│ ▦  │  ┌─Readiness──┐ ┌─Accuracy─┐ ┌─Percentile┐ │
│ ▤  │  │   ◉ 63%    │ │  71%     │ │  ~92.4   │ │
│ ▥  │  └────────────┘ └──────────┘ └──────────┘ │
│ ⚙  │  ┌─Continue practice──────────────────────┐│
│    │  │ DILR · Set 4 · resume → ]              ││
│    │  └────────────────────────────────────────┘│
│    │  ┌─Today's plan (72m)─┐ ┌─Weak areas──────┐│
│    │  │ • DILR networks    │ │ Networks  ▇▇▇▁▁ ││
│    │  │ • Algebra drills   │ │ Para‑jumble ▇▇▁▁ ││
│    │  └────────────────────┘ └─────────────────┘│
│    │  ┌─Recent attempts────────────────────────┐│
│    │  │ ✓ Quant Q812  ✗ VARC RC3  ✓ DILR S2    ││
│    │  └────────────────────────────────────────┘│
└────┴───────────────────────────────────────────┘
```

**Implementation notes:** reuse existing dashboard data hooks; cards are glass variants of current stat cards. Count‑ups via `IntersectionObserver`, once. Sidebar = glass rail; active item gets `--glow-sm`. Empty/logged‑out state shows a calm prompt (ties to Utility).

---

## 3. Library Mode

**Where:** Quant / VARC / DILR listing & browser pages. **Mood:** "mission selection screen." **Animation 5/10 · Futuristic 6/10 · Readability high.**

**Layout:** page hero + breadcrumb; sticky **search/filter bar** (search, difficulty chips, topic chips, type); responsive grid of **premium set/practice cards** (2‑col desktop, 1‑col mobile); intentional pagination.

**Background:** flat `--background`, no drift. **Cards:** solid `--surface` with hairline border, hover lift + subtle indigo edge; difficulty badge, topic chips, progress indicator, "Start practice" affordance. For **DILR**, cards represent **sets** (set title, set type, #questions, est. time) — never loose questions.

**Animation:** hover lift, active‑chip glow, filter result fade, staggered card entrance (once). **Avoid:** glow under card body text, idle motion, orb/aurora, motion that delays scanning.

**Wireframe:**
```
Exams / CAT / DILR
DILR practice — pick a set
[🔎 search ]  [Easy][Med][Hard]  [Networks][Games][Caselet]
┌───────────────────────┐  ┌───────────────────────┐
│ ● Hard  · Networks    │  │ ● Med · Distribution   │
│ Tournament Routing    │  │ Conference Allocation  │
│ 6 questions · ~14 min │  │ 5 questions · ~11 min  │
│ progress ▇▇▇▁▁▁  3/6  │  │ progress ▁▁▁▁▁  0/5    │
│            [ Start → ] │  │            [ Start → ] │
└───────────────────────┘  └───────────────────────┘
                 ‹ 1 2 3 … ›
```

**Implementation notes:** cards map to existing set/question metadata only (no invented fields). Chips drive client filters; selected chip = `aria-pressed` + glow ring. Keep difficulty color mapping from `DESIGN.md`.

---

## 4. Focus Mode

**Where:** DILR practice viewer, Quant practice, VARC passage, mock test, solutions. **Mood:** calm, monastic, zero distraction — solve for 1–2 hours. **Animation 3/10 · Futuristic 4/10 · Readability 10/10.**

**Layout:** narrow reading column (64–72ch) centered; for DILR/RC the **set/caselet/passage** sits in a calm opaque card that repeats on every question of the set; question cards below; **sticky timer + question navigator** panel (side rail ≥ lg, bottom bar on mobile); answer inputs; subtle solution reveal.

**Background:** plain `--surface`/`--background`, **no aurora, no particles, no orb**. Futuristic accents live only on the **outer frame** (a thin aurora top‑line, the timer ring) — never inside the text. **Cards:** opaque white, hairline border, generous padding, airy line‑height.

**Animation:** single calm fade on load (no slide); option hover/selected/correct‑wrong states; solution expand/collapse; timer tick (numeric, no flashing). **Avoid (hard rules):** no moving particles behind passage text; no glow inside dense text; no 3D objects near reading content; no parallax; no auto‑advancing.

**Wireframe:**
```
──────── (thin aurora hairline at very top edge) ────────
  Exams / CAT / DILR / Set 4                  ┌─────────┐
  ┌───────────────────────────────────────┐  │ ⏱ 12:48 │
  │ SET / CASELET                          │  │ Q 2 / 6 │
  │ Five interns attended four tours …     │  │ ◉◉○○○○  │
  │ (calm opaque card, 1.85 line-height)   │  │ [prev]  │
  └───────────────────────────────────────┘  │ [next]  │
  ┌───────────────────────────────────────┐  │ submit  │
  │ Q2. Apart from Tuesday, Jatin …        │  └─────────┘
  │  ( ) A  Monday                         │
  │  (•) B  Wednesday                      │
  │  ( ) C  Thursday                       │
  │  [ Check answer ]                      │
  │  ▸ Solution (collapsed)                │
  └───────────────────────────────────────┘
```

**Implementation notes:** the set/caselet text is resolved and shown on **every** question in the set ("Question X of Y in this set"; prev/next within set; prev/next set if available). Tables render as clean HTML tables; network/graph JSON renders via a readable fallback (node→edge list / adjacency table) and, if visual data is missing, the source text is preserved and flagged "needs visual review" — **never invent a chart.** Reduced‑motion: solution snaps open. This mode overrides global decorative layers (renders without the aurora/orb wrappers).

---

## 5. Intelligence Lab Mode

**Where:** `/exams/cat/reports`, AI insights, prediction engine, weakness heatmaps, performance analytics. **Mood:** trustworthy instruments — "see the intelligence." **Animation 7/10 · Futuristic 8/10 · Readability medium.**

**Layout:** insight header (percentile prediction + confidence); grid of analytic modules — **readiness radar**, **weak‑topic heatmap**, **trend graph**, **recommended practice** cards; each module is a glass panel with a glowing accent header.

**Background:** flat with soft corner aurora; module headers carry a thin gradient bar. **Cards:** glass analytic modules, `--glow-md` on header only, animated numbers.

**Animation:** chart draw‑in (lines/areas animate once), radar sweep on load, number count‑ups, heatmap cell fade‑in, hover tooltips. **Avoid:** decorative motion that implies fake precision; glow over data labels; motion that re‑plays on every scroll.

**Wireframe:**
```
[ eyebrow: AI INSIGHTS ]
Predicted percentile  ~92.4   (confidence: medium)  ▣ trend ↑
┌─Readiness radar───────┐ ┌─Weak‑topic heatmap──────────┐
│      QA ◣             │ │ Networks   ███ Algebra  ░░   │
│   VARC ◢   ◤ DILR     │ │ ParaJumble ██  Geometry ▒    │
└───────────────────────┘ └─────────────────────────────┘
┌─Percentile trend──────┐ ┌─Recommended practice────────┐
│   ╱╲    ╱             │ │ • DILR Networks  (start →)   │
│ ╱    ╲╱               │ │ • Algebra mixed  (start →)   │
└───────────────────────┘ └─────────────────────────────┘
```

**Implementation notes:** charts use the library already in repo (recharts) styled to tokens; honest labeling, confidence bands, no "guaranteed" language. Animate on first view only; reduced‑motion shows final chart instantly.

---

## 6. Utility Mode

**Where:** `/login`, `/signup`, `/account`, settings, onboarding. **Mood:** calm, premium, frictionless. **Animation 3/10 · Futuristic 5/10 · Readability high.**

**Layout:** centered single **glass card** (420–460px) on a soft aurora field; logo, title, clean inputs, one primary button, secondary link; settings = same calm card style in a simple two‑column form.

**Background:** soft static aurora (no drift) + vignette. **Cards:** glass auth card, `--shadow-glass`. **Inputs:** 44px tall, `--radius-md`, clear focus ring, inline validation.

**Animation:** card fade‑in on load, button hover, input focus transition, gentle error shake (≤ 1 cycle). **Avoid:** orb, floating cards, motion that delays form submission, busy backgrounds behind inputs.

**Wireframe:**
```
        ▒ soft aurora (static) ▒
        ┌───────────────────────┐
        │        ◉ ExamIQ       │
        │   Log in to ExamIQ    │
        │  [ email            ] │
        │  [ password         ] │
        │  [  Log in  ]         │
        │  New here? Sign up    │
        │  Continue without →   │
        └───────────────────────┘
```

**Implementation notes:** forms remain fully usable when auth backend/env is absent (calm "not enabled yet" note). Onboarding can add a 3–4 step progress chip row using the same glass card. Keep contrast high; inputs on opaque field inside the glass card if needed.

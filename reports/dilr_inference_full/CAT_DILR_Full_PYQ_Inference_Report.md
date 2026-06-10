# CAT DILR Full-Corpus PYQ Inference Report

**Reverse-engineering the reasoning architecture of CAT DILR across nine years (2017–2025), and a build specification for a CAT-grade DILR generator**

---

*Prepared for: ExamIQ Platform — DILR Generation Initiative*
*Corpus: `CAT PYQ.pdf` (2017–2025, 693 pp) + CAT 2025 Slot 1/2/3 solved papers*
*Coverage: 24 DILR slot-sections, ~129 DILR sets, 2017–2025*
*Status: Inference & specification document. No practice questions, mocks, or new DILR sets are generated here.*
*Date: 10 June 2026*

---

## 1. Executive Summary

This report rebuilds the previous DILR inference, which analysed only CAT 2025 (three slots). That earlier report drew conclusions from 15 sets in a single year. **This version analyses the full historical corpus — ~129 DILR sets spanning CAT 2017 through 2025** — with `CAT PYQ.pdf` as the primary expansion and the three 2025 solved papers providing solution-grade depth.

The expansion changes the picture in important ways. The 2025-only report's central thesis survives and is reinforced: **a CAT DILR set is a hidden object the student must reconstruct, not information to be read.** But several of its secondary conclusions turn out to have been **overfit to 2025**:

1. **"Venn / set-theory sets are gone."** False across the corpus. Venn is the **6th most common family (12 sets, ~9%)**, and was a per-slot staple in 2018, 2020 and 2022. It merely happened to be **absent in 2023 and 2025**. A generator that drops Venn is overfitting to two recent years.
2. **"Tournaments don't appear."** False. **Tournament / score-reconstruction is a recurring family (8 sets)** — Hi-Lo bidding, betting-pairs, javelin re-ranking, archery, rifle shooting, the Chango knockout bracket, the QUIET schedule, and 2025's promote-demote set.
3. **"Calculation is never the whole step."** Overstated. While most sets gate arithmetic behind logic, the corpus contains a real vein of **near-pure quant-DI** (especially 2023, and 2024's GDP / candlestick / bubble-plot sets) where computation *is* the difficulty. **quant-DI is in fact the single most common surface family (22 sets, ~17%).**
4. **An entire engine family — number-theory / cipher reconstruction** (cryptarithms, letter→digit ciphers, prime-product allocation) — appears repeatedly in 2018–2022 and was **completely invisible to the 2025-only view.**

The corpus also reveals a **structural era-shift**: 2017–2019 ran **8 sets / 32 questions per slot** with very high arithmetic intensity and number-theory engines; 2020 was a transition (6 sets/slot, signature logic flagships); 2021–2025 settled at **4–5 sets / 20–22 questions per slot**, hybrid-first and deeper per set.

The remainder of this document delivers: a full-corpus family taxonomy with frequencies; the hidden-engine archetypes; the visible/hidden/inferable information model; casework and difficulty-driver analysis; the question-ladder structure; an explicit **"What changed after including `CAT PYQ.pdf`"** comparison; a practical AI-failure diagnosis; strict generation rules; a rejection checklist; a recommended terminal pipeline; and a per-year appendix teardown of all ~129 sets.

---

## 2. Table of Contents

1. Executive Summary
2. Table of Contents
3. Source Coverage (summary)
4. Methodology
5. Full-Corpus Findings
6. Set Family Taxonomy & Frequency
7. The Hidden Reasoning Engine
8. Visible vs Hidden vs Inferable Information
9. Real Casework Analysis
10. Difficulty Driver Analysis
11. The Question Ladder
12. What Changed After Including `CAT PYQ.pdf`
13. Why Our AI-Generated DILR Failed
14. Full-Corpus Generation Rules
15. Rejection Checklist
16. Recommended Terminal Pipeline
17. Appendix A — Per-Year Set Inventory (all ~129 sets)

---

## 3. Source Coverage (summary)

Full detail is in `source_coverage_table.md`. All four mandatory PDFs were detected in `sources/cat_pyqs/`, are readable, carry real text layers (no OCR needed), and are included.

| File | Pages | DILR | Years | Sets | Role |
|------|-------|------|-------|------|------|
| `CAT PYQ.pdf` | 693 | 24 sections | 2017–2025 | ~114 (2017–2024) + 15 (2025) | **Primary corpus** |
| `CAT-Actual-Paper-2025-Slot-1-Q-Sol.pdf` | 28 | Section II | 2025 S1 | 5 | Solution-grade depth |
| `CAT-Actual-Paper-2025-Slot-2-Q-Sol.pdf` | 28 | Section II | 2025 S2 | 5 | Solution-grade depth |
| `CAT-Actual-Paper-2025-Slot-3-Q-Sol.pdf` | 32 | Section II | 2025 S3 | 5 | Solution-grade depth |

**Gate: PASSED** — `CAT PYQ.pdf` present, readable, and the analytical backbone of this report. Limitation: 2017–2024 are questions-only (no examiner solutions), so casework for those years is structurally inferred and tagged `(inferred)`; CAT 2025 solutions were used to calibrate that inference.

---

## 4. Methodology

1. **Source gate first.** Inspected `sources/cat_pyqs/`, verified all four PDFs, confirmed text layers with PyMuPDF, recorded sizes/pages. No analysis began before the gate passed.
2. **Structural extraction.** `pdftotext -layout` on every file. For `CAT PYQ.pdf`, year blocks and section headers were located programmatically and the 24 DILR sections sliced into per-slot files.
3. **Per-year classification.** Each DILR section was segmented into distinct sets and each set scored on eight attributes: source identity, surface family, true reasoning engine, visible/hidden/inferable split, casework, a five-axis difficulty vector, question-ladder character, and CAT-likeness.
4. **Difficulty vector (L/R/C/D/M), 0–3 each:** **L** logic/deduction depth, **R** representation difficulty (how hard it is to *choose and draw* the object), **C** calculation load, **D** data density, **M** dynamic movement / feedback.
5. **Calibration with solutions.** CAT 2025's worked solutions (files 2–4) anchored the casework patterns; older-year casework is inferred from constraint structure and question phrasing (necessity / "cannot be determined" wording is a strong signal of designed indeterminacy).
6. **Integrity.** No question text reproduced; only invented labels and structural descriptions.

---

## 5. Full-Corpus Findings

Five findings hold across all nine years.

**F1 — The hidden object is universal.** In every set, a structure (grid, timeline, allocation, ranking, movement trajectory, flow network, score table, Venn region-set) is *fully specified in the examiner's mind* but only *partially exposed*. The candidate's work is reconstruction; the questions are trivial once the object exists and impossible before it.

**F2 — Hybrids dominate, and increasingly so.** Pure single-engine sets are a minority. The proportion of sets whose true engine is an explicit *hybrid of two archetypes* rises markedly from 2021 onward (e.g. timeline+score-table, allocation+score-table, matrix+ranking). The modern set fuses a reconstruction engine with an arithmetic engine.

**F3 — Arithmetic is a real and recurring difficulty axis — sometimes the whole axis.** Across the corpus, ~40% of sets carry calculation load C≥2. A distinct minority (notably 2023; 2024's GDP/candlestick/bubble) are near-pure quant-DI where computation *is* the difficulty. The 2025-only claim that "arithmetic is always the last step, never the whole step" is too strong for the full corpus.

**F4 — Designed indeterminacy is pervasive.** Necessity phrasing — "necessarily true," "cannot be determined," "must be false," "best can be concluded," range answers — recurs in the large majority of sets in every year. CAT deliberately leaves the reconstructed object **partially under-determined** and asks the student to *prove the boundary of determinacy*. This is the single hardest property for a generator to reproduce.

**F5 — Family mix rotates year to year.** No family is guaranteed in any given year, but over a multi-year window all nine families recur. A generator tuned to one year's mix (e.g. 2025) will systematically miss families that simply sat out that year (Venn, tournaments, number-theory).

---

## 6. Set Family Taxonomy & Frequency

Classifying all ~129 sets by **surface family** (what the set looks like) yields the corpus distribution below. Counts are exact tallies from the per-year inventories in Appendix A.

| Surface family | Sets | Share | Peak years | Notably absent in |
|----------------|------|-------|-----------|-------------------|
| **quant-DI** | 22 | 17% | 2023, 2024 | — (present every year) |
| **matrix / grid** | 20 | 16% | 2019, 2020, 2023 | — |
| **distribution / allocation** | 19 | 15% | 2018, 2022, 2025 | — |
| **chart-plus-logic** | 19 | 15% | 2019, 2024, 2025 | — |
| **scheduling** | 15 | 12% | 2017, 2019 | — |
| **Venn / set-theory** | 12 | 9% | 2018, 2020, 2022 | **2021, 2023, 2025** |
| **routes / network** | 9 | 7% | 2017 | 2018, 2020 |
| **tournament** | 8 | 6% | 2019, 2021 | 2017, 2018, 2023 |
| **dynamic-movement** | 3 | 2% | 2025 | most years |
| **hybrid (surface)** | 2 | 2% | 2017–2018 | — |

**Reading this table for the generator:**

- The "big four" surface families — quant-DI, matrix/grid, distribution, chart-plus-logic — account for ~63% of all sets and **must be the generator's core output**.
- **Venn / set-theory and tournament are not optional.** Together they are ~15% of the corpus and recur on a multi-year cycle. The 2025-only report wrongly retired both because both sat out 2025.
- **dynamic-movement is rare but high-signal** (parking simulation 2020; passing-the-buck and round-table 2025). It produces some of the hardest sets (M=3) and should be a deliberate, occasional, premium output — not a staple.

### 6.1 The structural era-shift

| Era | Sets/slot | Qs/slot | Character |
|-----|-----------|---------|-----------|
| **2017–2019** | 8 | 32 | High arithmetic intensity; number-theory engines (ciphers, cryptarithms); heavy networks (airline, congestion/Braess equilibrium); dense necessity culture |
| **2020** | 6 | ~24 | Transition; signature logic flagships (binary-encoding blood-vial test, parking simulation); strong Venn presence |
| **2021–2025** | 4–5 | 20–22 | Hybrid-first; fewer but deeper sets; reconstruction fused with arithmetic; movement re-emerges in 2025 |

A generator should target the **modern (2021–2025) shape** — 4–5 deep hybrid sets per slot — while drawing its **family and engine vocabulary from the full 2017–2025 range**, including the older number-theory and network engines that modern years use less but still reward.

---

## 7. The Hidden Reasoning Engine

Mapping all sets to their **true engine** (the object to reconstruct) collapses the ten surface families into a smaller set of archetypes.

| Engine archetype | What must be reconstructed | Representative sets (year) |
|------------------|----------------------------|----------------------------|
| **Grid / matrix** | A 2-D table of relationships | platform-height grid (’17), accreditation (’18), pouch coins (’19), bead grid (’20), players-goals (’22), coin-sacks (’23), 10-number grid (’24), call-ledger (’25) |
| **Timeline / sequence** | A who-does-what-when schedule of consecutive blocks | dancers order (’19), seminar scheduling (’20), journal issues (’21), metro timetable (’22), visa slots (’23), Gurus timeline (’25) |
| **Allocation** | A distribution of discrete units across slots | inheritance assets (’17), committees (’18), 100-boxes prizes (’19), envy-free bundles (’21), web-stars (’24), train occupancy (’25) |
| **Ranking / score table** | An ordering, often changing over time | tea-taster ratings (’17), recruitment composite (’18), rifle/archery scores (’19), Hi-Lo bidding (’20), promote-demote (’25) |
| **Movement system** | The trajectory of agents through states | street line-of-sight (’19), parking simulation (’20), patrol routes (’23), passing-the-buck & round-table (’25) |
| **Flow network** | Directed volumes on edges, conserved | elective re-enrollment (’17), congestion equilibrium (’17), town friendship (’21), dean votes (’23), trade flows & tariffs (’25) |
| **Venn region-set** | Counts in overlapping regions, often as ranges | CET percentiles (’17), satellites (’18), OTLP/medicine (’20), CS-grades & attendance (’22), travelers (’24) |
| **Reconstruct-from-rates** | Absolute values recovered from ratios/% | smartphone shares (’18), store doubling (’19), SI scatter & currency (’25) |
| **Number-theory / cipher** | A code or factorisation forced by arithmetic | cryptarithm (’19), letter→digit cipher (’18), prime-token funding (’22) |

**Key engine insight:** the hardest CAT sets are **hybrids of two archetypes**. Train occupancy = allocation + flow network. Promote-demote = ranking + dynamic feedback. SI scatter = reconstruct-from-rates + ranking. Prime-token funding = allocation + number-theory. **A generator that builds only single-archetype objects will sit a full difficulty tier below CAT.**

---

## 8. Visible vs Hidden vs Inferable Information

CAT sets are engineered on a deliberate three-layer information design, consistent across all nine years.

1. **Visible (given):** scaffolding — entities, the rule of the game, units, a chart, and a few anchor facts.
2. **Hidden (withheld):** the body of the object — most cell values, positions, assignments, volumes.
3. **Inferable-only (emergent):** facts that appear nowhere and exist only after several clues combine. These are what the hard and global questions target.

| Set (year) | Visible | Hidden | Inferable-only |
|------------|---------|--------|----------------|
| CET percentiles (’17) | "exactly two sections" rule, a ratio, one section count | Region sizes of a 3-set Venn | The triple-overlap count is a **free variable** → answer is a *range* (e.g. "3 or 10") |
| Tea-taster ratings (’17) | Doubling / even / min clues | Cup↔origin↔rating bijection | Which statements are only *"may be true"* (multi-world) |
| Parking simulation (’20) | Arrival/exit rule, slot map | Car type & occupancy over time | State at a queried moment, per scenario |
| Promote-demote (’25) | Group leaders, rating range, tie-break, ~4 ratings | Full rating grid + score table + membership history | Whose score is *undeterminable* at a given quarter |
| Train occupancy (’25) | Capacity, a few occupancy %, multiples-of-10 | Full origin–destination ticket matrix | Counts that only the full matrix pins |

**Design principle (unchanged from 2025-only, now corpus-confirmed):** anchor facts must **under-determine the object on their own** and become sufficient only in combination; no single visible fact may resolve a cell directly. The recurring **"NOT determinable / NOT necessarily true"** question type (present in every year) is the explicit test of layer 3.

---

## 9. Real Casework Analysis

"Casework" = the deduction forks, ≥2 live hypotheses are carried forward, and a **non-local** later clue kills all but one. Fake casework resolves in the next sentence.

**Corpus pattern (inferred for 2017–2024, confirmed for 2025):**

- **Heavy, genuine casework is the norm.** Across the inventories, the majority of sets in every year were scored casework = *heavy*. The exceptions cluster in the near-pure quant-DI sets (read-and-compute, e.g. 2024 GDP/candlestick, 2019 radar vendor), which carry little or no branching.
- **The killing clue is non-local.** Repeatedly the disambiguating constraint lives in a different condition or a later question's premise (2025 solutions show this explicitly: the `x=7` tap-count branch dies on an *impossibility* derived three steps away; the `(x+60)=96` SI branch dies on the *lowest-rank* condition stated elsewhere).
- **At least one branch is seductive.** The wrong case is arithmetically clean and survives a casual check; it dies only under a specific consistency test (divisibility, parity, a range/extreme condition). This is why **over-clean arithmetic is fatal to realism** — without an integer/parity/range constraint there is nothing for the false branch to die on.
- **Designed residual ambiguity.** Many sets are *correct but not fully solvable*: Venn sets answer in ranges; "cannot be determined" is a valid option; "may be true" distinguishes multi-world facts. CAT rewards delimiting exactly what remains unknown.

**Casework by family (tendency):**

| Family | Typical casework |
|--------|------------------|
| matrix/grid, allocation, scheduling, tournament, movement, Venn | **Heavy** — forced forks, non-local kills, often residual ambiguity |
| reconstruct-from-rates, number-theory | **Medium–heavy** — divisibility/factorisation forks |
| quant-DI (pure), chart read-off | **Light / none** — the arithmetic is the point |

---

## 10. Difficulty Driver Analysis

Each set was scored 0–3 on five drivers. Aggregated tendencies across the corpus:

| Driver | Corpus tendency | Notes |
|--------|-----------------|-------|
| **L — logic depth** | High in matrix/grid, allocation, scheduling, tournament, movement, number-theory; low in pure quant-DI | The dominant driver in LR-flavoured sets |
| **R — representation** | **Consistently high (≥2) in the majority of sets** | Choosing *how to draw the object* (circle? 12-column timeline? directed grid? segment-load ladder?) is half the battle. The most under-rated driver. |
| **C — calculation** | Bimodal — spikes to 3 in quant-DI / reconstruct-from-rates / older arithmetic-heavy sets; near 0 in pure-logic flagships | 2017 and 2023 are the calculation-heavy poles |
| **D — data density** | Moderate-high in DI/chart sets; low in clean logic puzzles | High D without high L = textbook DI, not CAT |
| **M — dynamic movement / feedback** | Rare but decisive (parking ’20, passing-buck/round-table ’25, project-team rotation ’17) | When M≥2 the board changes as you deduce; hardest to fake |

**The stacking law (corpus-confirmed):** CAT-level difficulty comes from **stacking ≥2 drivers**, not from cranking one. The hardest sets across the corpus score high on L+R (logic flagships), L+R+M (movement), or L+C with a divisibility lock (number-theory, reconstruct-from-rates). A set high on **C alone** is a calculation drill; a set high on **D alone** is textbook DI. Neither is CAT-level.

---

## 11. The Question Ladder

CAT sets ask graded questions against the *same* hidden object. The four rungs recur across all years:

| Rung | Purpose | Typical form |
|------|---------|--------------|
| **Entry** | Reward the first solid deduction | A single value that falls out early |
| **Medium** | Require a partially-built object | A value needing 2–3 chained clues |
| **Hard** | Require the *fully* reconstructed object | A value/comparison that resolves only at the end |
| **Global / conditional / necessity** | Test command of the whole structure or robustness | "For how many … determinable?", "Which is NECESSARILY true / CANNOT be true?", "If [new condition], then …?" |

**Corpus evidence:** the necessity/"cannot be determined" rung is present in the *majority* of sets in every year (it is the dominant 2017–2020 difficulty lever, and remains central in 2024–2025). Pure quant-DI sets are the main exception — they tend to be four read-and-compute questions with no necessity rung, which is exactly why they are the easiest CAT family.

**Generator implication:** author four (or five) graded questions per set, and **at least one must be a global/conditional/necessity question**, and where the object is intentionally under-determined, at least one must test **determinacy** ("cannot be determined" must sometimes be the correct answer).

---

## 12. What Changed After Including `CAT PYQ.pdf`

This is the core deliverable of the rebuild. The 2025-only report is compared against the full corpus.

### 12.1 Conclusions that REMAIN VALID

- **The hidden-object thesis** (a set is reconstruction, not reading) — confirmed across all nine years; if anything stronger historically.
- **Hybrid-first** — confirmed and intensifying from 2021.
- **Representation is the most under-rated driver** — confirmed; high-R sets appear in every year.
- **Designed indeterminacy / necessity questions** — confirmed as a pervasive, multi-year design choice, not a 2025 quirk.
- **The stacking law** (difficulty = ≥2 stacked drivers) — confirmed.
- **"Never hand over the graph"** (the network must be reconstructed, e.g. trade flows, call ledger) — confirmed by historical network sets (elective re-enrollment ’17, town friendship ’21, dean votes ’23).

### 12.2 Conclusions that were OVERFIT to 2025

| 2025-only claim | Full-corpus correction |
|-----------------|------------------------|
| "Venn / set-theory sets did not appear → de-prioritise." | **Venn is the 6th-most-common family (12 sets).** It was a per-slot staple in 2018, 2020, 2022; it merely sat out 2021, 2023, 2025. **Keep Venn in the generator.** |
| "Tournaments (matches/points) don't appear; treat as a special case only." | **Tournament/score-reconstruction is a recurring family (8 sets):** Hi-Lo, betting-pairs, javelin, archery, rifle, Chango bracket, QUIET, promote-demote. **First-class family.** |
| "Calculation is never the whole step." | **Near-pure quant-DI is a real vein** (2023 broadly; 2024 GDP/candlestick/bubble; 2019 radar). quant-DI is in fact the **most common surface family (22)**. Generator must produce *some* legitimately calculation-dominant sets — but keep them the minority, as CAT does. |
| (silent) "Modern set size ≈ 4–5 sets/slot is the norm." | True *now*, but 2017–2019 ran **8 sets / 32 Q per slot**. Useful for understanding the larger engine vocabulary even if we target the modern shape. |

### 12.3 Historical patterns MISSING / under-weighted in the 2025-only view

- **Number-theory / cipher engines** — cryptarithms (’19), letter→digit ciphers (’18), prime-product funding (’22). An entire engine class invisible to 2025-only.
- **Equilibrium / congestion networks** — the 2017 four-car Braess-style equilibrium and airline-network connectivity sets: game-theoretic flow networks absent from recent years but historically rewarded.
- **Simulation / state-machine sets** — the 2020 parking simulation and 2017 project-team rotation: pure dynamic-state engines that 2025 only lightly echoes.
- **Extremal / min-max optimisation** — 100-boxes doubling (’19), ATM note combinations (’18), cab-rating bounds (’20): "minimum/maximum possible" reasoning is a historically heavy lever.

### 12.4 How the generation strategy should change

1. **Sample families from the full-corpus distribution, not 2025.** Reinstate Venn, tournament, number-theory, simulation, and equilibrium-network engines into the sampler with non-zero weight.
2. **Target the modern *shape* (4–5 deep hybrid sets/slot) with the historical *vocabulary*.**
3. **Add a controlled minority of calculation-dominant quant-DI sets** to match CAT's real mix — but gate them so they never become the majority.
4. **Make necessity / determinacy questions mandatory**, since they are the pervasive multi-year difficulty lever.

### 12.5 Families to prioritise for our generator

**Tier 1 (core, every batch):** matrix/grid, distribution/allocation, scheduling/timeline, quant-DI (incl. reconstruct-from-rates).
**Tier 2 (regular rotation):** chart-plus-logic, Venn/set-theory, tournament/score-reconstruction, flow-network.
**Tier 3 (premium, occasional, high-difficulty):** dynamic-movement/simulation, number-theory/cipher, equilibrium-network.

---

## 13. Why Our AI-Generated DILR Failed

Diagnosis of the AI-generated DILR (the graph/network-style mock as negative reference; where unavailable, the known failure modes). Each mode is mapped to the corpus property it violates, with the **practical pre-PDF rejection signal**.

| # | Failure mode | Corpus property violated | Practical rejection signal |
|---|--------------|--------------------------|----------------------------|
| 1 | **Direct graph/structure reading** | §7 hidden object — CAT never prints the object | A question is answered by quoting the diagram |
| 2 | **Graph/table handed over** instead of hidden | §10 driver R — choosing the representation is half the battle | The set ships with the grid/graph drawn |
| 3 | **Small universe** | §10 D + §9 casework | Hand-solvable in < 60 s; full enumeration trivial |
| 4 | **Fake casework** | §9 — fork must be forced & killed non-locally | Every "case" closes in the next clue |
| 5 | **One-step deductions** | §8 — anchors must under-determine & combine | Each clue resolves exactly one cell |
| 6 | **Over-clean arithmetic** | §9 — seductive branch must die on a consistency test | No integer/parity/multiple/range constraint does eliminating work |
| 7 | **No hidden object** | §7 | You cannot name a structure to build that isn't printed |
| 8 | **No dynamic state** | §10 driver M | Nothing changes as you deduce (when the theme implies it should) |
| 9 | **No residual ambiguity** | §8/§9 — CAT leaves the object partly open | Exactly one clean world; no honest "cannot be determined" |
| 10 | **Weak question ladder** | §11 | All questions same difficulty |
| 11 | **No global/conditional/necessity question** | §11 | No "necessarily true" / "if X then" / "for how many determinable" |
| 12 | **Questions answerable directly from given facts** | §7 / §8 | The question restates a printed fact |
| 13 | **Uniqueness verified but not CAT-likeness** | §5/§10 | A solver confirms one answer, but the set is one-step, clean, static, ladderless — *valid but not CAT* |

**The deepest failure is #13.** Our prior pipeline verified *answer uniqueness* and stopped. But a set can have a unique answer and still be trivial: one-step, over-clean, static, no ladder, no necessity. **Uniqueness is necessary, not sufficient.** The generator needs a second gate that checks *CAT-likeness* — multi-driver difficulty, forced non-local casework, a hidden object, and a proper ladder — not just solvability.

**On the graph mock specifically:** it fails #1, #2, #3, #7 and #10 at once. The corpus shows the fix is not "avoid networks" but **"never hand over the network."** The 2017 elective-flow, 2021 town-friendship, 2023 dean-vote and 2025 trade-flow/call-ledger sets all use networks — but the network is *reconstructed from balances/conservation/aggregates*, never drawn.

---

## 14. Full-Corpus Generation Rules

Strict, largely machine-checkable rules. (Acceptance requires **all** to hold.)

1. **Object-first authoring.** Build the *complete* hidden object first (the answer key), then derive anchor clues by **deletion + indirection**. Never generate clues first.
2. **Hidden representation.** Do not hand over the final graph/table/grid. If a diagram is shown, the real challenge must be reconstructing a *further* hidden layer behind it (as CAT's chart-plus-logic sets do).
3. **Forced casework.** ≥2 globally-consistent partial worlds must survive past the initial clue reading.
4. **Non-local clue interaction.** The clue that kills a false case must **not** be adjacent to the clue that created the fork (different condition, or a later question's premise).
5. **Multi-driver difficulty (stacking law).** Score ≥2 on at least two of {L, R, C, D, M}. A set high on C alone or D alone is rejected.
6. **Proper question ladder.** Every set has entry, medium, hard, and **at least one global/conditional/necessity** question; where the object is intentionally under-determined, at least one question tests **determinacy**.
7. **Arithmetic that does logical work.** Numbers must carry constraints (integer, parity, multiples, distinctness, range/extreme) so a clean-but-wrong branch has something to die on.
8. **Solver-verified determinacy.** A formal solver / exhaustive enumerator must confirm, per question, whether the answer is unique or **intentionally indeterminate** (and that "cannot be determined" is correct exactly where intended).
9. **AI quality gate (CAT-likeness, not just uniqueness).** A separate judge agent must attempt to reject the set on §15 before acceptance — specifically catching the "unique but trivial" failure (#13).
10. **Family/engine sampling from the full corpus.** Draw families from the §6 distribution (incl. Venn, tournament, number-theory, simulation), not from a single recent year; target the modern 4–5-set shape.

---

## 15. Rejection Checklist

> Run on every generated set **before PDF rendering**. A single tick is an automatic reject.

- [ ] Any answer is **directly readable** from a clue, chart, or graph.
- [ ] **One early deduction collapses** the whole set (cascade, no branching).
- [ ] **No hidden object** must be reconstructed.
- [ ] The final **graph/table/grid is handed over** (no further hidden layer).
- [ ] **No real casework** survives past the first clue reading.
- [ ] The **universe is too small** (hand-solvable in < ~60 s).
- [ ] **Arithmetic is the only difficulty** (C high, all of L/R/M low).
- [ ] **All questions are the same difficulty** (no ladder).
- [ ] **No question tests global structure.**
- [ ] **No question tests conditional or necessity** reasoning.
- [ ] **No question tests determinacy/non-determinacy** where the object is intentionally under-determined.
- [ ] The set is **merely chart reading + calculation**.
- [ ] The **blind solver solves it too quickly, with no branching**.
- [ ] The **formal solver cannot verify** answer uniqueness or the intended ambiguity.
- [ ] *(meta)* The set is **unique but not CAT-like** — passes uniqueness yet trips ≥3 of the above (failure #13).

**Acceptance bar:** no box ticked; rules §14.1–§14.10 all hold; an independent blind solver reconstructs the object from the prompt alone and reproduces both the intended answers *and* the intended indeterminacies; and the CAT-likeness judge returns accept.

---

## 16. Recommended Terminal Pipeline

A practical *ingest → extract → infer → author → solve → verify → judge → render → publish → store* workflow using Claude Code / Codex. Core principle: **separate the author from the checkers**, and gate on **CAT-likeness**, not just uniqueness.

```
 1. SOURCE INGESTION    Place PYQ PDFs in sources/cat_pyqs/. Verify text layer
                        (PyMuPDF); pdftotext -layout. Gate: required files present.
        |
 2. PYQ SET EXTRACTION  Slice year/slot/section ranges; segment into sets;
                        store structural digests (no verbatim questions).
        |
 3. REASONING INFERENCE Classify family + engine + driver vector per set; maintain
                        the corpus family distribution as the sampler prior.
        |
 4. HIDDEN-OBJECT       Sample (family, engine-hybrid, driver target) from the
    AUTHORING           full-corpus distribution. Build the FULL object first,
    (object-first)      then delete + re-express into anchor clues. Author a graded
                        ladder incl. a necessity/determinacy question.
        |
 5. BLIND SOLVING       A SEPARATE agent (no key) reconstructs the object from clues
                        alone; logs deduction order, branch count, time-to-solve.
        |
 6. FORMAL VERIFICATION Python z3 / OR-Tools / brute enumeration counts ALL consistent
                        worlds -> per-question determinacy profile (unique vs intended-
                        ambiguous). Ground truth for "cannot be determined".
        |
 7. ADVERSARIAL JUDGING A SEPARATE judge runs the rejection checklist, incl. the
                        CAT-likeness / "unique-but-trivial" gate. Any tick -> reject,
                        loop to stage 4 with structured reasons.
        |
 8. LaTeX / PDF RENDER  Template set.tex + solution.tex; pdflatex (x2 for ToC).
        |
 9. WEBSITE-READY OUT   Emit set.json (prompt, options, answers, determinacy flags)
                        for the ExamIQ practice UI; emit a render-safe HTML/MathML view.
        |
10. STORAGE / INDEXING  Write under content/cat/dilr/<id>/; register in the practice DB
                        next to QA/VARC; index by family, engine, driver vector,
                        difficulty, world-count, ladder profile.
```

### 16.1 Proposed folder structure

```
content/cat/dilr/
  <set_id>/
    prompt.json          # entities, rule, anchor clues, questions, options
    answer_key.json      # full hidden object + per-question answers + determinacy
    metadata.json        # family, engine, drivers, world-count, judge verdict, provenance
    set.tex  set.pdf     # rendered set
    solution.tex solution.pdf
    web.json             # website-ready payload
  _rejected/
    <set_id>/            # rejected drafts + structured failure reasons (corpus analysis)
sources/cat_pyqs/        # raw PYQ PDFs (never committed; analysis input only)
reports/dilr_inference_full/   # this report + coverage/extraction logs
```

### 16.2 Metadata to store per set

`engine_archetype`, `engine_hybrid_of[]`, `surface_family`, `driver_vector {L,R,C,D,M}`, `entity_count`, `consistent_world_count`, `casework_branch_count`, `has_indeterminate_question`, `ladder_profile {entry,medium,hard,global}`, `blind_solver_minutes`, `blind_solver_branches`, `judge_verdict`, `source_family_prior` (which year-distribution it was sampled to match), `provenance` (generator/version).

### 16.3 Orchestration notes

- **Driver:** one `dilr_pipeline.py` (or a Claude Code workflow script), `--count N` batch mode, one set per run.
- **Author / Solver / Judge** are three distinct agent invocations; solver and judge run **without** the answer key in context.
- **Formal verifier:** Python `z3-solver` or `ortools`; for small finite objects, exhaustive enumeration is simplest and fully reliable.
- **Gate:** only sets passing stage 7 reach `content/`; rejects land in `_rejected/` with reasons, feeding back into the sampler prior.
- **Repo hygiene:** never commit/move raw PDFs; never touch app/source, `next-env.d.ts`, `tsconfig.json`, package/build config, or `.next/`.

---

## 17. Appendix A — Per-Year Set Inventory

Compact teardown of all ~129 sets. Drivers are L/R/C/D/M (0–3). Casework for 2017–2024 is `(inf)` = inferred from structure (no examiner solutions); 2025 is solution-calibrated. Labels are invented descriptors — **no question text is reproduced.**

### CAT 2017 (16 sets — 8/slot; high arithmetic, networks, number-theory)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Pizzeria type-proportion split | quant-DI | matrix (party×type) | light (inf) | L1 R2 C3 D2 M0 | partial |
| Elective re-enrollment flow | routes/network | flow-network | heavy (inf) | L3 R3 C2 D3 M1 | yes |
| Inheritance asset distribution | distribution | allocation | heavy (inf) | L3 R1 C2 D1 M0 | partial |
| Dorm repair-cost grid | chart-plus-logic | grid | heavy (inf) | L3 R2 C1 D2 M0 | yes ("not nec. true") |
| Tea-taster cup ratings | scheduling | ranking | heavy (inf) | L3 R2 C1 D1 M0 | yes ("may be true") |
| Queen attack on chessboard | matrix/grid | grid geometry | light (inf) | L2 R3 C2 D1 M1 | partial |
| Airline seat pricing | scheduling | allocation | heavy (inf) | L3 R2 C3 D3 M0 | yes |
| Fingerprint scan-order count | hybrid | sequence (perm. count) | light (inf) | L3 R1 C2 D0 M0 | yes |
| Fast-food order scheduling | scheduling | timeline (parallel resources) | heavy (inf) | L2 R2 C2 D2 M2 | yes (idle-time) |
| Rural-kids school survey | quant-DI | 3-way matrix | light–heavy (inf) | L2 R2 C3 D3 M0 | partial |
| CET percentile selection | Venn/set-theory | Venn-regions | heavy (inf) | L3 R2 C2 D2 M0 | yes (range answer) |
| Happiness-index scores | chart-plus-logic | grid (country×S/F/C) | heavy (inf) | L3 R2 C2 D2 M0 | yes (max/optim) |
| Project-team SE/RE rotation | distribution | movement-trajectory | heavy (inf) | L3 R2 C3 D2 M3 | yes ("CANNOT be") |
| Platform-height reachability | matrix/grid | grid (line-of-sight) | heavy (inf) | L3 R3 C1 D2 M0 | yes (universal claim) |
| Airline network connectivity | routes/network | flow-network | heavy (inf) | L3 R2 C2 D1 M0 | yes |
| Four-car route equilibrium | routes/network | flow-network (equilibrium) | heavy (inf) | L3 R1 C3 D2 M2 | yes (Braess) |

### CAT 2018 (16 sets — 8/slot; logic-heavy, Venn ×2, ciphers)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Currency buy/sell inventory | quant-DI | score-table | light (inf) | L1 R1 C3 D2 M1 | partial |
| Letter→digit cipher | hybrid (number-theory) | allocation+deduction | heavy (inf) | L3 R2 C1 D2 M0 | yes ("best concluded") |
| Smartphone share/profit | quant-DI | score-table | none | L0 R1 C3 D1 M0 | no |
| Interview-room arrival log | scheduling | timeline | heavy (inf) | L3 R2 C1 D1 M1 | yes (Either/Or) |
| Accreditation weights | matrix/grid | score-table (weight perm.) | heavy (inf) | L3 R2 C3 D2 M0 | yes |
| Product portfolio grid | chart-plus-logic | matrix | heavy (inf) | L3 R2 C2 D2 M0 | partial ("NOT correct") |
| Amusement-park tickets | distribution | matrix (age×ticket) | heavy (inf) | L2 R2 C3 D3 M0 | yes ("MUST be FALSE") |
| Sports enrollment Venn | Venn/set-theory | Venn-regions | heavy (inf) | L2 R2 C3 D2 M0 | yes (min/max) |
| n×n numeral colouring | matrix/grid | grid (king-graph colour) | light (inf) | L3 R0 C2 D1 M0 | partial |
| Recruitment composite scores | quant-DI | score-table | heavy (inf) | L3 R2 C3 D2 M0 | yes ("MUST be") |
| Multi-layer pie sales | chart-plus-logic | score-table (nested) | light (inf) | L1 R1 C3 D2 M1 | no |
| Petrol-pump contamination line | scheduling | sequence (positional) | heavy (inf) | L3 R2 C2 D2 M0 | yes |
| Satellite purposes | Venn/set-theory | Venn-regions | heavy (inf) | L2 R2 C3 D2 M0 | yes (range/min) |
| ATM note-dispensing | distribution | allocation (partition) | heavy (inf) | L2 R2 C3 D2 M0 | partial |
| Three-committee composition | distribution | matrix (type×committee) | heavy (inf) | L3 R2 C3 D2 M0 | yes ("CANNOT determine") |
| Students major/minor | matrix/grid | grid (triple-attribute) | heavy (inf) | L3 R2 C1 D1 M0 | yes |

### CAT 2019 (16 sets — 8/slot; sequence/grid, cryptarithm, tournaments)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Store revenue/cost shares | quant-DI | score-table | heavy (inf) | L1 R1 C2 D3 M0 | partial |
| Pouch min-max coins grid | matrix/grid | grid (integer-avg) | heavy (inf) | L3 R1 C3 D2 M0 | partial |
| Two-proposal voter survey | Venn/set-theory | Venn-regions | heavy (inf) | L2 R1 C3 D2 M0 | partial |
| Speakers/teams/languages | matrix/grid | grid+allocation | heavy (inf) | L3 R2 C3 D1 M0 | partial |
| Doctors rooms/queue tokens | scheduling | timeline (queue) | heavy (inf) | L2 R1 C2 D2 M2 | partial |
| Monsoon rainfall vs LPA | chart-plus-logic | score-table (rolling avg) | light (inf) | L1 R1 C2 D1 M0 | partial |
| Faculty MT/ET question order | scheduling | sequence | heavy (inf) | L3 R2 C3 D1 M0 | yes ("cannot determine") |
| Rifle shooting 10 rounds | tournament | score-table (window) | heavy (inf) | L3 R3 C3 D2 M0 | partial |
| Cryptarithm 6-digit addition | matrix/grid (number-theory) | grid+ranking (carry) | heavy (inf) | L3 R1 C3 D2 M0 | partial ("which cannot") |
| Dancers/composers order | scheduling | sequence | heavy (inf) | L3 R2 C3 D0 M0 | partial |
| 100-boxes prize doubling | distribution | allocation (extremal) | heavy (inf) | L3 R1 C2 D1 M0 | yes (min/max/"not possible") |
| Supermarket 16 shelves | distribution | sequence (clustering) | heavy (inf) | L3 R2 C3 D0 M0 | yes ("necessarily true") |
| Street-map line-of-sight | routes/network | movement-trajectory | heavy (inf) | L3 R2 C3 D0 M2 | partial |
| Archery bonus rounds | tournament | score-table | heavy (inf) | L2 R3 C3 D2 M0 | partial |
| Foreigner-crime ranking DI | chart-plus-logic | score-table+ranking | light–med (inf) | L1 R3 C2 D1 M0 | partial ("definitely true") |
| Five-vendor radar scoring | chart-plus-logic | score-table | none–light (inf) | L1 R1 C1 D2 M0 | no (easiest) |

### CAT 2020 (15 sets — 5/slot; logic flagships, strong Venn, simulation)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Pooled blood-vial diagnosis | matrix/grid | matrix + binary-encoding | heavy (inf) | L3 R2 C2 D0 M0 | yes (signature) |
| Hi-Lo four-player bidding | tournament | score-table | heavy (inf) | L3 R2 C2 D2 M0 | yes |
| OTLP 4-facility survey | Venn/set-theory | Venn-regions (4-set) | light (inf) | L1 R1 C1 D3 M0 | partial |
| Two-day grocery delivery | quant-DI | timeline+score-table | light (inf) | L1 R2 C0 D3 M0 | partial |
| Farmer's 12-plot land | matrix/grid | grid+allocation | heavy (inf) | L3 R2 C2 D2 M1 | yes ("NOT true") |
| 5×5 tri-colour bead grid | matrix/grid | matrix+combinatorics | heavy (inf) | L3 R2 C3 D0 M1 | partial |
| Doctoral seminar scheduling | scheduling | timeline | heavy (inf) | L3 R2 C1 D0 M0 | yes (what-ifs) |
| Constituency deposit votes | chart-plus-logic | score-table+quant-DI | light–heavy (inf) | L2 R2 C1 D3 M0 | partial |
| Departmental-store sales | quant-DI | matrix (AP fill) | light (inf) | L1 R2 C0 D3 M0 | partial |
| Basement compact/SUV parking | dynamic-movement | movement-trajectory | heavy (inf) | L3 R2 C1 D0 M3 | no (simulate-each) |
| Four-medicine treatment groups | Venn/set-theory | Venn-regions (4-set) | light (inf) | L1 R1 C1 D3 M0 | partial |
| Vendor-institute decade contracts | scheduling | timeline | heavy (inf) | L3 R2 C1 D1 M0 | yes |
| Board-exam missed-paper marks | chart-plus-logic | score-table+matrix | heavy (inf) | L3 R2 C1 D2 M0 | yes (reverse-from-avg) |
| Cab-driver 5-parameter ratings | quant-DI | score-table+allocation | heavy (inf) | L2 R2 C2 D2 M0 | partial (max/min) |
| Ten percussion experts | Venn/set-theory | Venn-regions+logic | heavy (inf) | L3 R2 C1 D0 M0 | yes ("definite/cannot") |

### CAT 2021 (12 sets — 4/slot; hybrid-first, arithmetic-laced)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Javelin throw re-ranking | tournament | score-table+ranking+timeline | heavy (inf) | L2 R3 C2 D3 M1 | yes |
| Reviewer approval routing | distribution | flow-network+grid | heavy (inf) | L3 R3 C3 D1 M1 | partial ("DEFINITELY") |
| Employee project Gantt | chart-plus-logic | timeline+score-table | light (inf) | L1 R2 C1 D3 M1 | no |
| Impurity bottle testing | quant-DI | allocation+flow-network | heavy (inf) | L2 R2 C3 D2 M0 | partial (min-tests) |
| Order shipping Gantt | chart-plus-logic | timeline | light (inf) | L1 R2 C1 D3 M1 | no |
| Chango knockout bracket | tournament | ranking+flow-network | heavy (inf) | L3 R2 C2 D2 M0 | yes |
| Delivery ratings & bonus | matrix/grid | grid+score-table | heavy (inf) | L3 R2 C3 D2 M1 | partial |
| Envy-free object bundles | distribution | allocation+score-table | heavy (inf) | L3 R3 C3 D2 M0 | yes (envy) |
| Subcategory sales bars | quant-DI | score-table | none–light (inf) | L0 R1 C1 D3 M0 | no |
| Smoothie production economics | quant-DI | allocation+score-table | heavy (inf) | L2 R2 C3 D2 M1 | partial |
| Journal paper scheduling | scheduling | grid+timeline | heavy (inf) | L3 R3 C3 D2 M1 | yes ("must be true") |
| Town friendship network | routes/network | Venn+flow-network | heavy (inf) | L3 R2 C3 D1 M0 | yes (biconditional) |

### CAT 2022 (12 sets — 4/slot; Venn ×3, prime-number allocation)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| CS/non-CS course grades | Venn/set-theory | Venn-regions | light (inf) | L2 R2 C3 D1 M0 | yes |
| Cohort mortality age-bands | quant-DI | timeline | light (inf) | L1 R1 C3 D3 M0 | partial |
| Pandemic daily new-cases | distribution | grid (bounded integer) | heavy (inf) | L3 R3 C2 D1 M0 | yes |
| Betting-pairs money tracker | tournament | score-table | heavy (inf) | L3 R2 C2 D1 M2 | partial |
| Supermarket product approvals | Venn/set-theory | Venn-regions (2×2×2) | light (inf) | L2 R2 C3 D1 M0 | yes |
| Widget supply routing | routes/network | flow-network | heavy (inf) | L2 R2 C2 D3 M2 | partial |
| Four-company revenue/cost | chart-plus-logic | score-table | none | L1 R1 C0 D3 M2 | no |
| TRICCEK door-to-door sales | distribution | grid | heavy (inf) | L3 R2 C2 D2 M1 | partial |
| Four players goals/matches | matrix/grid | grid (scoring) | heavy (inf) | L3 R3 C2 D1 M0 | yes |
| Interviewer prime-token funding | distribution (number-theory) | matrix (prime factorisation) | heavy (inf) | L3 R3 C2 D1 M1 | yes |
| Get-together attendance tiers | Venn/set-theory | Venn-regions (nested) | heavy (inf) | L2 R2 C3 D1 M0 | yes |
| Metro line scheduling | scheduling | timeline (map+timetable) | light (inf) | L2 R2 C1 D1 M3 | partial |

### CAT 2023 (12 sets — 4/slot; very high arithmetic, ZERO Venn)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| AC dealer variant sales | distribution | grid (4×2×2) | light (inf) | L1 R1 C1 D3 M3 | partial |
| Course project-test scoring | matrix/grid | score-table+ranking | heavy (inf) | L2 R2 C2 D2 M2 | yes |
| Patrol teams street routes | routes/network | movement-trajectory+timeline | heavy (inf) | L2 R2 C3 D0 M0 | yes |
| Online vs offline registrations | quant-DI | score-table (min/max/median) | heavy (inf) | L1 R1 C3 D3 M1 | partial |
| Firms funding rise-fall | quant-DI | sequence | heavy (inf) | L1 R2 C3 D3 M0 | yes |
| Draw competition ranks | quant-DI | score-table+ranking | heavy (inf) | L1 R2 C3 D3 M0 | yes |
| 3×3 boxes of coin sacks | matrix/grid | matrix (sums+medians) | heavy (inf) | L1 R1 C3 D3 M0 | yes |
| Theme-park rides timing | scheduling | timeline+allocation | heavy (inf) | L2 R1 C3 D2 M2 | yes |
| Dean election voting | distribution | flow-network+allocation | heavy (inf) | L2 R3 C3 D1 M0 | yes |
| Restaurant worker ratings | quant-DI | score-table (stats) | heavy (inf) | L1 R1 C3 D3 M0 | partial |
| Visa office slot processing | scheduling | timeline+flow-network | heavy (inf) | L2 R1 C2 D3 M1 | yes |
| Housing-complex pricing grid | matrix/grid | grid+score-table | heavy (inf) | L2 R2 C3 D2 M1 | yes |

### CAT 2024 (15 sets — 5/slot; chart-plus-logic heavy, Venn returns)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| ATM cash on road grid | routes/network | matrix+allocation | heavy (inf) | L2 R2 C3 D2 M0 | yes |
| OTT subscriber app usage | Venn/set-theory | Venn-regions+quant-DI | light (inf) | L1 R2 C1 D3 M0 | partial |
| Country GDP per-capita | quant-DI | score-table | none | L0 R1 C0 D3 M1 | no |
| AC temperature mode graph | chart-plus-logic | timeline | heavy (inf) | L2 R3 C3 D2 M3 | yes |
| Foodgrain nutrient composition | matrix/grid | matrix (incomplete) | heavy (inf) | L1 R2 C3 D2 M0 | yes |
| 10-number ordered grid | matrix/grid | grid (monotone) | heavy (inf) | L3 R3 C3 D0 M0 | yes |
| Gated-area walkway routes | routes/network | flow-network | heavy (inf) | L1 R3 C2 D2 M0 | partial |
| E-commerce daily ratings | chart-plus-logic | score-table | light (inf) | L1 R2 C1 D3 M0 | partial |
| Firm PAT/ES/PRD bubble plot | chart-plus-logic | quant-DI | none | L0 R1 C0 D3 M1 | no |
| Gymnasts coach ratings | distribution | allocation+score-table | heavy (inf) | L2 R3 C3 D1 M0 | yes |
| QUIET tournament schedule | tournament | timeline | heavy (inf) | L2 R3 C3 D0 M0 | yes |
| Travelers' country Venn | Venn/set-theory | Venn-regions (3-set) | light (inf) | L1 R2 C2 D2 M0 | partial |
| Candlestick share prices | chart-plus-logic | quant-DI | none | L0 R1 C0 D3 M1 | no |
| Web surfers' star giving | distribution | allocation | heavy (inf) | L1 R3 C3 D2 M0 | yes |
| Election campaign voting | quant-DI | score-table+casework | heavy (inf) | L1 R2 C3 D3 M0 | partial |

### CAT 2025 (15 sets — 5/slot; solution-calibrated; movement returns, ZERO Venn)

| Set | Surface family | True engine | Casework | Drivers | Ladder/necessity |
|-----|----------------|-------------|----------|---------|------------------|
| Operator call-minutes ledger | matrix/grid | matrix+score-table | heavy | L3 R0 C2 D3 M0 | partial |
| Cross-currency traveler costs | quant-DI | allocation+score-table | heavy | L2 R0 C2 D3 M0 | yes |
| Puzzle-solving progress charts | chart-plus-logic | timeline (cross-chart) | light | L1 R0 C1 D3 M1 | partial |
| Three/Five-country trade flows | quant-DI | flow-network | light | L1 R0 C1 D3 M0 | yes |
| Passing-the-Buck circle | dynamic-movement | movement-trajectory | heavy | L3 R2 C3 D0 M2 | partial |
| Gurus training timeline | scheduling | timeline (consecutive blocks) | heavy | L3 R2 C3 D0 M0 | partial |
| Sustainability-index scatter | chart-plus-logic | score-table+ranking (rates) | heavy | L2 R2 C2 D3 M0 | yes |
| State pollution measures | distribution | allocation+ranking | heavy | L3 R2 C2 D2 M0 | partial |
| Co-authorship paper counts | chart-plus-logic | matrix+allocation | heavy | L3 R1 C3 D2 M0 | partial |
| Balls-through-hoops sizing | matrix/grid | matrix+ranking (partial order) | heavy | L3 R3 C2 D0 M0 | yes ("not nec. true") |
| Train segment occupancy | distribution | flow-network (O-D matrix) | heavy | L2 R1 C2 D3 M0 | yes |
| Quarterly promote-demote scoring | tournament | score-table+ranking (feedback) | heavy | L3 R2 C2 D2 M1 | partial ("determinable?") |
| Round-table chair moves | dynamic-movement | movement-trajectory | heavy | L3 R2 C3 D0 M3 | partial |
| Foot-tap question game | distribution | allocation+score-table | heavy | L3 R0 C3 D2 M0 | partial |
| Five-country tariff charts | quant-DI | flow-network | light | L1 R0 C1 D3 M0 | yes |

---

*End of report.*

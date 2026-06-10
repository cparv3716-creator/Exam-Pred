# Full Stage 9 Prediction Portfolio Pipeline Summary

## What Data Was Used

- Papers loaded: 66
- PYQ QA questions loaded: 540
- Section pattern rows loaded: 750

## How Specs Were Created

- Prediction specs created: 37
- QA specs use Stage 4 subtopic/archetype signals.
- DILR specs are set-level, not isolated-question specs.
- VARC specs are passage/question-intention specs.

## How Candidates Were Generated

- Candidate rows currently in database: 178
- Without an API/local model, Stage 9 writes prompt batches and a manual import template.
- Candidate generation is internal only; final user-facing output remains limited.

## How Verification And Scoring Worked

- Candidate score rows: 178
- Verification checks missing answer, missing solution, incomplete MCQ options, direct formula wording, and basic structure.
- Scoring combines prediction score, evidence strength, CAT-likeness, depth, difficulty match, trap quality, solution clarity, coverage gain, and redundancy.

## How Variants Were Assembled

- Variants created: 5
- Candidate placements: 110
- Authoritative selected pool: 65
- Selected from LaTeX pool: 26
- Selected paper-eligible candidates: 37
- Specs represented: 19
- Assembly readiness override: ALLOWED WITH RISK FLAGS

## Coverage Risk

**CAT_QA_SPEC_14 Circles remains under-covered; final paper variants should not force a weak circle candidate unless required by portfolio diversity.**

Rejected Circles candidates were not reclassified or forced into the assembled variants.

## How Backtesting Adjusted Weights

- Backtest rows: 20
- Backtest scores adjust final portfolio weights, especially frequency versus CAT-likeness and diversity.

## What The Final Output Means

The Stage 9 output is a high-precision portfolio engine scaffold. It is ready to accept manually generated or locally generated candidate questions, verify and score them, remove weak/duplicate rows, assemble variants, backtest, adjust weights, and export final recommended papers.

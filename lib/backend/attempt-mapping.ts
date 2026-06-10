import type { LatexSourcePracticeQuestion } from "@/types/latex-practice";
import type { VarcSourceQuestion } from "@/types/varc-practice";

/**
 * Safe mapping from existing question metadata to attempt-tracking fields.
 * Only uses data that already exists on the question — nothing is invented.
 * Computed server-side and passed to the client attempt controls as plain data.
 */
export type AttemptMeta = {
  exam: string;
  section: string;
  questionId: string;
  questionSource: string;
  /** Display string for the answer (already-authored content). */
  correctAnswerDisplay: string;
  /** Option key used for grading (e.g. "A" or "1"), or null when not gradable. */
  correctKey: string | null;
  /** Selectable option keys/labels in display order. */
  optionKeys: string[];
  difficulty: string | null;
  topic: string | null;
  subtopic: string | null;
  /** True when a single-select check can be graded. */
  gradable: boolean;
};

const QUANT_LETTERS = ["A", "B", "C", "D"] as const;
const VARC_LETTERS = ["A", "B", "C", "D", "E"] as const;

/** Pull a leading option letter (A–E) out of an answer string like "(B) $18.5$." */
function extractOptionLetter(answer: string, maxIndex: number): string | null {
  const trimmed = (answer ?? "").trim();
  const match =
    trimmed.match(/^\(?\s*([A-Ea-e])\s*[).:\-]/) ?? trimmed.match(/^\(?\s*([A-Ea-e])\)?\.?$/);
  if (!match) return null;
  const letter = match[1].toUpperCase();
  const idx = "ABCDE".indexOf(letter);
  return idx >= 0 && idx < maxIndex ? letter : null;
}

export function resolveQuantAttemptMeta(question: LatexSourcePracticeQuestion): AttemptMeta {
  const raw = [
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
  ];
  const optionKeys: string[] = raw
    .map((opt, i) => ({ key: QUANT_LETTERS[i] as string, has: Boolean(opt?.trim()) }))
    .filter((o) => o.has)
    .map((o) => o.key);

  const letter = optionKeys.length ? extractOptionLetter(question.correct_answer_markdown, optionKeys.length) : null;
  const correctKey = letter && optionKeys.includes(letter) ? letter : null;

  return {
    exam: "CAT",
    section: "Quant",
    questionId: question.question_id,
    questionSource: "quant_latex_source",
    correctAnswerDisplay: (question.correct_answer_markdown ?? "").trim(),
    correctKey,
    optionKeys,
    difficulty: question.difficulty || null,
    topic: question.topic || null,
    subtopic: question.subtopic || null,
    gradable: Boolean(correctKey),
  };
}

export function resolveVarcAttemptMeta(question: VarcSourceQuestion): AttemptMeta {
  const isTita = question.varc_type === "Para Jumble" || question.varc_type === "Odd Sentence Out";
  const raw = [
    question.option_a_markdown,
    question.option_b_markdown,
    question.option_c_markdown,
    question.option_d_markdown,
    question.option_e_markdown,
  ];
  const optionKeys: string[] = raw
    .map((opt, i) => ({ key: isTita ? String(i + 1) : (VARC_LETTERS[i] as string), has: Boolean(opt?.trim()) }))
    .filter((o) => o.has)
    .map((o) => o.key);

  const answer = (question.correct_answer ?? "").trim();
  let correctKey: string | null = null;
  if (question.varc_type === "Para Jumble") {
    correctKey = null; // sequence answer — not single-select
  } else if (question.varc_type === "Odd Sentence Out") {
    correctKey = optionKeys.includes(answer) ? answer : null;
  } else {
    const letter = answer.toUpperCase();
    correctKey = /^[A-E]$/.test(letter) && optionKeys.includes(letter) ? letter : null;
  }

  return {
    exam: "CAT",
    section: "VARC",
    questionId: question.question_id,
    questionSource: "varc_source",
    correctAnswerDisplay: answer,
    correctKey,
    optionKeys,
    difficulty: question.difficulty || null,
    topic: question.topic || null,
    subtopic: question.subtopic || null,
    gradable: Boolean(correctKey),
  };
}

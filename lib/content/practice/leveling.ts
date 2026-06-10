import type { GeneratedPracticeQuestion, PracticeAccessTier, PracticeLevel, ProbabilityBucket } from "@/types/practice";

export type PracticeLevelInput = {
  difficulty?: string;
  quality_tier?: string;
  pool_type?: string;
  question_text?: string;
  subtopic?: string;
  tags?: string[] | string;
  is_free?: boolean;
  is_premium?: boolean;
  source_reference?: string;
};

export function assignPracticeLevel(question: PracticeLevelInput): PracticeLevel {
  const difficulty = normalize(question.difficulty);
  const qualityTier = normalize(question.quality_tier);
  const poolType = normalize(question.pool_type);
  const source = normalize(question.source_reference);
  const text = normalize(`${question.question_text ?? ""} ${question.subtopic ?? ""} ${source}`);
  const tags = normalize(tagsText(question.tags));
  const hardEndSignals = [
    "hard-end",
    "hard end",
    "simulation",
    "method-selection",
    "method selection",
    "brute-force resistance",
    "brute force resistance",
    "multi-condition",
    "multi condition",
    "false-start",
    "false start",
    "tough practice",
  ];

  const directFoundation =
    textIncludesAny(text, ["formula", "concept", "foundation", "direct", "basic", "straightforward"]) ||
    textIncludesAny(tags, ["formula", "concept", "foundation", "direct", "basic"]);
  const methodSelection =
    textIncludesAny(text, hardEndSignals) ||
    textIncludesAny(tags, hardEndSignals);

  if (difficulty.includes("very hard")) return "Advanced";

  if (
    qualityTier === "accept_tough_practice" ||
    qualityTier === "accept_simulation" ||
    poolType === "tough_practice" ||
    poolType === "simulation" ||
    methodSelection
  ) {
    return "Advanced";
  }

  if (
    difficulty === "medium-hard" ||
    difficulty.includes("hard") ||
    qualityTier === "accept_cat_level_practice" ||
    poolType === "cat_level_practice"
  ) {
    return "Intermediate";
  }

  if (
    (difficulty === "easy" || difficulty === "medium" || directFoundation) &&
    !difficulty.includes("hard") &&
    poolType !== "tough_practice" &&
    poolType !== "simulation"
  ) {
    return "Beginner";
  }

  return "Intermediate";
}

export function assignAccessTier(question: PracticeLevelInput & { practice_level?: PracticeLevel }): PracticeAccessTier {
  if (question.practice_level === "Beginner") return "free";
  if (question.practice_level === "Advanced") return "premium";
  if (question.practice_level === "Intermediate") return "free_limited";
  return question.is_free ? "free" : "premium";
}

export const assignPracticeAccessTier = assignAccessTier;

export function cleanGeneratedPracticeQuestion(question: GeneratedPracticeQuestion): GeneratedPracticeQuestion {
  const cleanupNotes = new Set(question.cleanup_notes ?? []);
  const fields = ["question_text", "option_a", "option_b", "option_c", "option_d", "detailed_solution", "topic", "subtopic"] as const;
  const next = { ...question, cleanup_notes: [...cleanupNotes] };

  for (const field of fields) {
    const original = next[field];
    const cleaned = field.startsWith("option_")
      ? cleanGeneratedOption(original, next.topic, next.subtopic)
      : cleanGeneratedText(original, field === "detailed_solution");
    if (cleaned !== original) {
      next[field] = cleaned;
      cleanupNotes.add(`${field} leakage cleaned`);
    }
  }

  next.topic = cleanTopicLabel(next.topic) || "Unmapped";
  next.subtopic = cleanTopicLabel(next.subtopic) || "Unmapped";
  next.tags = next.tags.map((tag) => cleanTopicLabel(tag)).filter(Boolean);
  next.topic_group = getTopicGroup(next.topic, next.subtopic, next.tags);
  next.practice_level = assignPracticeLevel(next);
  next.access_tier = assignAccessTier(next);
  next.is_free = next.access_tier === "free";
  next.is_premium = next.access_tier === "premium";
  next.cleanup_notes = Array.from(cleanupNotes).sort();

  return next;
}

export function getTopicGroup(topic: string, subtopic: string, tags: string[] = []) {
  const haystack = normalize(`${topic} ${subtopic} ${tags.join(" ")}`);
  if (textIncludesAny(haystack, ["p&c", "pnc", "permutation", "combination", "probability", "modern math"])) return "P&C / Probability";
  if (haystack.includes("arithmetic")) return "Arithmetic";
  if (haystack.includes("algebra")) return "Algebra";
  if (haystack.includes("geometry") || haystack.includes("mensuration")) return "Geometry";
  if (haystack.includes("number")) return "Number System";
  return topic || "Unmapped";
}

export function getProbabilityMeta(row: Record<string, unknown>): Pick<
  GeneratedPracticeQuestion,
  "topic_probability_score" | "topic_probability_bucket" | "exam_likelihood_label"
> {
  const rawScore =
    parseScore(row.topic_probability_score) ??
    parseScore(row.topic_probability) ??
    parseScore(row.probability_score) ??
    parseScore(row.exam_likelihood);

  if (rawScore === null) {
    return {
      topic_probability_score: null,
      topic_probability_bucket: "not_scored",
      exam_likelihood_label: "Not probability-scored yet",
    };
  }

  const score = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
  return {
    topic_probability_score: score,
    topic_probability_bucket: probabilityBucket(score),
    exam_likelihood_label: score >= 75 ? "High exam likelihood" : score >= 45 ? "Moderate exam likelihood" : "Lower exam likelihood",
  };
}

function probabilityBucket(score: number): ProbabilityBucket {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function tagsText(tags: PracticeLevelInput["tags"]) {
  if (Array.isArray(tags)) return tags.join(" ");
  return tags ?? "";
}

function parseScore(input: unknown) {
  if (input === null || input === undefined || input === "") return null;
  const parsed = Number(String(input).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function normalize(input: unknown) {
  return String(input ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function textIncludesAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

function cleanGeneratedOption(input: string, topic: string, subtopic: string) {
  let cleaned = stripLeakageFragments(input);
  const isolatedLeakWords = [
    "Algebra",
    "Number System",
    "Geometry / Mensuration",
    "Geometry/Mensuration",
    "Arithmetic",
    "Modern Math",
    "Modern Math / Probability",
    "Modern Math / P&C / Counting",
    topic,
    subtopic,
  ].filter(Boolean);

  if (isolatedLeakWords.some((word) => cleanComparable(cleaned) === cleanComparable(word))) {
    cleaned = "";
  }

  return normalizeSpacing(cleaned);
}

function cleanGeneratedText(input: string, multiline = false) {
  const stripped = stripLeakageFragments(input);
  const lines = stripped
    .split(/\r?\n/)
    .map((line) => stripMetadataLine(line))
    .filter((line) => line.trim());
  return normalizeSpacing(multiline ? lines.join("\n") : lines.join(" "));
}

function stripLeakageFragments(input: string) {
  let output = String(input ?? "");
  const trailingMarkers = [
    "CAT-Hardened QA Simulation Batch",
    "CAT Hardened Quant Practice Simulation Set",
    "CAT-Hardened Quant Practice",
    "Topic:",
    "Difficulty:",
    "Type:",
    "Question Paper",
    "Answer Key",
    "Topic-Wise Distribution",
    "Quality Verification Summary",
  ];

  for (const marker of trailingMarkers) {
    output = truncateAtMarker(output, marker);
  }

  output = output
    .replace(/\bPage\s+\d+\s*(of\s+\d+)?\b/gi, "")
    .replace(/\bBatch\s+\d+\b/gi, "")
    .replace(/\bSource\s*:\s*.*$/gim, "");

  return output;
}

function stripMetadataLine(input: string) {
  const normalized = input.trim();
  if (/^(topic|difficulty|type|question paper|answer key|topic-wise distribution|quality verification summary)\s*:/i.test(normalized)) return "";
  if (/^cat[- ]hardened/i.test(normalized)) return "";
  return normalized;
}

function truncateAtMarker(input: string, marker: string) {
  const index = input.toLowerCase().indexOf(marker.toLowerCase());
  return index >= 0 ? input.slice(0, index) : input;
}

function cleanTopicLabel(input: string) {
  return normalizeSpacing(stripMetadataLine(stripLeakageFragments(input)));
}

function normalizeSpacing(input: string) {
  return String(input ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanComparable(input: string) {
  return normalizeSpacing(input).toLowerCase();
}

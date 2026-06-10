export const pyqTextCleanerFields = [
  "question_text",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "detailed_solution",
  "correct_answer",
] as const;

export type PyqTextCleanerField = (typeof pyqTextCleanerFields)[number];

export type PyqCleaningWarningCode =
  | "boilerplate_removed"
  | "possible_dirty_text"
  | "suspicious_option_text"
  | "suspicious_question_text";

export type PyqCleaningWarning = {
  code: PyqCleaningWarningCode;
  field: PyqTextCleanerField;
  message: string;
};

export type PyqRowCleaningResult<T extends Record<string, unknown>> = {
  row: T;
  changedFields: PyqTextCleanerField[];
  warnings: PyqCleaningWarning[];
  needsManualReview: boolean;
};

const boilerplateMarkers = [
  "online.2iim.com",
  "www.2iim.com",
  "2iim.com",
  "back to question",
  "video solution",
  "difficulty level",
  "for more cat level questions",
  "questions.2iim.com",
  "actual cat",
  "question paper",
  "answer actual cat",
  "back to",
  "online.",
];

const tailMarkers = [
  /online\.2iim\.com/i,
  /www\.2iim\.com/i,
  /questions\.2iim\.com/i,
  /back\s+to\s+question/i,
  /video\s+solution/i,
  /difficulty\s+level/i,
  /for\s+more\s+cat\s+level\s+questions/i,
  /click\s*(?:->|→)?\s*questions\.2iim\.com/i,
  /actual\s+cat/i,
  /answer\s+actual\s+cat/i,
];

const removalPatterns = [
  /---\s*page\s+\d+\s*---/gi,
  /\bpage\s+\d+\b/gi,
  /\btopic\s*[-–]\s*/gi,
  /\bclick\s+to\s+go\s+["'`“”]*back\s+to\s+question["'`“”]*/gi,
  /\bclick\s+to\s+see\s+["'`“”]*overall\s+solution\s+page["'`“”]*/gi,
  /\bquestions\s+from\s+2iim\s+question\s+bank\b/gi,
  /\bfor\s+more\s+cat\s+level\s+questions\b/gi,
  /\bclick\s*(?:->|→)?\s*questions\.2iim\.com\b/gi,
  /\bonline\.2iim\.com\b/gi,
  /\bwww\.2iim\.com\b/gi,
  /\b2iim\.com\b/gi,
  /\bback\s+to\s+question\b/gi,
  /\bvideo\s+solution\b/gi,
  /\bdifficulty\s+level\b/gi,
  /\bactual\s+cat\s+\d{4}\s+question\s+paper\b/gi,
  /\bactual\s+cat\b/gi,
  /\bquestion\s+paper\b/gi,
];

const residualDirtyTextPattern =
  /online|2iim|page\s+\d+|video\s+solution|back\s+to\s+question|difficulty\s+level|questions\.2iim\.com/i;

export function cleanPyqText(value: unknown, field: PyqTextCleanerField) {
  const original = stringify(value);
  let cleaned = collapseWhitespace(original);
  const warnings: PyqCleaningWarning[] = [];

  if (hasBoilerplate(cleaned)) {
    warnings.push({
      code: "boilerplate_removed",
      field,
      message: `${field} contained source/navigation boilerplate and was sanitized.`,
    });
  }

  const truncated = truncateAtTailMarker(cleaned);
  cleaned = truncated.value;
  if (truncated.changed) {
    warnings.push({
      code: "boilerplate_removed",
      field,
      message: `${field} was truncated at a known source/footer marker.`,
    });
  }

  for (const pattern of removalPatterns) {
    cleaned = cleaned.replace(pattern, " ");
  }

  cleaned = cleaned
    .replace(/\bfor\s+this\s+question\s+answer\s*$/i, "")
    .replace(/\banswer\s*$/i, "")
    .replace(/\s+([,.;:?!])/g, "$1");

  cleaned = collapseWhitespace(cleaned);

  if (residualDirtyTextPattern.test(cleaned)) {
    warnings.push({
      code: "possible_dirty_text",
      field,
      message: `${field} may still contain source/navigation text.`,
    });
  }

  if (field === "question_text" && cleaned.length > 0 && cleaned.length < 40) {
    warnings.push({
      code: "suspicious_question_text",
      field,
      message: "question_text is suspiciously short after cleaning.",
    });
  }

  if (field.startsWith("option_") && isSuspiciousOption(cleaned)) {
    warnings.push({
      code: "suspicious_option_text",
      field,
      message: `${field} may still contain non-option text.`,
    });
  }

  return {
    value: cleaned,
    changed: cleaned !== original,
    warnings: dedupeWarnings(warnings),
  };
}

export function cleanPyqRow<T extends Record<string, unknown>>(row: T): PyqRowCleaningResult<T> {
  const clean: Record<string, unknown> = { ...row };
  const changedFields: PyqTextCleanerField[] = [];
  const warnings: PyqCleaningWarning[] = [];

  for (const field of pyqTextCleanerFields) {
    const result = cleanPyqText(clean[field], field);
    clean[field] = result.value;
    if (result.changed) {
      changedFields.push(field);
    }
    warnings.push(...result.warnings);
  }

  return {
    row: clean as T,
    changedFields,
    warnings: dedupeWarnings(warnings),
    needsManualReview: warnings.some((warning) => warning.code !== "boilerplate_removed"),
  };
}

function stringify(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function collapseWhitespace(value: string) {
  return value.replace(/\r|\n/g, " ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function hasBoilerplate(value: string) {
  const lower = value.toLowerCase();
  return boilerplateMarkers.some((marker) => lower.includes(marker));
}

function truncateAtTailMarker(value: string) {
  let earliest: number | null = null;

  for (const marker of tailMarkers) {
    const match = marker.exec(value);
    if (!match) continue;
    earliest = earliest === null ? match.index : Math.min(earliest, match.index);
  }

  if (earliest === null) {
    return { value, changed: false };
  }

  return {
    value: value.slice(0, earliest),
    changed: true,
  };
}

function isSuspiciousOption(value: string) {
  if (!value) return false;
  if (residualDirtyTextPattern.test(value)) return true;
  return value.length > 180;
}

function dedupeWarnings(warnings: PyqCleaningWarning[]) {
  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.code}:${warning.field}:${warning.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

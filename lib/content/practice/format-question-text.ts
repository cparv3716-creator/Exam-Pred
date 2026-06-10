// Display-only formatting for question text extracted from PDFs.
// Raw stored data is never mutated — apply these helpers only at render time.

const LEAKED_FRAGMENTS = [
  /CAT-Hardened QA Simulation Batch\b[^\n]*/gi,
  /\bQuality Verification Summary\b[^\n]*/gi,
  /\bQuestion Paper\b/gi,
  /\bAnswer Key\b/gi,
  /^Topic:\s*.+$/gim,
  /^Difficulty:\s*.+$/gim,
  /^Type:\s*.+$/gim,
  /^Source:\s*.+$/gim,
];

export function formatQuestionText(raw: string): string {
  if (!raw) return raw;
  let t = raw;

  // Strip PDF control characters (DLE, DC1, etc.)
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");

  // Remove "Estimated Time: X min" prefix
  t = t.replace(/^Estimated\s+Time:\s*\d+(?:\s*[-–]\s*\d+)?\s*min\s*/i, "");

  // Remove leading time hint like "3 min " or "2-3 min "
  t = t.replace(/^\d+(?:\s*[-–]\s*\d+)?\s*min\s+/i, "");

  // Remove leaked metadata fragments
  for (const pattern of LEAKED_FRAGMENTS) {
    t = t.replace(pattern, "");
  }

  // Safe superscript / subscript math conversions
  t = safeLog(t);
  t = safeSqrt(t);

  // Collapse repeated spaces (preserve newlines)
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t.trim();

  return t;
}

export function formatOptionText(raw: string): string {
  if (!raw) return raw;
  let t = raw;
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
  t = t.replace(/[ \t]{2,}/g, " ");
  t = safeLog(t);
  t = safeSqrt(t);
  return t.trim();
}

export function formatSolutionText(raw: string): string {
  if (!raw) return raw;
  let t = raw;
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
  for (const pattern of LEAKED_FRAGMENTS) {
    t = t.replace(pattern, "");
  }
  t = safeLog(t);
  t = safeSqrt(t);
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
}

export function previewText(text: string, maxChars = 160): string {
  const cleaned = formatQuestionText(text);
  if (cleaned.length <= maxChars) return cleaned;
  const cut = cleaned.lastIndexOf(" ", maxChars);
  return cleaned.slice(0, cut > 80 ? cut : maxChars) + "…";
}

// Convert log2/log4/log8/log10 to subscript form only when clearly a base spec.
// Pattern: log followed by a digit (2,4,8,10,16) then a space/( to avoid false positives.
const LOG_MAP: Record<string, string> = {
  "2": "₂",
  "4": "₄",
  "8": "₈",
  "10": "₁₀",
  "16": "₁₆",
};

function safeLog(t: string): string {
  return t.replace(/\blog(\d{1,2})(?=[\s(])/g, (_, base) => {
    const sub = LOG_MAP[base];
    return sub ? `log${sub}` : `log${base}`;
  });
}

function safeSqrt(t: string): string {
  // sqrt(x) → √(x), √x already fine
  return t.replace(/\bsqrt\s*\(/g, "√(");
}

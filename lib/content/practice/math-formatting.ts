// Display-only math formatting for CAT Quant question text.
//
// Design principles (intentionally conservative):
//  - Never mutate raw stored data. All output is display-only.
//  - Most readability comes from safe Unicode substitutions (≠, ≤, ≥, √, x², log₂).
//  - KaTeX is used ONLY for a few tightly-matched, validated patterns.
//  - No control-character sentinels are ever placed into strings. Segmentation is
//    a single left-to-right scan that emits text/math segments directly.
//  - If a math span cannot be safely converted, it stays as cleaned PLAIN TEXT.
//  - Replacement chars (U+FFFD) and control chars are stripped, never emitted.

export type Segment =
  | { type: "text"; content: string }
  | { type: "math"; latex: string; raw: string };

// Control / invisible character classes (\u escapes — never literal bytes).
// C0 controls except TAB/LF/CR, plus DEL and the C1 block.
const CONTROL_CHARS = new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]", "g");
const ZERO_WIDTH = new RegExp("[\u200B-\u200D\u2060\uFEFF]", "g");
const REPLACEMENT = new RegExp("\uFFFD", "g");
const UNSAFE_CHARS = new RegExp("[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]");
const COMBINING_SOLIDUS_EQ = new RegExp("\u0338=", "g");

const LEAKED: RegExp[] = [
  /CAT-Hardened QA Simulation Batch\b[^\n]*/gi,
  /Quality Verification Summary\b[^\n]*/gi,
  /\bQuestion Paper\b/gi,
  /\bAnswer Key\b/gi,
  /^Topic:\s*.+$/gim,
  /^Difficulty:\s*.+$/gim,
  /^Type:\s*.+$/gim,
  /^Source:\s*.+$/gim,
];

const LOG_SUBS: Record<string, string> = {
  "2": "₂", "3": "₃", "4": "₄",
  "8": "₈", "10": "₁₀", "16": "₁₆",
};
const VAR_SUPS: Record<string, string> = {
  "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷",
};

const ALLOWED_CMDS = new Set([
  "\\frac", "\\sqrt", "\\log", "\\le", "\\ge", "\\ne",
  "\\times", "\\cdot", "\\pi", "\\infty", "\\left", "\\right",
  "\\mathbb", "\\to",
]);

// ─── Public API ─────────────────────────────────────────────────────────────

/** Clean, readable plain text. Always safe — applies Unicode substitutions only. */
export function cleanText(raw: string): string {
  if (!raw) return "";
  let t = stripJunk(raw);
  for (const re of LEAKED) t = t.replace(re, "");
  t = stripTimePrefix(t);
  t = unicodeSubstitutions(t);
  t = tidySpacing(t);
  return t;
}

/** Plain-text preview (no KaTeX), truncated for listing cards. */
export function toPreviewText(raw: string, maxChars = 160): string {
  const t = cleanText(raw);
  if (t.length <= maxChars) return t;
  const cut = t.lastIndexOf(" ", maxChars);
  return t.slice(0, cut > 60 ? cut : maxChars).trimEnd() + "…";
}

/** Tokenize cleaned text into text + (safe) math segments. */
export function toSegments(raw: string): Segment[] {
  const text = cleanText(raw);
  if (!text) return [];
  return scan(text);
}

/**
 * Strict gate: only confidently-safe, short LaTeX expressions pass. Rejects
 * replacement/control chars, unbalanced braces/parens, long English sentences,
 * and any LaTeX command outside a small whitelist.
 */
export function isSafeLatexExpression(expr: string): boolean {
  if (!expr) return false;
  if (expr.length > 80) return false; // long → likely a sentence, not a token
  if (UNSAFE_CHARS.test(expr)) return false; // replacement / control chars
  if (count(expr, "{") !== count(expr, "}")) return false; // balanced braces
  if (count(expr, "(") !== count(expr, ")")) return false; // balanced parens
  // Reject English prose: two or more 4+ letter alphabetic words
  const longWords = expr.split(/\s+/).filter((w) => /^[A-Za-z]{4,}$/.test(w));
  if (longWords.length >= 2) return false;
  // Only allow a small set of LaTeX commands
  const cmds = expr.match(/\\[a-zA-Z]+/g) ?? [];
  for (const c of cmds) {
    if (!ALLOWED_CMDS.has(c)) return false;
  }
  return true;
}

// ─── Cleanup steps ────────────────────────────────────────────────────────────

function stripJunk(t: string): string {
  t = t.replace(COMBINING_SOLIDUS_EQ, "≠"); // run before stripping combiners
  t = t.replace(REPLACEMENT, "");
  t = t.replace(CONTROL_CHARS, " ");
  t = t.replace(ZERO_WIDTH, "");
  return t;
}

function stripTimePrefix(t: string): string {
  t = t.replace(/^Estimated\s+Time:\s*\d+(?:\s*[-–]\s*\d+)?\s*min\s*/i, "");
  t = t.replace(/^\d+(?:\s*[-–]\s*\d+)?\s*min\s+/i, "");
  return t;
}

function unicodeSubstitutions(t: string): string {
  // Comparison operators
  t = t.replace(/!=/g, "≠");
  t = t.replace(/(?<![<>])<=(?!=)/g, "≤");
  t = t.replace(/(?<![<>])>=(?!=)/g, "≥");

  // Arrows (after <=/>= so we never touch those)
  t = t.replace(/(?<![<=])->(?!>)/g, "→");
  t = t.replace(/(?<![<>])=>(?!=)/g, "⇒");

  // Function / domain notation: keep readable plain text uses ℝ (KaTeX handled in scan()).
  t = t.replace(/\b([a-z])\s*:\s*R\s*(?:→|->)\s*R\b/gi, "$1: ℝ → ℝ");
  t = t.replace(/(?<![A-Za-z])R\s*→\s*R(?![A-Za-z])/g, "ℝ → ℝ");

  // sqrt → √
  t = t.replace(/\bsqrt\s*\(/g, "√(");
  t = t.replace(/\bsqrt\b(?!\s*\()/g, "√");

  // log base subscripts: log2 … log16 (only when followed by an opening context)
  t = t.replace(/\blog(2|3|4|8|10|16)(?=[\s([{]|$)/g, (_, n) => `log${LOG_SUBS[n] ?? n}`);

  // Simple powers: x^2 → x² and x2 → x² (single lowercase var, single digit)
  t = t.replace(/\b([a-z])\^([2-7])\b/g, (_, v, d) => `${v}${VAR_SUPS[d] ?? d}`);
  t = t.replace(/\b([a-z])([2-7])\b/g, (_, v, d) => `${v}${VAR_SUPS[d] ?? d}`);

  // Collapse spaces around a slash: "x / (x + 1)" → "x/(x + 1)", "2 / 4051" → "2/4051"
  t = t.replace(/\s*\/\s*/g, "/");

  // Space a binary minus: "x² -3x" → "x² - 3x", "(x -1)" → "(x - 1)".
  // Only when preceded by an operand (alnum/superscript/')') AND already has a
  // leading space — preserves unary negatives like "≠ -1".
  t = t.replace(/([0-9A-Za-z²³⁴⁵⁶⁷)\]])\s+-(?=[0-9A-Za-z(])/g, "$1 - ");

  return t;
}

function tidySpacing(t: string): string {
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return t;
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

// Each alternative is a tightly-scoped, safe pattern. We always take the
// earliest match; unmatched spans become plain text.
// Group 1 = numeric fraction, group 2 = function iteration, group 3 = caret power.
const SCANNER =
  /((?<![\dA-Za-z²³⁴⁵⁶⁷./])\d{1,6}\/\d{1,6}(?![\dA-Za-z./]))|(\bf\(\d{2,}\)\([^()\n]{1,20}\))|(\b[A-Za-z]\^\{[^}\n]{1,30}\})|((?:[A-Za-z]\s*:\s*)?ℝ\s*→\s*ℝ)/g;

function buildLatex(match: RegExpExecArray): string | null {
  const raw = match[0];

  if (match[1]) {
    // numeric fraction "n/d"
    const [n, d] = raw.split("/");
    return `\\frac{${n}}{${d}}`;
  }
  if (match[2]) {
    // function iteration "f(2025)(2)"
    const m = /^f\((\d{2,})\)\(([^()\n]{1,20})\)$/.exec(raw);
    if (!m) return null;
    return `f^{(${m[1]})}(${m[2]})`;
  }
  if (match[3]) {
    return raw; // already valid LaTeX (e.g. x^{n+1})
  }
  if (match[4]) {
    // function / domain notation: "f: ℝ → ℝ" or bare "ℝ → ℝ"
    const named = /^([A-Za-z])\s*:/.exec(raw);
    const map = "\\mathbb{R}\\to\\mathbb{R}";
    return named ? `${named[1]}:${map}` : map;
  }
  return null;
}

function scan(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  SCANNER.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SCANNER.exec(text)) !== null) {
    const start = match.index;
    const raw = match[0];
    const latex = buildLatex(match);
    const safe = latex !== null && isSafeLatexExpression(latex);

    if (safe) {
      if (start > last) {
        const before = text.slice(last, start);
        if (before) segments.push({ type: "text", content: before });
      }
      segments.push({ type: "math", latex: latex as string, raw });
      last = start + raw.length;
    }
    // Not safe → leave in place; captured as plain text in the trailing slice.
  }

  if (last < text.length) {
    const rest = text.slice(last);
    if (rest) segments.push({ type: "text", content: rest });
  }

  return segments.length ? segments : [{ type: "text", content: text }];
}

function count(s: string, ch: string): number {
  let n = 0;
  for (const c of s) if (c === ch) n++;
  return n;
}

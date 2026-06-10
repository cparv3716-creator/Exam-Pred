const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;
const LEAK_PATTERNS = [
  /CAT-Hardened QA Simulation Batch\b[^\n]*/gi,
  /CAT Hardened Quant Practice Simulation Set\b[^\n]*/gi,
  /CAT-Hardened Quant Practice\b[^\n]*/gi,
  /Quality Verification Summary\b[^\n]*/gi,
  /\bQuestion Paper\b[^\n]*/gi,
  /\bAnswer Key\b[^\n]*/gi,
  /^Topic:\s*.+$/gim,
  /^Difficulty:\s*.+$/gim,
  /^Type:\s*.+$/gim,
  /^Source:\s*.+$/gim,
];

export function normalizeMathText(raw: string): string {
  let text = String(raw ?? "")
    .replace(/\uFFFD/g, "")
    .replace(/\u0338=/g, "≠")
    .replace(CONTROL_CHARS, " ")
    .replace(ZERO_WIDTH, "")
    .replace(/\u00a0/g, " ");

  for (const pattern of LEAK_PATTERNS) text = text.replace(pattern, "");

  text = text
    .replace(/^Estimated\s+Time:\s*\d+(?:\s*[-–]\s*\d+)?\s*min(?:utes)?\.?\s*/i, "")
    .replace(/^\d+(?:\s*[-–]\s*\d+)?\s*min(?:utes)?\.?\s+/i, "")
    .replace(/x\s*-2\s+x\s*\+\s*3\s*≤\s*x\s*\+\s*1\s+x\s*-4/gi, "(x - 2)/(x + 3) ≤ (x + 1)/(x - 4)")
    .replace(/\bloga\s+b\b/g, "log_a b")
    .replace(/\blogb\s+a\b/g, "log_b a")
    .replace(/\blogx\s+y\b/g, "log_x y")
    .replace(/\blogy\s+x\b/g, "log_y x")
    // General single-letter-subscript log with numeric/variable argument: "logx 64" → "log_x 64"
    .replace(/\blog([a-z])\s+(\d{1,4}|[a-z])\b/g, "log_$1 $2")
    .replace(/\b11\s+2\b/g, "11/2")
    .replace(/\blogab\s*\(\s*a2b3\s*\)/g, "log_{ab}(a^2b^3)")
    .replace(/x\s*-2\s+x\s*\+\s*3\s*-\s*x\s*\+\s*1\s+x\s*-4/gi, "(x - 2)/(x + 3) - (x + 1)/(x - 4)")
    .replace(/\(x\s*-2\)\(x\s*-4\)\s*-\(x\s*\+\s*1\)\(x\s*\+\s*3\)\s*\(x\s*\+\s*3\)\(x\s*-4\)\s*≤\s*0/gi, "((x - 2)(x - 4) - (x + 1)(x + 3))/((x + 3)(x - 4)) ≤ 0")
    .replace(/1\s*-2x\s*\(x\s*\+\s*3\)\(x\s*-4\)\s*≤\s*0/gi, "(1 - 2x)/((x + 3)(x - 4)) ≤ 0")
    .replace(/\bP\s*=\s*1\s+4\s*,\s*1\s+4\b/g, "P = (1/4, 1/4)")
    .replace(/\bD\s*=\s*\(?1\s+3\s*,\s*0\)?/g, "D = (1/3, 0)")
    .replace(/\bE\s*=\s*\(?0\s*,\s*1\s+3\)?/g, "E = (0, 1/3)")
    .replace(/\b1\s+2\s+1\s+3\s*·\s*1\s+4\s*\+\s*1\s+4\s*·\s*1\s+3\s*=\s*1\s+12\b/g, "1/2(1/3 · 1/4 + 1/4 · 1/3) = 1/12")
    .replace(/\[ADPE\]\s+\[ABC\]\s*=\s*1\/12\s+1\/2\s*=\s*1\s+6/gi, "[ADPE]/[ABC] = (1/12)/(1/2) = 1/6")
    .replace(/\b1\s+4\b/g, "1/4")
    .replace(/\b1\s+3\b/g, "1/3")
    .replace(/\b1\s+12\b/g, "1/12")
    .replace(/\b1\s+6\s*x\s*84\b/gi, "(1/6) * 84")
    .replace(/\b1\s+2\s*(?=[*×]|log|[A-Za-z(])/gi, "1/2 ")
    .replace(/\b1\s+2\b(?=\]|,|\)|\s)/g, "1/2")
    .replace(/\b11\s+6\b/g, "11/6")
    .replace(/\b10\s+3\b/g, "10/3")
    .replace(/\b99\s+16\b/g, "99/16")
    .replace(/\b45\s+16\b/g, "45/16")
    .replace(/\b11\s+4\b/g, "11/4")
    .replace(/\b9\s+4\b/g, "9/4")
    .replace(/\b9\s+2\b/g, "9/2")
    .replace(/\b1\s+t\b/g, "1/t")
    .replace(/\b2\s+\+\s+3t\s+1\s+\+\s+t\b/g, "(2 + 3t)/(1 + t)")
    .replace(/\b2\s+log a\s+\+\s+3\s+log b\s+log a\s+\+\s+log b\b/g, "(2 log a + 3 log b)/(log a + log b)")
    .replace(/\ba2b3\b/g, "a^2b^3")
    .replace(/\b3t2\b/g, "3t^2")
    .replace(/\bx4\b/g, "x^4")
    .replace(/\bx1\/3\b/g, "x^(1/3)")
    .replace(/\bx4\/3\b/g, "x^(4/3)")
    .replace(/\b813\/4\b/g, "81^(3/4)")
    .replace(/\b\d{1,2}\s+(There are\b)/g, "$1")
    .replace(/\b26\s*=\s*64\b/g, "2^6 = 64")
    .replace(/\s*\/\s*/g, "/")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

export function detectMathReviewIssues(raw: string): string[] {
  const issues = new Set<string>();
  const text = String(raw ?? "");
  const normalized = normalizeMathText(text);

  if (/\uFFFD/.test(text)) issues.add("replacement character");
  if (CONTROL_CHARS.test(text)) issues.add("control character");
  if (/CAT-Hardened|CAT Hardened|Question Paper|Answer Key|Topic-Wise Distribution|Quality Verification Summary|Topic:|Difficulty:|Type:/i.test(text)) {
    issues.add("leaked source or batch fragment");
  }
  if (/\b[abcxyz][23]\b/i.test(normalized)) issues.add("plain exponent token");
  if (/\blog(?:2|3|4|8|10|16)\b/i.test(normalized)) issues.add("plain log base token");
  if (/√\s+(?:\d+\s*[·*]\s*){2,}\d+/i.test(normalized)) issues.add("sqrt product needs math formatting");
  if (/\b(?:1\s+2|1\s+12|3\s+4)\b/.test(normalized) && !isSafeLostFractionContext(normalized)) {
    issues.add("suspicious adjacent numeric tokens");
  }
  if (hasAmbiguousSlash(normalized)) issues.add("ambiguous slash or fraction structure");
  if (normalized.length > 900 && !/Step\s+\d+:/i.test(normalized)) issues.add("very long unformatted solution paragraph");

  return Array.from(issues);
}

export function toCatQuantMarkdown(raw: string, context: "question" | "option" | "solution"): string {
  const cleaned = normalizeMathText(raw);
  if (!cleaned) return "";
  if (context === "option") return formatOptionMarkdown(cleaned);
  if (context === "question") return formatQuestionMarkdown(cleaned);
  return formatSolutionMarkdown(cleaned);
}

export function formatQuestionToMarkdown(rawQuestion: string): string {
  return toCatQuantMarkdown(rawQuestion, "question");
}

// Strip rendered math so we only inspect the prose a student would actually read.
function proseOutsideMath(markdown: string): string {
  return String(markdown ?? "")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ");
}

/**
 * Patterns that mean a markdown field is still RAW-DAMAGED (LaTeX/operators leaking
 * into prose, or un-rendered exponents/fractions). Used both by the normalize step
 * and by the student-page guard so a damaged row is never called "clean".
 */
export function findMathResidue(markdown: string): string[] {
  const found = new Set<string>();
  const text = String(markdown ?? "");
  const prose = proseOutsideMath(text);

  if (/\uFFFD/.test(text)) found.add("replacement character");
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(text)) found.add("control character");
  if (/(?:\bR|ℝ)\s*(?:->|→)\s*(?:R|ℝ)\b/.test(prose)) found.add("R -> R");
  if (/\\(?:log|frac|sqrt|mathbb|to|cdot|times|le|ge|ne)\b/.test(prose)) found.add("leaked LaTeX command outside math");
  if (/\blog[a-z]\s+[a-z]\b/.test(prose) || /\blog_[a-z{]/.test(prose)) found.add("loga/log_a leaked outside math");
  if (/\b[a-z]2b3\b/.test(prose) || /\ba2b3\b/.test(prose)) found.add("a2b3 raw exponent");
  if (/\b[a-z][2-4]\b/.test(prose) && /[=+\-]/.test(prose)) found.add("plain exponent token (t2/x2)");
  if (/\b\d{1,3}\s+\d{1,3}\b(?=[).,\s]|$)/.test(prose) && /(?:\b1\s+[234]\b|\b10\s+3\b|\b99\s+16\b|\b45\s+16\b|\b11\s+[46]\b|\b9\s+[24]\b)/.test(prose)) {
    found.add("adjacent-number fraction (10 3 / 99 16)");
  }
  return Array.from(found);
}

/** True when a markdown field carries unambiguous breakage that must be hidden from students. */
export function hasSeriousMathResidue(markdown: string): boolean {
  const residue = findMathResidue(markdown);
  const serious = new Set([
    "replacement character",
    "control character",
    "R -> R",
    "leaked LaTeX command outside math",
    "loga/log_a leaked outside math",
    "a2b3 raw exponent",
  ]);
  return residue.some((item) => serious.has(item));
}

export function formatOptionToMarkdown(rawOption: string): string {
  return toCatQuantMarkdown(rawOption, "option");
}

export function formatSolutionToMarkdown(rawSolution: string): string {
  return toCatQuantMarkdown(rawSolution, "solution");
}

function formatQuestionMarkdown(input: string): string {
  let output = input;
  // 1. Function / domain notation → inline math (before anything eats the "R")
  output = convertFunctionDomain(output);
  // 2. Tighten coefficient·function spacing: "2 f(x)" → "2f(x)", "5 f(2)" → "5f(2)"
  output = mergeCoefficientFunction(output);
  // 3. Known, hand-verified equations become block math first (highest priority)
  output = replaceKnownEquations(output, "block");
  // 4. Walk prose segments only (never touch existing $…$ / $$…$$ spans)
  output = mapProseSegments(output, convertQuestionProse);
  return tidyMarkdown(output);
}

// "f: R -> R", "f : ℝ → ℝ", or a bare "R -> R" in domain context → inline math.
function convertFunctionDomain(input: string): string {
  let output = input.replace(
    /\b([a-zA-Z])\s*:\s*(?:R|ℝ|\\mathbb\{R\})\s*(?:->|→|\\to|\bto\b)\s*(?:R|ℝ|\\mathbb\{R\})/g,
    (_m, name) => inlineMath(`${name}:\\mathbb{R}\\to\\mathbb{R}`),
  );
  output = output.replace(
    /(?<![A-Za-z$\\])(?:R|ℝ)\s*(?:->|→)\s*(?:R|ℝ)(?![A-Za-z])/g,
    () => inlineMath("\\mathbb{R}\\to\\mathbb{R}"),
  );
  return output;
}

function mergeCoefficientFunction(input: string): string {
  return input
    .split(/(\$[^$\n]*\$|\$\$[\s\S]*?\$\$)/g)
    .map((part) => (part.startsWith("$") ? part : part.replace(/\b(\d+)\s+([a-zA-Z])\s*\(/g, "$1$2(")))
    .join("");
}

// Apply `fn` to every span that is NOT already inside $…$ or $$…$$.
function mapProseSegments(input: string, fn: (prose: string) => string): string {
  return input
    .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g)
    .map((part) => (part.startsWith("$") ? part : fn(part)))
    .join("");
}

function convertQuestionProse(prose: string): string {
  // 1. Protect "hard" LaTeX-ish tokens (logs, roots, fractions, power chains) so the
  //    atom-based equation lifter never splits on their "_", "^", "\" or "√".
  let output = preWrapHardMath(prose);
  // 2. Lift bare arithmetic equations (e.g. 2f(x)+3f(1-x)=x^2+x+1) to block math.
  output = liftBlockEquations(output);
  // 3. Wrap remaining simple tokens + textual fixes inside prose (never inside math spans).
  output = mapMathAware(output, (part) => applyTextualMath(inlineRemainingMathSegment(part)));
  // 4. Chain adjacent inline-math spans separated by operators into one equation span.
  output = mergeInlineEquation(output);
  return output;
}

// Apply `fn` only to spans that are NOT already $…$ or $$…$$ math.
function mapMathAware(text: string, fn: (prose: string) => string): string {
  return text
    .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g)
    .map((part) => (part.startsWith("$") ? part : fn(part)))
    .join("");
}

// Wrap tokens that the atom lifter cannot parse (anything with _, ^, \, √, or sqrt()).
function preWrapHardMath(prose: string): string {
  let output = prose;
  output = output.replace(/(?<!\\)\blog(?=_[A-Za-z{])/g, "\\log");
  output = output.replace(/\bloga\s+b\b/g, "\\log_a b");
  output = output.replace(/\blogb\s+a\b/g, "\\log_b a");
  output = output.replace(/\blogab\s*\(([^)]+)\)/g, (_m, body) => `\\log_{ab}(${latexExpression(body)})`);
  output = output.replace(/\bsqrt\s*\(([^()\n]{1,30})\)/gi, (_m, body) => `\\sqrt{${latexExpression(body)}}`);

  const HARD = [
    /\\log_\{[^}]+\}\([^)]*\)/g,
    /\\log_[A-Za-z0-9]+\s*\([^)]*\)/g,
    /\\log_\{[^}]+\}\s+[A-Za-z0-9]+/g,
    /\\log_[A-Za-z0-9]+\s+[A-Za-z0-9]+/g,
    /\\sqrt\{[^{}\n]+\}/g,
    /√\s*\(?[0-9A-Za-z·*+\-/]{1,30}\)?/g,
    /\b[A-Za-z]\^\{[^}\n]{1,20}\}/g,
    /\b[A-Za-z]\^\d+(?:[A-Za-z]\^\d+)+\b/g, // a^2b^3
    /\b\d{1,3}\^\{?\d+(?:\/\d+)?\}?/g, // 81^{3/4}, 2^6
  ];
  for (const re of HARD) {
    output = mapMathAware(output, (part) => part.replace(re, (m) => inlineMath(m.trim())));
  }
  return output;
}

// "$A$ + $B$ = $C$" → "$A + B = C$" (joins inline spans linked by binary operators).
function mergeInlineEquation(input: string): string {
  let prev = "";
  let output = input;
  while (output !== prev) {
    prev = output;
    output = output.replace(/\$([^$\n]+)\$(\s*[-+*/=]\s*)\$([^$\n]+)\$/g, (_m, a, op, b) => `$${a}${op}${b}$`);
  }
  return output;
}

// An atom is a run of alphanumerics / superscripts / parens / dots; equations are
// atoms joined by binary operators. Only runs containing "=" become block math.
const EQ_ATOM = "[A-Za-z0-9²³⁴⁵⁶⁷().]+";
const EQUATION_RE = new RegExp(`${EQ_ATOM}(?:\\s*[-+*/=]\\s*${EQ_ATOM})+`, "g");

function liftBlockEquations(prose: string): string {
  return prose.replace(EQUATION_RE, (match) => {
    if (!match.includes("=")) return match; // not an equation → leave for inline pass
    const sideOps = (match.match(/[-+*/]/g) ?? []).length;
    if (sideOps < 1) return match; // "x = 5" / ratios stay as readable inline/plain text
    if (!/[A-Za-z]/.test(match)) return match; // pure-number runs are not equations
    const latex = blockEquationLatex(match);
    if (!isBalanced(latex)) return match;
    return blockMath(latex);
  });
}

function blockEquationLatex(raw: string): string {
  return raw
    .replace(/\s+/g, "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/⁵/g, "^5")
    .replace(/×/g, " \\times ")
    .replace(/·/g, " \\cdot ")
    .trim();
}

function isBalanced(latex: string): boolean {
  const paren = (latex.match(/\(/g) ?? []).length === (latex.match(/\)/g) ?? []).length;
  const brace = (latex.match(/\{/g) ?? []).length === (latex.match(/\}/g) ?? []).length;
  return paren && brace;
}

// Standalone variables / coefficient-functions that read better as inline math.
function applyTextualMath(input: string): string {
  return input
    .replace(/\b(for (?:every|all) real)\s+([a-z])\b/gi, (_m, lead, v) => `${lead} ${inlineMath(v)}`)
    .replace(/\b(real number)\s+([a-z])\b/gi, (_m, lead, v) => `${lead} ${inlineMath(v)}`)
    .replace(/\b([a-z])\s*([<>])\s*(\d+)\b/g, (_m, v, op, n) => inlineMath(`${v} ${op} ${n}`))
    .replace(/\bis\s*\.\s*$/i, "is:");
}

function formatOptionMarkdown(input: string): string {
  const adjacentFraction = /^(\d{1,4})\s+(\d{1,4})$/.exec(input.trim());
  if (adjacentFraction) return inlineMath(`\\frac{${adjacentFraction[1]}}{${adjacentFraction[2]}}`);
  return inlineRemainingMath(input);
}

function formatSolutionMarkdown(rawSolution: string): string {
  const cleaned = normalizeMathText(rawSolution);
  if (!cleaned) return "";

  const stepMatches = Array.from(cleaned.matchAll(/Step\s+(\d+)\s*:/gi));
  if (!stepMatches.length) return formatSolutionStep(cleaned);

  const sections: string[] = [];
  for (let index = 0; index < stepMatches.length; index += 1) {
    const match = stepMatches[index];
    const next = stepMatches[index + 1];
    const stepNo = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? cleaned.length;
    sections.push(`### Step ${stepNo}\n\n${formatSolutionStep(cleaned.slice(start, end).trim())}`);
  }

  return sections.join("\n\n");
}

function formatSolutionStep(input: string): string {
  let output = input
    .replace(/\bbe\s+m,\s*n\b/gi, "be (m,n)")
    .replace(/\bbe\s+u,\s*v\b/gi, "be (u,v)");
  output = repairQ08FlattenedTable(output);
  output = repairGeometryAreaBlocks(output);
  output = replaceKnownEquations(output, "block");
  output = inlineRemainingMath(output);
  return tidyMarkdown(output);
}

function repairGeometryAreaBlocks(input: string): string {
  return input
    .replace(/\bs\s*=\s*(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)\s+2\s*=\s*(\d+)/gi, (_match, a, b, c, result) =>
      blockMath(`s = \\frac{${a} + ${b} + ${c}}{2} = ${result}`),
    )
    .replace(/\[ABC\]\s*=\s*√\s*([0-9\s·*.]+?)\s*=\s*(\d+)/gi, (_match, product, result) =>
      blockMath(`[ABC] = \\sqrt{${toLatexProduct(product)}} = ${result}`),
    );
}

function replaceKnownEquations(input: string, mode: "inline" | "block") {
  let output = input;
  for (const pattern of KNOWN_EQUATIONS) {
    output = output.replace(pattern.regex, () => pattern.replacement(mode));
  }
  return output;
}

const KNOWN_EQUATIONS: Array<{ regex: RegExp; replacement: (mode: "inline" | "block") => string }> = [
  {
    regex: /\b(?:t2|t²|t\^2)\s*-\s*\(\s*a\s*\+\s*3\s*\)\s*t\s*\+\s*b\s*=\s*0\b/gi,
    replacement: (mode) => mathByMode("t^2 - (a+3)t + b = 0", mode),
  },
  {
    regex: /\b(?:t2|t²|t\^2)\s*-\s*\(\s*b\s*-\s*5\s*\)\s*t\s*\+\s*a\s*=\s*0\b/gi,
    replacement: (mode) => mathByMode("t^2 - (b-5)t + a = 0", mode),
  },
  {
    regex: /\bm\s*\+\s*n\s*=\s*a\s*\+\s*3,\s*mn\s*=\s*b\b/gi,
    replacement: (mode) => mathByMode("m+n=a+3,\\quad mn=b", mode),
  },
  {
    regex: /\bu\s*\+\s*v\s*=\s*b\s*-?\s*5,\s*uv\s*=\s*a\b/gi,
    replacement: (mode) => mathByMode("u+v=b-5,\\quad uv=a", mode),
  },
  {
    regex: /\(m\s*-\s*1\)\s*\(n\s*-\s*1\)\s*\+\s*\(u\s*-\s*1\)\s*\(v\s*-\s*1\)\s*=\s*4\b/gi,
    replacement: (mode) => mathByMode("(m-1)(n-1)+(u-1)(v-1)=4", mode),
  },
];

function mathByMode(latex: string, mode: "inline" | "block") {
  return mode === "block" ? blockMath(latex) : inlineMath(latex);
}

function blockMath(latex: string) {
  return `\n\n$$\n${latex}\n$$\n\n`;
}

function inlineMath(latex: string) {
  return `$${latex}$`;
}

function inlineRemainingMath(input: string): string {
  return input
    .split(/(\$\$[\s\S]*?\$\$)/g)
    .map((part) => (part.startsWith("$$") ? part : inlineRemainingMathSegment(part)))
    .join("");
}

function inlineRemainingMathSegment(input: string): string {
  let output = input;

  // ── Normalize legacy raw forms → LaTeX-ish (handle BOTH "loga b" and "log_a b") ──
  output = output.replace(/\ba2b3\b/g, "a^2b^3");
  output = output.replace(/\b([a-z])([2-4])\b/g, "$1^$2");
  output = output.replace(/([A-Za-z0-9])²/g, "$1^2");
  output = output.replace(/([A-Za-z0-9])³/g, "$1^3");
  output = output.replace(/([A-Za-z0-9])⁴/g, "$1^4");
  output = output.replace(/\bloga\s+b\b/g, "\\log_a b");
  output = output.replace(/\blogb\s+a\b/g, "\\log_b a");
  output = output.replace(/\blogx\s+y\b/g, "\\log_x y");
  output = output.replace(/\blogy\s+x\b/g, "\\log_y x");
  output = output.replace(/\blogab\s*\(([^)]+)\)/g, (_match, body) => `\\log_{ab}(${latexExpression(body)})`);
  // Already-normalized "log_a b", "log_{ab}(…)" must regain their backslash so they wrap below.
  output = output.replace(/(?<!\\)\blog(?=_[A-Za-z{])/g, "\\log");
  output = output.replace(/\\log_\{([^}]+)\}\(([^)]+)\)/g, (_match, base, body) => `\\log_{${base}}(${latexExpression(body)})`);
  output = output.replace(/\blog(2|3|4|8|10|16)\s*\(([^)]+)\)/gi, (_match, base, body) => `\\log_${base}(${latexExpression(body)})`);
  output = output.replace(/\b(\d{1,3})\s*sqrt\((\d{1,4})\)/gi, (_match, coefficient, radicand) => `${coefficient}\\sqrt{${radicand}}`);
  output = output.replace(/√\s*((?:\d+\s*[·*]\s*)+\d+)/g, (_match, product) => `\\sqrt{${toLatexProduct(product)}}`);
  output = output.replace(/√\s*(\d{1,4})(?=\s|,|\.|\)|$)/g, (_match, radicand) => `\\sqrt{${radicand}}`);
  output = output.replace(/!=/g, "\\ne ");
  output = output.replace(/<=/g, "\\le ");
  output = output.replace(/>\s*=/g, "\\ge ");
  output = output.replace(/\b(\d{1,5})\/(\d{1,5})\b/g, "\\frac{$1}{$2}");

  // ── Wrap recognised LaTeX/math tokens in $…$ (longest / most-specific first) ──
  output = output.replace(/\\log_\{[^}]+\}\([^)]*\)/g, (match) => inlineMath(match));
  output = output.replace(/\\log_[A-Za-z0-9]+\s*\([^)]*\)/g, (match) => inlineMath(match));
  output = output.replace(/\\log_\{[^}]+\}\s+[A-Za-z0-9]+/g, (match) => inlineMath(match));
  output = output.replace(/\\log_[A-Za-z0-9]+\s+[A-Za-z0-9]+/g, (match) => inlineMath(match));
  output = output.replace(/\d{1,3}\\sqrt\{[^{}\n]+\}/g, (match) => inlineMath(match));
  output = output.replace(/\\sqrt\{[^{}\n]+\}/g, (match) => inlineMath(match));
  output = output.replace(/\\frac\{\d{1,5}\}\{\d{1,5}\}/g, (match) => inlineMath(match));
  output = output.replace(/\b\d+[a-zA-Z]\^\d+\b/g, (match) => inlineMath(match)); // e.g. a^2b^3 starts here
  output = output.replace(/\b[a-zA-Z]\^\d+[a-zA-Z]\^\d+\b/g, (match) => inlineMath(match)); // a^2b^3
  output = output.replace(/\b[a-z]\^\d\b/g, (match) => inlineMath(match));
  output = output.replace(/\b\d+[a-zA-Z]\([^()\n]{1,12}\)/g, (match) => inlineMath(match.replace(/\s+/g, ""))); // 5f(2)
  output = output.replace(/\b(a\s*\+\s*b|a\+b)\b/g, inlineMath("a+b"));

  return mergeAdjacentInlineMath(output);
}

// "$a$$+$$b$" style fragments → "$a+b$" so we never emit empty/broken $$ runs.
function mergeAdjacentInlineMath(input: string): string {
  return input.replace(/\$([^$\n]*)\$(\s*)\$([^$\n]*)\$/g, (_m, a, gap, b) =>
    gap.trim() ? `$${a}$${gap}$${b}$` : `$${a}${b}$`,
  );
}

function latexExpression(input: string) {
  return String(input ?? "")
    .replace(/\ba2b3\b/g, "a^2b^3")
    .replace(/\b([a-z])([2-4])\b/g, "$1^$2")
    .replace(/\s+/g, "")
    .trim();
}

function repairQ08FlattenedTable(input: string): string {
  if (!/The feasible unordered root sets are:/i.test(input)) return input;
  if (!/\(1,\s*11\)\s*\(3,\s*3\)\s*9\s*11\s*20/i.test(input)) return input;

  const table = [
    "The feasible unordered root sets are:",
    "",
    "| (m,n) | (u,v) | a | b | a+b |",
    "| --- | ---: | --: | --: | ---: |",
    "| (1,11) | (3,3) | 9 | 11 | 20 |",
    "| (1,12) | (2,5) | 10 | 12 | 22 |",
    "| (2,5) | (1,4) | 4 | 10 | 14 |",
    "| (3,3) | (1,3) | 3 | 9 | 12 |",
  ].join("\n");

  return input.replace(
    /The feasible unordered root sets are:\s*\(m,\s*n\)\s*\(u,\s*v\)\s*a\s*b\s*a\s*\+\s*b\s*\(1,\s*11\)\s*\(3,\s*3\)\s*9\s*11\s*20\s*\(1,\s*12\)\s*\(2,\s*5\)\s*10\s*12\s*22\s*\(2,\s*5\)\s*\(1,\s*4\)\s*4\s*10\s*14\s*\(3,\s*3\)\s*\(1,\s*3\)\s*3\s*9\s*12/gi,
    table,
  );
}

function tidyMarkdown(input: string) {
  return input
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\$\$\n\n\./g, () => "$$")
    .replace(/ +([,.;:?])/g, "$1")
    .replace(/\(\s*([a-z]),\s*([a-z])\s*\)/g, "($1,$2)")
    .replace(/\bnon\s+-\s+negative\b/gi, "non-negative")
    .trim();
}

function formatSolutionParagraph(text: string): string {
  let working = text;
  const blocks: string[] = [];

  working = extractSemiperimeter(working, blocks);
  working = extractHeronArea(working, blocks);
  working = extractHalfProduct(working, blocks);
  working = extractStandaloneEquations(working, blocks);

  const prose = splitSentences(working)
    .map((line) => inlineMathMarkdown(line.trim()))
    .map((line) => line.replace(/\bthe semiperimeter is\s*\./i, "the semiperimeter is:").replace(/\bis\s*\./g, "is:"))
    .filter(Boolean)
    .join("\n\n");

  return [prose, ...blocks].filter(Boolean).join("\n\n");
}

function extractSemiperimeter(text: string, blocks: string[]) {
  return text.replace(/\bs\s*=\s*(\d+)\s*\+\s*(\d+)\s*\+\s*(\d+)\s+2\s*=\s*(\d+)/gi, (_match, a, b, c, result) => {
    blocks.push(`$$\ns = \\frac{${a} + ${b} + ${c}}{2} = ${result}\n$$`);
    return "";
  });
}

function extractHeronArea(text: string, blocks: string[]) {
  return text.replace(/(\[[A-Z]+\])\s*=\s*√\s*([0-9\s·*.]+?)\s*=\s*([0-9.]+)/g, (_match, area, product, result) => {
    blocks.push(`$$\n${area} = \\sqrt{${toLatexProduct(product)}} = ${result}\n$$`);
    return "";
  });
}

function extractHalfProduct(text: string, blocks: string[]) {
  return text.replace(/\b1\s+2\s*[*×]\s*([A-Za-z0-9()[\]\s+\-*/]+?)(?=\.|,|;|$)/g, (_match, rest) => {
    blocks.push(`$$\n\\frac{1}{2} \\times ${toLatexExpression(rest)}\n$$`);
    return "";
  });
}

function extractStandaloneEquations(text: string, blocks: string[]) {
  return text.replace(/(?:^|(?<=\. ))((?:[A-Za-z][A-Za-z0-9_()]*|\[[A-Z]+\]|f\(\d+\)\([^)]*\)|[xyz])\s*[=≤≥<>]\s*[^.]{3,120})/g, (match, equation) => {
    if (!/[0-9A-Za-z]/.test(equation)) return match;
    blocks.push(`$$\n${toLatexExpression(equation.trim())}\n$$`);
    return match.replace(equation, "");
  });
}

function inlineMathMarkdown(text: string): string {
  let output = normalizeMathText(text);
  output = output.replace(/\b([abcxyz])([23])\b/g, "$1^$2");
  output = output.replace(/\bt\^2\b/g, "t^2");
  output = output.replace(/([abcxyz])²/g, "$1^2");
  output = output.replace(/([abcxyz])³/g, "$1^3");
  output = output.replace(/\b([A-Za-z])\((\d+)\)\(([^)]+)\)/g, "$1^{$2}($3)");
  output = output.replace(/\b([A-Za-z])\((n)\)\(([^)]+)\)/g, "$1^{($2)}($3)");
  output = output.replace(/\blog_([A-Za-z]+)\s+([A-Za-z]+)/g, (_m, base, arg) => `\\log_{${base}} ${arg}`);
  output = output.replace(/\blog_\{([^}]+)\}\(([^)]+)\)/g, (_m, base, arg) => `\\log_{${base}}(${toLatexExpression(arg)})`);
  output = output.replace(/\blog(2|3|4|8|10|16)\s*\(/gi, (_m, base) => `\\log_${base}(`);
  output = output.replace(/\blog([₂₃₄₈]|₁₀|₁₆)\s*/g, (match) => match);
  output = output.replace(/!=/g, "\\ne ").replace(/<=/g, "\\le ").replace(/>=/g, "\\ge ");
  output = output.replace(/\(([^()\n]{1,40})\)\/\(([^()\n]{1,40})\)/g, (_m, numerator, denominator) => `\\frac{${toLatexExpression(numerator)}}{${toLatexExpression(denominator)}}`);
  output = output.replace(/([A-Za-z0-9^{}]+)\/\(([^()\n]{1,40})\)/g, (_m, numerator, denominator) => `\\frac{${toLatexExpression(numerator)}}{${toLatexExpression(denominator)}}`);
  output = output.replace(/\b(\d{1,6})\/(\d{1,6})\b/g, "\\frac{$1}{$2}");

  return wrapMathRuns(output);
}

function wrapMathRuns(text: string) {
  const mathish = /(\\frac\{\\frac\{\d+\}\{\d+\}\}\{\\frac\{\d+\}\{\d+\}\}|\\frac\{[^{}\n]+\}\{[^{}\n]+\}|\\log_\{?[\dA-Za-z]+\}?\([^)]*\)|\\log_\{?[\dA-Za-z]+\}?\s+[A-Za-z]+|[A-Za-z]\^\{?[\dA-Za-z()]+\}?|[abcxyz]\^\d|\\(?:ne|le|ge)\s*|√\s*\(?[^,.;\n]{1,40}\)?)/g;
  return text.replace(mathish, (match) => `$${toLatexExpression(match)}$`);
}

function toLatexExpression(input: string): string {
  return normalizeMathText(input)
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\b([abcxyz])([23])\b/g, "$1^$2")
    .replace(/\bt\^2\b/g, "t^2")
    .replace(/\b([A-Za-z])\((\d+)\)\(([^)]+)\)/g, "$1^{$2}($3)")
    .replace(/\b([A-Za-z])\((n)\)\(([^)]+)\)/g, "$1^{($2)}($3)")
    .replace(/\blog_([A-Za-z]+)\s+([A-Za-z]+)/g, "\\log_{$1} $2")
    .replace(/\blog_\{([^}]+)\}\(([^)]+)\)/g, (_m, base, arg) => `\\log_{${base}}(${toLatexExpression(arg)})`)
    .replace(/\blog(2|3|4|8|10|16)\s*\(/gi, "\\log_$1(")
    .replace(/√\s*\(([^)]+)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([0-9A-Za-z\s·*+\-/^]+)$/g, (_m, body) => `\\sqrt{${toLatexProduct(body)}}`)
    .replace(/\b(\d{1,6})\/(\d{1,6})\b/g, "\\frac{$1}{$2}")
    .replace(/\(([^()\n]{1,40})\)\/\(([^()\n]{1,40})\)/g, "\\frac{$1}{$2}")
    .replace(/([A-Za-z0-9^{}]+)\/\(([^()\n]{1,40})\)/g, "\\frac{$1}{$2}")
    .replace(/!=/g, "\\ne ")
    .replace(/<=/g, "\\le ")
    .replace(/>=/g, "\\ge ")
    .replace(/\*/g, "\\times ")
    .replace(/·/g, "\\cdot ")
    .trim();
}

function toLatexProduct(input: string): string {
  return normalizeMathText(input)
    .replace(/[·*]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" \\cdot ");
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isSafeLostFractionContext(text: string): boolean {
  return /semiperimeter|area|triangle|base|height|Heron/i.test(text);
}

function hasAmbiguousSlash(text: string): boolean {
  if (!text.includes("/")) return false;
  if (/\b\d{1,6}\/\d{1,6}\b/.test(text)) return false;
  if (/[A-Za-z0-9)]\/\([^)]{1,40}\)/.test(text)) return false;
  return /[A-Za-z0-9)]\/[A-Za-z(]/.test(text) || /\/.*\//.test(text);
}

"use client";

import { useMemo } from "react";
import katex from "katex";
import { isSafeLatexExpression, toPreviewText, toSegments, type Segment } from "@/lib/content/practice/math-formatting";
import { cn } from "@/lib/utils";

export type MathVariant = "question" | "option" | "solution" | "preview";

// throwOnError:false means KaTeX never throws; we additionally detect its error
// markup and fall back to plain text, so a student never sees red invalid LaTeX.
const KATEX_OPTS: katex.KatexOptions = {
  throwOnError: false,
  strict: "ignore",
  displayMode: false,
};

/** Render a single math span, falling back to the original plain text on any issue. */
function renderMathHtml(latex: string): string | null {
  try {
    const html = katex.renderToString(latex, KATEX_OPTS);
    if (!html || html.includes("katex-error")) return null;
    return html;
  } catch {
    return null;
  }
}

function MathSpan({ latex, raw }: { latex: string; raw: string }) {
  const html = useMemo(() => renderMathHtml(latex), [latex]);
  // Fallback shows the cleaned ORIGINAL text (e.g. "f(2025)(2)"), never raw LaTeX.
  if (!html) return <span>{raw}</span>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderSegments(segments: Segment[]) {
  return segments.map((seg, i) =>
    seg.type === "math" ? (
      <MathSpan key={i} latex={seg.latex} raw={seg.raw} />
    ) : (
      <span key={i}>{seg.content}</span>
    ),
  );
}

/** Solution text: keep step-by-step line breaks, render math inline per line. */
function SolutionText({ text, className }: { text: string; className?: string }) {
  // Segment each non-empty line independently so step-by-step breaks are kept.
  const paragraphs = useMemo(
    () =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => toSegments(line)),
    [text],
  );

  return (
    <div className={className}>
      {paragraphs.map((segs, i) => (
        <p key={i} className={cn("leading-relaxed", i > 0 && "mt-2")}>
          {renderSegments(segs)}
        </p>
      ))}
    </div>
  );
}

export function SmartMathText({
  text,
  latex,
  normalized = false,
  className,
  variant = "question",
}: {
  text: string;
  latex?: string;
  normalized?: boolean;
  className?: string;
  variant?: MathVariant;
}) {
  const inlineSegments = useMemo(
    () => (!normalized && (variant === "question" || variant === "option") ? toSegments(text) : []),
    [normalized, text, variant],
  );

  if (latex && isSafeLatexExpression(latex)) {
    return (
      <span className={className}>
        <MathSpan latex={latex} raw={text} />
      </span>
    );
  }

  if (variant === "preview") {
    return <span className={className}>{normalized ? text : toPreviewText(text)}</span>;
  }

  if (variant === "solution") {
    if (normalized) {
      return (
        <div className={className}>
          {text.split("\n").filter(Boolean).map((line, index) => (
            <p key={`${line}-${index}`} className={cn("leading-relaxed", index > 0 && "mt-2")}>{line}</p>
          ))}
        </div>
      );
    }
    return <SolutionText text={text} className={className} />;
  }

  if (normalized) return <span className={className}>{text}</span>;

  return <span className={className}>{renderSegments(inlineSegments)}</span>;
}

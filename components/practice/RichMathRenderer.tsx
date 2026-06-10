"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

export function RichMathRenderer({
  content,
  className,
  compact = false,
}: {
  content: string;
  className?: string;
  compact?: boolean;
}) {
  try {
    return (
      <div className={cn("rich-math text-slate-200", compact && "rich-math-compact", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]}
          components={{
            h3: ({ children }) => (
              <h3 className="mt-5 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-200">
                {children}
              </h3>
            ),
            p: ({ children }) => <p className={cn("leading-relaxed text-slate-300", compact ? "my-0" : "my-3")}>{children}</p>,
            ul: ({ children }) => <ul className="my-3 list-disc space-y-2 pl-5 text-slate-300">{children}</ul>,
            ol: ({ children }) => <ol className="my-3 list-decimal space-y-2 pl-5 text-slate-300">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/70 p-4 text-xs leading-relaxed text-cyan-100">{children}</pre>,
            code: ({ children, className }) =>
              className ? (
                <code className={className}>{children}</code>
              ) : (
                <code className="rounded bg-white/8 px-1.5 py-0.5 text-cyan-100">{children}</code>
              ),
            table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="min-w-full border-separate border-spacing-0 text-sm">{children}</table></div>,
            th: ({ children }) => <th className="border-b border-white/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{children}</th>,
            td: ({ children }) => <td className="border-b border-white/8 px-3 py-2 text-slate-300">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch {
    return <div className={cn("whitespace-pre-line leading-relaxed text-slate-300", className)}>{content}</div>;
  }
}

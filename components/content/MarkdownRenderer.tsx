"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownRenderer({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div className={cn("markdown-body text-sm leading-relaxed text-slate-300", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 text-2xl font-semibold tracking-tight text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-6 text-base font-semibold text-cyan-100">{children}</h3>,
          p: ({ children }) => <p className="my-3 text-slate-300">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          ul: ({ children }) => <ul className="my-4 space-y-2 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-5">{children}</ol>,
          li: ({ children }) => <li className="text-slate-300 marker:text-cyan-300">{children}</li>,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full min-w-[720px] text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{children}</th>,
          td: ({ children }) => <td className="border-t border-white/5 px-4 py-3 align-top text-sm text-slate-300">{children}</td>,
          code: ({ children }) => <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-cyan-200">{children}</code>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-5 py-3 text-slate-300">
              {children}
            </blockquote>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export function MarkdownCard({
  title,
  markdown,
  compact = false,
}: {
  title?: string;
  markdown: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
      {title && <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>}
      <MarkdownRenderer markdown={markdown} className={compact ? "max-h-[520px] overflow-hidden" : undefined} />
    </div>
  );
}

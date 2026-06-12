"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const components: Components = {
  h2: ({ children }) => <h2 className="mt-6 text-xl font-bold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 text-lg font-bold tracking-tight first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-7 first:mt-0 last:mb-0" style={{ color: "var(--aurora-text-secondary)" }}>{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6" style={{ color: "var(--aurora-text-secondary)" }}>{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6" style={{ color: "var(--aurora-text-secondary)" }}>{children}</ol>,
  strong: ({ children }) => <strong style={{ color: "var(--aurora-text-primary)" }}>{children}</strong>,
  table: ({ children }) => <div className="my-5 overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--aurora-border-soft)" }}><table className="min-w-full text-left text-sm">{children}</table></div>,
  th: ({ children }) => <th className="border-b px-4 py-3 text-xs font-bold uppercase tracking-[0.12em]" style={{ borderColor: "var(--aurora-border-soft)", background: "var(--aurora-background-soft)" }}>{children}</th>,
  td: ({ children }) => <td className="border-b px-4 py-3" style={{ borderColor: "var(--aurora-border-soft)" }}>{children}</td>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-cyan-50">{children}</pre>,
  code: ({ children }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">{children}</code>,
};

export function IsiMathRenderer({ content, className = "" }: { content: string; className?: string }) {
  return <div className={`max-w-none text-[15px] sm:text-base ${className}`}><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]} components={components}>{content}</ReactMarkdown></div>;
}

export function RawLatexBlock({ content }: { content: string }) {
  return <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border bg-slate-950 p-4 text-sm leading-7 text-cyan-50" style={{ borderColor: "var(--aurora-border-soft)" }}>{content}</pre>;
}

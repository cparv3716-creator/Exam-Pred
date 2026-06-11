"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const components: Components = {
  h1: ({ children }) => <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-7 text-slate-700 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-950">{children}</strong>,
  blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-cyan-300 bg-cyan-50/70 px-4 py-3 text-slate-700">{children}</blockquote>,
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white/85">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
  th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 align-top text-slate-700">{children}</td>,
  code: ({ children }) => <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] text-slate-900">{children}</code>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{children}</pre>,
};

export function DilrMarkdown({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`dilr-markdown max-w-none text-[15px] sm:text-base ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

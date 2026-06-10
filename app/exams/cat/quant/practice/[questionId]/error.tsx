"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

export default function PracticeQuestionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell withGrid>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/[0.06]">
          <AlertTriangle size={26} className="text-rose-300" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          We couldn&apos;t display this practice question. You can try again or head back to the
          practice list.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.08] px-5 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/[0.14]"
          >
            <RotateCw size={15} /> Try again
          </button>
          <Link
            href="/exams/cat/quant"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            <ArrowLeft size={15} /> Back to practice
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

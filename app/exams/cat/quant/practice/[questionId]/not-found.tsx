import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

export default function PracticeQuestionNotFound() {
  return (
    <PageShell withGrid>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <SearchX size={26} className="text-cyan-300" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">Question not found</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          This practice question doesn&apos;t exist or may have been moved. It could be an old or
          mistyped link.
        </p>
        <Link
          href="/exams/cat/quant"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.08] px-5 py-2.5 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/[0.14]"
        >
          <ArrowLeft size={15} /> Back to CAT Quant practice
        </Link>
      </section>
    </PageShell>
  );
}

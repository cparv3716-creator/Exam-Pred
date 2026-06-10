import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourcePracticeBrowser } from "@/components/practice/LatexSourcePracticeBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantLatexSourceByLevel } from "@/lib/content/practice/cat-quant-latex-source";
import type { PracticeLevel } from "@/types/practice";

const level = "Beginner" as PracticeLevel;

export const metadata: Metadata = { title: `CAT Quant LaTeX Source ${level}` };

export default function CatQuantLatexSourceLevelPage() {
  const questions = getCatQuantLatexSourceByLevel(level);
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Link href="/exams/cat/quant/latex-source" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300">
          <ArrowLeft size={14} /> Back to LaTeX source bank
        </Link>
        <div className="mt-8">
          <SectionHeader
            eyebrow="CAT Quant · LaTeX source"
            title={`${level} practice from source TeX`}
            description="These questions are rendered from local LaTeX files only. The older PDF-extracted generated-practice bank is not used on this route."
          />
        </div>
        <div className="mt-10">
          <LatexSourcePracticeBrowser questions={questions} level={level} />
        </div>
      </section>
    </PageShell>
  );
}
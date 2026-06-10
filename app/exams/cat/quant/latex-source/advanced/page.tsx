import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourcePracticeBrowser } from "@/components/practice/LatexSourcePracticeBrowser";
import { PageHero } from "@/components/ui/premium";
import { getCatQuantLatexSourceByLevel } from "@/lib/content/practice/cat-quant-latex-source";
import type { PracticeLevel } from "@/types/practice";

const level = "Advanced" as PracticeLevel;

export const metadata: Metadata = { title: `CAT Quant Practice — ${level}` };

export default function CatQuantLatexSourceLevelPage() {
  const questions = getCatQuantLatexSourceByLevel(level);
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHero
          breadcrumb={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "Quant", href: "/exams/cat/quant/latex-source" },
            { label: level },
          ]}
          eyebrow="CAT Quant practice"
          accent="purple"
          title={`${level} Quant practice`}
          description="Very hard, simulation-grade practice for the final stretch, with detailed solutions on every item."
          stats={[{ label: "Questions", value: questions.length.toLocaleString() }]}
        />
        <div className="mt-10">
          <LatexSourcePracticeBrowser questions={questions} level={level} />
        </div>
      </section>
    </PageShell>
  );
}

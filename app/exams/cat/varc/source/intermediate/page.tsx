import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourcePracticeBrowser } from "@/components/practice/VarcSourcePracticeBrowser";
import { PageHero } from "@/components/ui/premium";
import { getCatVarcSourceByLevel } from "@/lib/content/practice/cat-varc-source";
import type { PracticeLevel } from "@/types/practice";

const level = "Intermediate" as PracticeLevel;

export const metadata: Metadata = { title: `CAT VARC Practice — ${level}` };

export default function CatVarcSourceIntermediatePage() {
  const questions = getCatVarcSourceByLevel(level);
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHero
          breadcrumb={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "VARC", href: "/exams/cat/varc/source" },
            { label: level },
          ]}
          eyebrow="CAT VARC practice"
          accent="cyan"
          title={`${level} VARC practice`}
          description="CAT-level RC passages and verbal reasoning, preserved exactly from source."
          stats={[{ label: "Questions", value: questions.length.toLocaleString() }]}
        />
        <div className="mt-10">
          <VarcSourcePracticeBrowser questions={questions} level={level} />
        </div>
      </section>
    </PageShell>
  );
}

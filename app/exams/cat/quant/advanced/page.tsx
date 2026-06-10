import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeLevelTabs } from "@/components/practice/PracticeLevelTabs";
import { PracticeLockGate } from "@/components/practice/PracticeLockGate";
import { PracticeQuestionBrowser } from "@/components/practice/PracticeQuestionBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantPracticeByLevel } from "@/lib/content/practice/cat-quant-practice";

export const metadata: Metadata = { title: "CAT Quant Advanced Practice" };

export default function CatQuantAdvancedPage() {
  const questions = getCatQuantPracticeByLevel("Advanced");
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Advanced practice"
          title="Tough CAT Quant and simulation-grade reasoning"
          description="Hard and Very Hard generated practice with method-selection pressure, multi-condition reasoning and brute-force resistance. Premium only."
        />
        <div className="mt-8"><PracticeLevelTabs active="Advanced" /></div>
        <div className="mt-8"><PracticeLockGate level="Advanced" /></div>
        <div className="mt-8"><PracticeQuestionBrowser questions={questions} level="Advanced" /></div>
      </section>
    </PageShell>
  );
}

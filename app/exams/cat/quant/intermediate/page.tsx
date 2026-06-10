import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeLevelTabs } from "@/components/practice/PracticeLevelTabs";
import { PracticeLockGate } from "@/components/practice/PracticeLockGate";
import { PracticeQuestionBrowser } from "@/components/practice/PracticeQuestionBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantPracticeByLevel } from "@/lib/content/practice/cat-quant-practice";

export const metadata: Metadata = { title: "CAT Quant Intermediate Practice" };

export default function CatQuantIntermediatePage() {
  const questions = getCatQuantPracticeByLevel("Intermediate");
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Intermediate practice"
          title="CAT-level Quant drills"
          description="Medium-Hard and CAT-level generated practice. Free users get limited previews; Premium/Admin unlock full solutions."
        />
        <div className="mt-8"><PracticeLevelTabs active="Intermediate" /></div>
        <div className="mt-8"><PracticeLockGate level="Intermediate" /></div>
        <div className="mt-8"><PracticeQuestionBrowser questions={questions} level="Intermediate" /></div>
      </section>
    </PageShell>
  );
}

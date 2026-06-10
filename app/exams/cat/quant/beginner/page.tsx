import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeLevelTabs } from "@/components/practice/PracticeLevelTabs";
import { PracticeLockGate } from "@/components/practice/PracticeLockGate";
import { PracticeQuestionBrowser } from "@/components/practice/PracticeQuestionBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantPracticeByLevel } from "@/lib/content/practice/cat-quant-practice";

export const metadata: Metadata = { title: "CAT Quant Beginner Practice" };

export default function CatQuantBeginnerPage() {
  const questions = getCatQuantPracticeByLevel("Beginner");
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Beginner practice"
          title="CAT Quant foundations"
          description="Easy/Medium generated practice for concepts, formula familiarity and direct application. This is not PYQ content."
        />
        <div className="mt-8"><PracticeLevelTabs active="Beginner" /></div>
        <div className="mt-8"><PracticeLockGate level="Beginner" /></div>
        <div className="mt-8"><PracticeQuestionBrowser questions={questions} level="Beginner" /></div>
      </section>
    </PageShell>
  );
}

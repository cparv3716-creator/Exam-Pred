import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ExamCard } from "@/components/exams/ExamCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OutlinePill } from "@/components/ui/Badge";
import { examCategories, exams } from "@/data/exams";

export const metadata: Metadata = {
  title: "Supported Exams",
  description: "Explore ExamIQ supported exams with demo PYQ counts, topic coverage, and premium analytics previews.",
};

export default function ExamsPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Exam directory"
          title="Choose an intelligence cockpit"
          description="CAT is connected to local pipeline outputs. Other exam cards currently show demo preview coverage until their pipelines are uploaded."
        />
        <div className="mt-8 flex flex-wrap gap-2">
          {examCategories.map((category) => (
            <OutlinePill key={category}>{category}</OutlinePill>
          ))}
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

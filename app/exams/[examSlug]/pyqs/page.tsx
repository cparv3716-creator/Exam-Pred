import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PYQExperience } from "@/components/exams/PYQExperience";
import { LocalPyqEmptyState, LocalPyqExperience } from "@/components/content/LocalPyqExperience";
import { exams, getExamBySlug } from "@/data/exams";
import { getQuestionsByExam } from "@/data/questions";
import { getExamPyqs, getPyqCoverageSummary, getPyqStats } from "@/lib/content/pyqs";

type Params = Promise<{ examSlug: string }>;

export function generateStaticParams() {
  return exams.map((exam) => ({ examSlug: exam.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  return {
    title: exam ? `${exam.name} PYQ Analysis` : "PYQ Analysis",
    description: "Synthetic demo PYQ analysis with role-aware preview gates.",
  };
}

export default async function ExamPYQPage({ params }: { params: Params }) {
  const { examSlug } = await params;
  const exam = getExamBySlug(examSlug);
  if (!exam) notFound();
  const localPyqs = exam.slug === "cat" ? getExamPyqs(exam.slug) : [];
  const localStats = exam.slug === "cat" ? getPyqStats(exam.slug) : null;
  const localCoverage = exam.slug === "cat" ? getPyqCoverageSummary(exam.slug) : [];
  const questions = getQuestionsByExam(exam.slug);
  const hasLocalCatPyqs = exam.slug === "cat" && localPyqs.length > 0 && localStats;

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={`${exam.name} PYQ intelligence`}
          title={exam.slug === "cat" ? "CAT local PYQ bank" : "Demo PYQ analysis"}
          description={exam.slug === "cat" ? "Reads validated local PYQ JSON files from content/cat/pyqs/validated when uploaded. Predicted papers and reports remain connected from Phase 2A." : "Demo preview items only. Guests see the first three cards; free users unlock basic PYQ analysis; premium users unlock analytics widgets."}
        />
        <div className="mt-10">
          {exam.slug === "cat" ? (
            hasLocalCatPyqs ? (
              <LocalPyqExperience examSlug={exam.slug} rows={localPyqs} stats={localStats} coverage={localCoverage} />
            ) : (
              <LocalPyqEmptyState />
            )
          ) : (
            <PYQExperience exam={exam} questions={questions} />
          )}
        </div>
      </section>
    </PageShell>
  );
}

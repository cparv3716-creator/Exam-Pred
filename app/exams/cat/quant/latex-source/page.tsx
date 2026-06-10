import type { Metadata } from "next";
import { Crown, Target, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourcePracticeBrowser } from "@/components/practice/LatexSourcePracticeBrowser";
import { PageHero, PremiumSectionHeader, PracticeLaunchCard } from "@/components/ui/premium";
import { getCatQuantLatexSourceQuestions, getCatQuantLatexSourceStats } from "@/lib/content/practice/cat-quant-latex-source";

export const metadata: Metadata = {
  title: "CAT Quant Practice",
  description: "Source-authored CAT Quant practice across beginner, intermediate and advanced levels.",
};

export default function CatQuantLatexSourcePage() {
  const questions = getCatQuantLatexSourceQuestions();
  const stats = getCatQuantLatexSourceStats();
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHero
          breadcrumb={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "Quant" },
          ]}
          eyebrow="CAT Quant practice"
          title="Source-authored CAT Quant practice"
          description="Clean, source-grounded Quant questions with transparent difficulty levels and detailed solutions. Pick a level or browse the full bank below."
          stats={[
            { label: "Questions", value: stats.total.toLocaleString() },
            { label: "Topics", value: String(stats.topicCount) },
            { label: "Subtopics", value: String(stats.subtopicCount) },
            { label: "Levels", value: "3" },
          ]}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <PracticeLaunchCard
            icon={Zap}
            accent="emerald"
            title="Beginner"
            count={stats.beginner}
            href="/exams/cat/quant/latex-source/beginner"
            detail="Easy and medium foundation questions to build concept fluency."
          />
          <PracticeLaunchCard
            icon={Target}
            accent="cyan"
            title="Intermediate"
            count={stats.intermediate}
            href="/exams/cat/quant/latex-source/intermediate"
            detail="Medium-hard and hard CAT-level items to sharpen application."
          />
          <PracticeLaunchCard
            icon={Crown}
            accent="purple"
            title="Advanced"
            count={stats.advanced}
            href="/exams/cat/quant/latex-source/advanced"
            detail="Very hard, simulation-grade practice for the final stretch."
          />
        </div>

        <div className="mt-16">
          <PremiumSectionHeader
            eyebrow="Browse the bank"
            title="All Quant practice"
            description="Filter by topic, difficulty and question type. Open any question for the full solution."
          />
          <div className="mt-8">
            <LatexSourcePracticeBrowser questions={questions} level="Mixed" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

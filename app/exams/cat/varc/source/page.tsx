import type { Metadata } from "next";
import { Crown, Target, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourcePracticeBrowser } from "@/components/practice/VarcSourcePracticeBrowser";
import { PageHero, PremiumSectionHeader, PracticeLaunchCard } from "@/components/ui/premium";
import { getCatVarcSourceQuestions, getCatVarcSourceStats } from "@/lib/content/practice/cat-varc-source";

export const metadata: Metadata = {
  title: "CAT VARC Practice",
  description: "CAT Verbal Ability & Reading Comprehension practice, preserved exactly from source.",
};

export default function CatVarcSourcePage() {
  const questions = getCatVarcSourceQuestions();
  const stats = getCatVarcSourceStats();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHero
          breadcrumb={[
            { label: "Exams", href: "/exams" },
            { label: "CAT", href: "/exams/cat" },
            { label: "VARC" },
          ]}
          eyebrow="CAT VARC practice"
          title="Reading Comprehension & Verbal Ability"
          description="Passages and questions are preserved exactly as written — not paraphrased, shortened, or rewritten. Pick a level or browse the full bank below."
          stats={[
            { label: "Questions", value: stats.studentVisible.toLocaleString() },
            { label: "RC sets", value: String(stats.rcPassages) },
            { label: "RC questions", value: String(stats.rcQuestions) },
            { label: "Verbal Ability", value: String(stats.vaQuestions) },
          ]}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <PracticeLaunchCard
            icon={Zap}
            accent="emerald"
            title="Beginner"
            count={stats.beginner}
            href="/exams/cat/varc/source/beginner"
            detail="Foundation-level RC passages and Verbal Ability practice."
          />
          <PracticeLaunchCard
            icon={Target}
            accent="cyan"
            title="Intermediate"
            count={stats.intermediate}
            href="/exams/cat/varc/source/intermediate"
            detail="CAT-level RC passages and verbal reasoning."
          />
          <PracticeLaunchCard
            icon={Crown}
            accent="purple"
            title="Advanced"
            count={stats.advanced}
            href="/exams/cat/varc/source/advanced"
            detail="High-difficulty RC sets and challenging Verbal Ability."
          />
        </div>

        <div className="mt-16">
          <PremiumSectionHeader
            eyebrow="Browse the bank"
            title="All VARC practice"
            description="Filter by question type and level. Open any item for the full passage, options and solution."
          />
          <div className="mt-8">
            <VarcSourcePracticeBrowser questions={questions} level="Mixed" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

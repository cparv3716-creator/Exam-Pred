import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, Target, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PracticeStatsCards } from "@/components/practice/PracticeStatsCards";
import { TopicCoverageGrid } from "@/components/practice/TopicCoverageGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantPracticeCoverage, getCatQuantPracticeStats } from "@/lib/content/practice/cat-quant-practice";

export const metadata: Metadata = {
  title: "CAT Quant Generated Practice",
  description: "Generated CAT Quant practice separated from PYQs with beginner, intermediate and advanced levels.",
};

export default function CatQuantPracticePage() {
  const stats = getCatQuantPracticeStats();
  const coverage = getCatQuantPracticeCoverage();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAT Quant practice"
          title="Generated CAT-style Quant practice, separate from PYQs."
          description="Practice level, difficulty and topic likelihood are tracked as separate dimensions. These generated questions are not previous-year questions."
        />

        <div className="mt-10">
          <PracticeStatsCards stats={stats} />
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.045] p-6">
          <p className="text-sm font-semibold text-cyan-100">Generated practice questions are separate from PYQs.</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Probability metadata is displayed independently from difficulty and practice level. A high-likelihood topic can still have easy foundation questions.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <LevelCard icon={Zap} title="Beginner" count={stats.beginner} href="/exams/cat/quant/beginner" detail="Easy/Medium foundation and concept-first questions. Mostly free after signup." />
          <LevelCard icon={Target} title="Intermediate" count={stats.intermediate} href="/exams/cat/quant/intermediate" detail="CAT-level generated practice with limited free previews and Premium full solutions." />
          <LevelCard icon={Crown} title="Advanced" count={stats.advanced} href="/exams/cat/quant/advanced" detail="Tough practice and simulation-grade questions. Premium only." />
        </div>

        <div className="mt-12">
          <SectionHeader
            eyebrow="Topic coverage"
            title="CAT Quant topic map"
            description={`${stats.pncProbability} P&C / Probability questions detected across generated practice coverage.`}
          />
          <div className="mt-8">
            <TopicCoverageGrid coverage={coverage} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function LevelCard({ icon: Icon, title, count, href, detail }: { icon: typeof Zap; title: string; count: number; href: string; detail: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/30 hover:bg-white/[0.045]">
      <Icon size={22} className="text-cyan-300" />
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
        <p className="text-3xl font-semibold text-white">{count}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
        Start practice <ArrowRight size={14} />
      </span>
    </Link>
  );
}

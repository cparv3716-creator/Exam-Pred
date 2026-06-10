import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Crown, Database, Target, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { VarcSourcePracticeBrowser } from "@/components/practice/VarcSourcePracticeBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatVarcSourceQuestions, getCatVarcSourceStats } from "@/lib/content/practice/cat-varc-source";

export const metadata: Metadata = {
  title: "CAT VARC Source Practice",
  description: "CAT Verbal Ability & Reading Comprehension practice built directly from source PDFs.",
};

export default function CatVarcSourcePage() {
  const questions = getCatVarcSourceQuestions();
  const stats = getCatVarcSourceStats();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAT VARC · Source direct"
          title="Reading Comprehension & Verbal Ability from source."
          description="This bank is built directly from the source PDF files. Passages and questions are preserved as written — not paraphrased, not shortened, not rewritten."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Stat label="Total questions" value={stats.total} icon={Database} />
          <Stat label="RC questions" value={stats.rcQuestions} icon={BookOpen} />
          <Stat label="VA questions" value={stats.vaQuestions} icon={Target} />
          <Stat label="Student visible" value={stats.studentVisible} icon={Zap} />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <LevelCard
            icon={Zap}
            title="Beginner"
            count={stats.beginner}
            href="/exams/cat/varc/source/beginner"
            detail="Foundation-level RC and VA practice."
          />
          <LevelCard
            icon={Target}
            title="Intermediate"
            count={stats.intermediate}
            href="/exams/cat/varc/source/intermediate"
            detail="CAT-level RC passages and verbal reasoning."
          />
          <LevelCard
            icon={Crown}
            title="Advanced"
            count={stats.advanced}
            href="/exams/cat/varc/source/advanced"
            detail="High-difficulty RC sets and challenging VA questions."
          />
        </div>

        <div className="mt-12">
          <VarcSourcePracticeBrowser questions={questions} level="Mixed" />
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Database }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <Icon size={18} className="text-cyan-300" />
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function LevelCard({ icon: Icon, title, count, href, detail }: { icon: typeof Zap; title: string; count: number; href: string; detail: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/30 hover:bg-white/[0.045]"
    >
      <Icon size={22} className="text-cyan-300" />
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
        <p className="text-3xl font-semibold text-white">{count}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
        Open level <ArrowRight size={14} />
      </span>
    </Link>
  );
}

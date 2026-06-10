import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, Database, FileText, Target, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LatexSourcePracticeBrowser } from "@/components/practice/LatexSourcePracticeBrowser";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatQuantLatexSourceQuestions, getCatQuantLatexSourceStats } from "@/lib/content/practice/cat-quant-latex-source";

export const metadata: Metadata = {
  title: "CAT Quant LaTeX Source Practice",
  description: "Direct LaTeX-source CAT Quant practice bank rendered from local TeX files.",
};

export default function CatQuantLatexSourcePage() {
  const questions = getCatQuantLatexSourceQuestions();
  const stats = getCatQuantLatexSourceStats();
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="CAT Quant · LaTeX source"
          title="Clean source-authored practice, rendered directly from TeX."
          description="This lane uses the local LaTeX files as the source of truth. It does not mix in the older PDF-extracted practice bank."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <Stat label="TeX files" value={stats.filesFound} icon={FileText} />
          <Stat label="Questions" value={stats.total} icon={Database} />
          <Stat label="Full parse" value={stats.fullParse} icon={Target} />
          <Stat label="Raw fallback" value={stats.rawFallback} icon={Zap} />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <LevelCard icon={Zap} title="Beginner" count={stats.beginner} href="/exams/cat/quant/latex-source/beginner" detail="Easy and Medium source-authored Quant practice." />
          <LevelCard icon={Target} title="Intermediate" count={stats.intermediate} href="/exams/cat/quant/latex-source/intermediate" detail="Medium-Hard and Hard CAT-level items from TeX." />
          <LevelCard icon={Crown} title="Advanced" count={stats.advanced} href="/exams/cat/quant/latex-source/advanced" detail="Very Hard source-authored practice and simulation items." />
        </div>

        <div className="mt-12">
          <LatexSourcePracticeBrowser questions={questions} level="Mixed" />
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
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
    <Link href={href} className="group rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-cyan-400/30 hover:bg-white/[0.045]">
      <Icon size={22} className="text-cyan-300" />
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
        <p className="text-3xl font-semibold text-white">{count}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">Open level <ArrowRight size={14} /></span>
    </Link>
  );
}
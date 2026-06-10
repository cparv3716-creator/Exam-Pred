import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Calculator,
  FileText,
  Layers,
  ListChecks,
  ScrollText,
  Sigma,
  Target,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import {
  PageHero,
  PremiumSectionHeader,
  ExamSectionCard,
  QuickLinkCard,
  RouteCTA,
  ProgressPill,
} from "@/components/ui/premium";
import { getCatQuantLatexSourceStats } from "@/lib/content/practice/cat-quant-latex-source";
import { getCatVarcSourceStats } from "@/lib/content/practice/cat-varc-source";

export const metadata: Metadata = {
  title: "CAT Intelligence Dashboard",
  description:
    "Premium CAT preparation cockpit — live Quant and VARC practice banks, section reports, and a DILR bank on the way.",
};

export default function CatDashboardPage() {
  const quant = getCatQuantLatexSourceStats();
  const varc = getCatVarcSourceStats();

  const totalPractice = quant.total + varc.studentVisible;
  const heroStats = [
    { label: "Practice questions", value: totalPractice.toLocaleString() },
    { label: "Quant topics", value: String(quant.topicCount) },
    { label: "RC passages", value: String(varc.rcPassages) },
    { label: "Live sections", value: "2" },
  ];

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHero
          breadcrumb={[
            { label: "Exams", href: "/exams" },
            { label: "CAT" },
          ]}
          eyebrow="CAT intelligence dashboard"
          title="Your CAT preparation cockpit"
          description="Common Admission Test — Quant and VARC practice banks are live, with section reports available and a DILR bank coming soon. Source-grounded questions, transparent difficulty, honest predictions."
          stats={heroStats}
          actions={
            <>
              <RouteCTA href="/exams/cat/quant/latex-source" icon={Target} iconPosition="start">
                Practice Quant
              </RouteCTA>
              <RouteCTA href="/exams/cat/varc/source" variant="secondary" icon={BookOpenCheck} iconPosition="start">
                Practice VARC
              </RouteCTA>
              <RouteCTA href="/exams/cat/reports" variant="secondary" icon={ScrollText} iconPosition="start">
                View reports
              </RouteCTA>
            </>
          }
        />
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <PremiumSectionHeader
          eyebrow="Sections"
          title="Three sections, built section by section"
          description="Each CAT section gets its own source-grounded bank. Quant and VARC are live now; DILR is in preparation."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <ExamSectionCard
            title="Quantitative Ability"
            abbr="QA · Quant"
            icon={Calculator}
            accent="cyan"
            status="live"
            href="/exams/cat/quant/latex-source"
            ctaLabel="Start Quant practice"
            description="LaTeX-source CAT Quant practice rendered directly from authored TeX, spanning beginner to advanced."
            stats={[
              { label: "Questions", value: quant.total.toLocaleString() },
              { label: "Topics", value: String(quant.topicCount) },
              { label: "Levels", value: "3" },
            ]}
          />
          <ExamSectionCard
            title="Verbal & Reading"
            abbr="VARC"
            icon={BookOpenCheck}
            accent="blue"
            status="live"
            href="/exams/cat/varc/source"
            ctaLabel="Start VARC practice"
            description="Reading Comprehension and Verbal Ability built directly from source — passages preserved exactly as written."
            stats={[
              { label: "Questions", value: varc.studentVisible.toLocaleString() },
              { label: "RC sets", value: String(varc.rcPassages) },
              { label: "Levels", value: "3" },
            ]}
          />
          <ExamSectionCard
            title="Data Interpretation & LR"
            abbr="DILR"
            icon={Layers}
            accent="purple"
            status="soon"
            description="Data Interpretation and Logical Reasoning sets are in preparation and will follow the same source-grounded approach."
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PremiumSectionHeader eyebrow="Quick links" title="Jump straight in" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            href="/exams/cat/quant/latex-source"
            icon={Sigma}
            accent="cyan"
            title="Quant — LaTeX source bank"
            description="Beginner · Intermediate · Advanced"
          />
          <QuickLinkCard
            href="/exams/cat/varc/source"
            icon={BookOpenCheck}
            accent="blue"
            title="VARC — source bank"
            description="RC passages & Verbal Ability"
          />
          <QuickLinkCard
            href="/exams/cat/reports"
            icon={FileText}
            accent="emerald"
            title="CAT reports & downloads"
            description="Section summaries & PDFs"
          />
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white/[0.015] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PremiumSectionHeader
            eyebrow="Practice coverage"
            title="What's in the CAT banks today"
            description="Live counts drawn from the connected Quant and VARC source banks."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <CoverageStat icon={Calculator} accent="cyan" label="Quant questions" value={quant.total} levels={[
              ["Beginner", quant.beginner],
              ["Intermediate", quant.intermediate],
              ["Advanced", quant.advanced],
            ]} />
            <CoverageStat icon={BookOpenCheck} accent="blue" label="VARC questions" value={varc.studentVisible} levels={[
              ["Beginner", varc.beginner],
              ["Intermediate", varc.intermediate],
              ["Advanced", varc.advanced],
            ]} />
            <SimpleCoverage icon={ListChecks} accent="purple" label="VARC reading sets" value={varc.rcPassages} detail="Full RC passages with question sets." />
            <SimpleCoverage icon={BarChart3} accent="emerald" label="Quant topics covered" value={quant.topicCount} detail={`${quant.subtopicCount} subtopics mapped.`} />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-slate-600">
            Counts reflect student-visible, source-grounded items. ExamIQ provides pattern-based preparation
            material and does not claim leaked, official, or guaranteed exam questions.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10 p-10 text-center sm:p-14">
          <ProgressPill accent="emerald" dot>
            Quant & VARC live now
          </ProgressPill>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Pick a section and start practising.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Every question is rendered from its source with a transparent difficulty level and a detailed solution.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RouteCTA href="/exams/cat/quant/latex-source" icon={ArrowRight}>
              Start Quant practice
            </RouteCTA>
            <RouteCTA href="/exams/cat/varc/source" variant="secondary" icon={ArrowRight}>
              Start VARC practice
            </RouteCTA>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CoverageStat({
  icon: Icon,
  label,
  value,
  levels,
  accent,
}: {
  icon: typeof Calculator;
  label: string;
  value: number;
  levels: [string, number][];
  accent: "cyan" | "blue" | "purple" | "emerald";
}) {
  const accentText = {
    cyan: "text-cyan-300",
    blue: "text-blue-300",
    purple: "text-purple-300",
    emerald: "text-emerald-300",
  }[accent];
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <Icon size={18} className={accentText} />
        <span className="text-3xl font-semibold tracking-tight text-white">{value.toLocaleString()}</span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
        {levels.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{name}</span>
            <span className="font-semibold text-slate-300">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleCoverage({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Calculator;
  label: string;
  value: number;
  detail: string;
  accent: "cyan" | "blue" | "purple" | "emerald";
}) {
  const accentText = {
    cyan: "text-cyan-300",
    blue: "text-blue-300",
    purple: "text-purple-300",
    emerald: "text-emerald-300",
  }[accent];
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <Icon size={18} className={accentText} />
        <span className="text-3xl font-semibold tracking-tight text-white">{value.toLocaleString()}</span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-4 border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-500">{detail}</p>
    </div>
  );
}

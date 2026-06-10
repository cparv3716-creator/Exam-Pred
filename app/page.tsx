import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers,
  ListChecks,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { HeroSection } from "@/components/marketing/HeroSection";
import { PremiumSectionHeader, FeaturePillarCard, ExamSectionCard, TrustSignalCard, RouteCTA } from "@/components/ui/premium";
import { faqs } from "@/data/analytics";
import { legalDisclaimer } from "@/lib/utils";

export default function HomePage() {
  return (
    <PageShell withGrid>
      <HeroSection />

      {/* Trust strip */}
      <section className="border-y border-white/5 bg-white/[0.015] py-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            Built on transparent, source-grounded preparation data
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><FileText size={15} className="text-cyan-400/70" /> LaTeX-source Quant bank</span>
            <span className="flex items-center gap-2"><BookOpenCheck size={15} className="text-cyan-400/70" /> Verified VARC passages</span>
            <span className="flex items-center gap-2"><BarChart3 size={15} className="text-cyan-400/70" /> Section-wise reports</span>
            <span className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-cyan-400/70" /> Transparent difficulty</span>
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <PremiumSectionHeader
          eyebrow="Platform pillars"
          title="An exam cockpit, not a question dump"
          description="Four systems work together to turn raw question banks into decisions about what to study and how."
          align="center"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeaturePillarCard
            icon={BrainCircuit}
            title="Prediction engine"
            description="Pattern-based topic likelihood that blends frequency, recurrence and recent trend movement — never a guarantee, always transparent."
          />
          <FeaturePillarCard
            icon={ListChecks}
            accent="blue"
            title="Practice bank"
            description="Source-grounded CAT Quant and VARC questions, preserved exactly as authored, organised by level and topic."
          />
          <FeaturePillarCard
            icon={BarChart3}
            accent="purple"
            title="Section analytics"
            description="Section-wise reports and coverage maps so you can see where your effort is going and what's left to cover."
          />
          <FeaturePillarCard
            icon={SlidersHorizontal}
            accent="emerald"
            title="Difficulty calibration"
            description="Every item carries an honest, transparent difficulty level so practice scales from foundation to simulation-grade."
          />
        </div>
      </section>

      {/* Exam coverage */}
      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PremiumSectionHeader
            eyebrow="Exam coverage"
            title="Live now for CAT, expanding next"
            description="CAT is fully connected to live practice banks and reports. JEE, NEET and UPSC are on the roadmap."
            action={<RouteCTA href="/exams" variant="ghost">View all exams</RouteCTA>}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ExamSectionCard
              title="CAT"
              abbr="Common Admission Test"
              icon={GraduationCap}
              accent="cyan"
              status="live"
              href="/exams/cat"
              ctaLabel="Open CAT dashboard"
              description="Quant and VARC practice banks live, with section reports and a DILR bank on the way."
            />
            <ExamSectionCard
              title="JEE"
              abbr="Engineering entrance"
              icon={GraduationCap}
              accent="blue"
              status="soon"
              description="Chapter-wise PYQ mapping and high-weightage topic detection across Physics, Chemistry and Maths."
            />
            <ExamSectionCard
              title="NEET"
              abbr="Medical entrance"
              icon={GraduationCap}
              accent="emerald"
              status="soon"
              description="NCERT-linked topic probability and source-grounded practice for Physics, Chemistry and Biology."
            />
            <ExamSectionCard
              title="UPSC"
              abbr="Civil services"
              icon={GraduationCap}
              accent="amber"
              status="soon"
              description="GS-paper theme clustering with current-affairs linkage and transparent pattern previews."
            />
          </div>
        </div>
      </section>

      {/* CAT spotlight */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <PremiumSectionHeader
              eyebrow="Available today"
              title="Start with CAT — Quant & VARC are live"
              description="Jump straight into source-authored practice or read the section reports. No setup, no fluff."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <RouteCTA href="/exams/cat/quant/latex-source" icon={Target} iconPosition="start">
                Practice Quant
              </RouteCTA>
              <RouteCTA href="/exams/cat/varc/source" variant="secondary" icon={BookOpenCheck} iconPosition="start">
                Practice VARC
              </RouteCTA>
              <RouteCTA href="/exams/cat/reports" variant="secondary" icon={ScrollText} iconPosition="start">
                View reports
              </RouteCTA>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Target, label: "Quant practice", text: "LaTeX-source bank across beginner, intermediate and advanced levels." },
              { icon: BookOpenCheck, label: "VARC practice", text: "RC passages and verbal ability preserved exactly from source." },
              { icon: BarChart3, label: "Section reports", text: "Downloadable summaries and pipeline reports for CAT." },
              { icon: Layers, label: "DILR", text: "Data Interpretation & Logical Reasoning bank — coming soon." },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <item.icon size={18} className="text-cyan-300" />
                <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality / trust */}
      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PremiumSectionHeader
            eyebrow="Quality & trust"
            title="Honest preparation, by design"
            description="ExamIQ is built around evidence and provenance — not inflated promises."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <TrustSignalCard
              icon={FileText}
              title="Source-grounded practice"
              description="Questions and passages are rendered directly from their source files — not paraphrased, shortened or rewritten."
            />
            <TrustSignalCard
              icon={CheckCircle2}
              title="Verified solutions"
              description="Answers and detailed solutions are kept with their original question so you can check your reasoning end to end."
            />
            <TrustSignalCard
              icon={BarChart3}
              accent="cyan"
              title="Section-wise reports"
              description="Coverage and recommendation summaries are organised by section, so progress is legible at a glance."
            />
            <TrustSignalCard
              icon={SlidersHorizontal}
              accent="purple"
              title="Transparent difficulty levels"
              description="Every item carries an explicit difficulty and practice level — no hidden scoring, no black boxes."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <PremiumSectionHeader eyebrow="FAQ" title="Questions, answered honestly" align="center" />
        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-white/8 bg-white/[0.025] p-5 transition-colors hover:border-white/15">
              <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
                {faq.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10 p-10 text-center sm:p-16">
          <ShieldCheck size={36} className="mx-auto text-cyan-300" />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Prepare with evidence, not guesswork.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">{legalDisclaimer}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/exams/cat"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-cyan transition-opacity hover:opacity-90"
            >
              <BrainCircuit size={16} /> Explore CAT
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/exams/cat/quant/latex-source"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40"
            >
              Start practicing
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

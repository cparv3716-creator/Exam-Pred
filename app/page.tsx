import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Crown,
  DatabaseZap,
  FileLock2,
  FlaskConical,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ExamCard } from "@/components/exams/ExamCard";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SoftPill } from "@/components/ui/Badge";
import { ProbabilityRing } from "@/components/ui/ProbabilityMeter";
import { BlurredPreviewGate } from "@/components/ui/BlurredPreviewGate";
import { ExamIntelligencePreview } from "@/components/dashboard/ExamIntelligencePreview";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { exams } from "@/data/exams";
import { faqs, heatmap, howItWorks, topicProbability } from "@/data/analytics";
import { legalDisclaimer } from "@/lib/utils";

export default function HomePage() {
  return (
    <PageShell withGrid>
      <HeroSection />

      <section className="border-y border-white/5 bg-white/[0.015] py-8">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            Intelligence across major competitive exams
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-slate-400">
            CAT is connected to local pipeline outputs. Other exams currently use demo previews until their pipelines are uploaded.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {exams.map((exam) => (
              <span key={exam.slug} className="text-lg font-semibold text-slate-600 transition-colors hover:text-slate-300">
                {exam.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Supported exams"
          title="Built to scale across every exam"
          description="A premium exam intelligence directory with PYQ structure, topic coverage, trend metadata and role-aware access."
          action={
            <Link href="/exams" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
              View all exams <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.slice(0, 6).map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>

      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="PYQ intelligence preview"
            title="An exam pattern engine, not a question dump"
            description="Every demo question is structured by topic, subtopic, archetype, difficulty and trend metadata."
            align="center"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <FeatureCard icon={BarChart3} title="PYQ Intelligence" description="Dense, scannable question analysis with topic, subtopic and difficulty metadata." />
            <FeatureCard icon={Target} title="Probability Engine" tone="blue" description="Topic likelihood blends frequency, recurrence and recent trend movement." />
            <FeatureCard icon={FlaskConical} title="Trend-Weighted Mocks" tone="purple" description="Mock paper blueprints are generated from transparent prediction specifications." />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SoftPill><Lock size={14} /> Access model demo</SoftPill>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">Blur-lock previews make upgrade value obvious.</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Guests see a limited PYQ preview, free users unlock basic analysis, and premium users unlock analytics, predictions, mocks and reports.
          </p>
        </div>
        <BlurredPreviewGate>
          <div className="grid gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-5">
            {["Topic probability matrix", "Premium report download", "Predicted archetype rationale"].map((item) => (
              <div key={item} className="rounded-lg border border-white/8 bg-white/[0.025] p-4">
                <p className="text-sm font-semibold text-white">{item}</p>
                <p className="mt-2 text-sm text-slate-500">A locked preview layer for non-signed-in users.</p>
              </div>
            ))}
          </div>
        </BlurredPreviewGate>
      </section>

      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeader
              eyebrow="Probability engine preview"
              title="See likelihood, not endless lists"
              description="CAT uses local pipeline output where available; other exams currently show demo preview probability widgets."
            />
            <div className="mt-8 flex flex-wrap gap-6">
              {topicProbability.slice(0, 4).map((topic) => (
                <div key={topic.topic} className="flex flex-col items-center gap-2">
                  <ProbabilityRing value={topic.probability} size={86} />
                  <span className="max-w-[96px] text-center text-xs text-slate-400">{topic.topic}</span>
                </div>
              ))}
            </div>
          </div>
          <StaticTrendPreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <FeatureCard icon={FileLock2} title="Trend-weighted mocks" description="Premium mock papers are weighted by topic movement, recurrence and difficulty blend." tone="purple" />
          <FeatureCard icon={Crown} title="Free vs Premium" description="Free handles basic PYQ analysis. Premium unlocks the full cockpit and download stack." tone="blue" />
          <FeatureCard icon={DatabaseZap} title="Admin content pipeline" description="A premium placeholder console for upload, review, quality checks and publishing." tone="emerald" />
        </div>
      </section>

      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Dashboard preview" title="A cockpit for exam preparation decisions" align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <ExamIntelligencePreview />
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <h3 className="text-base font-semibold text-white">Probability heatmap</h3>
              <p className="mt-1 text-sm text-slate-500">Synthetic topic-by-year weights.</p>
              <div className="mt-6">
                <TopicHeatmap data={heatmap} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Free vs Premium comparison" title="Start free. Upgrade when you want the edge." align="center" />
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/8">
          {[
            ["PYQs with topic and subtopic", true, true],
            ["Basic filters and difficulty", true, true],
            ["Basic PYQ analysis downloads", true, true],
            ["Topic probability dashboard", false, true],
            ["Predicted high-probability practice", false, true],
            ["Trend-weighted mock papers", false, true],
            ["Topic heatmaps and premium reports", false, true],
          ].map(([label, free, premium]) => (
            <div key={String(label)} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/5 px-6 py-3.5">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="flex w-20 justify-center">{free ? <Check size={17} className="text-emerald-300" /> : <X size={17} className="text-slate-700" />}</span>
              <span className="flex w-20 justify-center">{premium ? <Check size={17} className="text-cyan-300" /> : <X size={17} className="text-slate-700" />}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Admin pipeline preview" title="Content operations, prepared for Phase 2" description="Admin placeholders already frame upload, quality review, prediction specs and publish/unpublish controls." />
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {howItWorks.map((step) => (
              <div key={step.step} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
                <span className="text-sm font-semibold text-cyan-300">{step.step}</span>
                <h3 className="mt-3 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Questions, answered honestly" align="center" />
        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-xl border border-white/8 bg-white/[0.025] p-5">
              <summary className="cursor-pointer text-sm font-semibold text-white">{faq.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-purple-600/10 p-10 text-center sm:p-16">
          <ShieldCheck size={36} className="mx-auto text-cyan-300" />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Prepare with evidence, not guesswork.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">{legalDisclaimer}</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white">
            <Brain size={16} /> Start Free
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function StaticTrendPreview() {
  const rows = [
    { label: "Arithmetic", values: [44, 52, 61, 74, 86] },
    { label: "Algebra", values: [38, 48, 58, 67, 79] },
    { label: "Geometry", values: [70, 64, 58, 51, 44] },
    { label: "Modern Math", values: [30, 37, 45, 52, 58] },
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
      <h3 className="text-base font-semibold text-white">Topic trend movement</h3>
      <p className="mt-1 text-sm text-slate-500">Lightweight homepage preview; detailed charts live in dashboards.</p>
      <div className="mt-6 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-300">{row.label}</span>
              <span className="text-cyan-300">{row.values.at(-1)}%</span>
            </div>
            <div className="flex h-16 items-end gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
              {row.values.map((value, index) => (
                <div
                  key={`${row.label}-${index}`}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-300 shadow-cyan"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

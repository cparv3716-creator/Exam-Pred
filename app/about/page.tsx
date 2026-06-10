import type { Metadata } from "next";
import { Brain, ShieldCheck, Sparkles, Target } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "About ExamIQ's pattern-based exam intelligence demo.",
};

export default function AboutPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About ExamIQ"
          title="A premium AI-edtech platform for preparation intelligence"
          description="ExamIQ is designed to transform legally permitted question metadata into topic trends, practice priorities, mock blueprints and downloadable reports."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <FeatureCard icon={Brain} title="Pattern-first" description="The product centers on topics, subtopics, archetypes, difficulty and recurrence." />
          <FeatureCard icon={Target} title="Probability-aware" tone="blue" description="Signals are presented as likelihood estimates and practice priorities, never as certainty." />
          <FeatureCard icon={ShieldCheck} title="Clear boundaries" tone="emerald" description="The platform avoids leaked, official, exact, guaranteed or sure-shot claims." />
        </div>
        <div className="mt-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-8">
          <Sparkles size={26} className="text-cyan-300" />
          <h2 className="mt-4 text-2xl font-semibold text-white">Current build status</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            CAT is connected to local pipeline outputs. Other exams currently use demo previews until their pipelines are uploaded. Real auth, database-backed content, upload storage, subscriptions and deployment remain Phase 2B.
          </p>
          <p className="mt-5 text-sm font-medium text-slate-300">{legalDisclaimer}</p>
        </div>
      </section>
    </PageShell>
  );
}

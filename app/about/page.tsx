import type { Metadata } from "next";
import { Brain, ShieldCheck, Sparkles, Target } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: "About Statstrive's pattern-based exam intelligence platform.",
};

const PRINCIPLES = [
  {
    icon: Brain,
    title: "Pattern-first",
    desc: "The product centers on topics, subtopics, archetypes, difficulty and recurrence — the structure behind the exam.",
  },
  {
    icon: Target,
    title: "Probability-aware",
    desc: "Signals are presented as likelihood estimates and practice priorities, never as certainty.",
  },
  {
    icon: ShieldCheck,
    title: "Clear boundaries",
    desc: "The platform avoids leaked, official, exact, guaranteed or sure-shot claims.",
  },
];

export default function AboutPage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
              About Statstrive
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              A serious platform for preparation intelligence.
            </h1>
            <p className="mt-4 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              Statstrive transforms legally permitted question metadata into topic trends, practice
              priorities, mock blueprints and downloadable reports.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="aurora-glass aurora-card-hover p-6">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))",
                    boxShadow: "var(--aurora-glow-md)",
                  }}
                >
                  <Icon size={20} aria-hidden />
                </span>
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="aurora-glass relative mt-12 overflow-hidden p-8"
            style={{ borderRadius: "var(--aurora-radius-xl)" }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
            />
            <Sparkles size={24} aria-hidden style={{ color: "var(--aurora-violet)" }} />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Current build status</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
              CAT is connected to local pipeline outputs, with DILR practice live. Other exams use
              demo previews until their pipelines are uploaded. Real auth, database-backed content,
              subscriptions and deployment arrive in a later phase.
            </p>
            <p className="mt-5 text-sm font-medium" style={{ color: "var(--aurora-text-muted)" }}>
              {legalDisclaimer}
            </p>
          </div>
        </div>
      </section>
    </AuroraPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Calculator,
  Layers,
  Network,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { DilrHubResume } from "@/components/dilr/DilrHubResume";
import { getAllDilrSets } from "@/lib/content/dilr";
import { getCatQuantPracticeQuestions } from "@/lib/content/practice/cat-quant-practice";
import { getCatQuantLatexSourceQuestions } from "@/lib/content/practice/cat-quant-latex-source";
import { getCatVarcSourceQuestions } from "@/lib/content/practice/cat-varc-source";
import { getCatPredictedPapers } from "@/lib/content/cat";
import { getExamPyqs } from "@/lib/content/pyqs";

export const metadata: Metadata = {
  title: "CAT Cockpit",
  description:
    "The Statstrive CAT cockpit — DILR live today, Quantitative Aptitude and VARC modules in the pipeline.",
};

/**
 * Aurora Glass Intelligence — CAT section hub.
 * Three modules: DILR (live, content-driven), Quant and VARC (pipeline ready,
 * honestly labelled — no fake sets, no invented content).
 */

const QUANT_TOPICS = ["Arithmetic", "Algebra", "Geometry", "Number System", "Modern Math"];
const VARC_TOPICS = ["RC", "Para Jumbles", "Para Summary", "Odd Sentence", "Critical Reasoning"];

export default function CatHubPage() {
  const dilrSetCount = getAllDilrSets().length;
  const quantCount = getCatQuantPracticeQuestions().length;
  const quantLatexCount = getCatQuantLatexSourceQuestions().length;
  const varcCount = getCatVarcSourceQuestions().length;
  const predictedCount = getCatPredictedPapers().length;
  const pyqCount = getExamPyqs("cat").length;

  return (
    <AuroraPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {/* hub header */}
        <div className="aurora-fade-slide-up max-w-2xl">
          <p
            className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--aurora-primary)" }}
          >
            <span
              aria-hidden
              className="aurora-soft-pulse h-2 w-2 rounded-full"
              style={{ background: "var(--aurora-cyan)", boxShadow: "0 0 12px 2px var(--aurora-glow-cyan)" }}
            />
            Statstrive · CAT Cockpit
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            One exam. Three{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(100deg, var(--aurora-1), var(--aurora-2) 60%, var(--aurora-3))" }}
            >
              intelligence modules.
            </span>
          </h1>
          <p className="mt-4 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
            All three sections are connected to the local content pipeline: generated Quant
            practice, source-true VARC practice, and curated DILR sets — with counts loaded
            from the real question banks, nothing invented.
          </p>
        </div>

        {/* module cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* Quant — live generated bank */}
          <ModuleCard
            icon={Calculator}
            name="Quantitative Aptitude"
            state={quantCount > 0 ? "Active" : "Pipeline ready"}
            live={quantCount > 0}
            desc="Generated quant practice with topic tags, difficulty levels and worked solutions, loaded from the local question bank."
            topics={QUANT_TOPICS}
            cta={
              quantCount > 0
                ? { label: `Open Quant practice (${quantCount} questions)`, href: "/exams/cat/quant" }
                : undefined
            }
          />

          {/* DILR — live */}
          <ModuleCard
            icon={Network}
            name="DILR"
            state="Active"
            live
            desc="Curated hidden-object DILR sets grouped by reasoning pattern, each with metadata, answer key and worked solution."
            topics={["Data Interpretation", "Logical Reasoning", "Hybrid sets", "TITA + MCQ"]}
            extra={<DilrHubResume />}
            cta={{ label: dilrSetCount > 0 ? `Open DILR library (${dilrSetCount} ${dilrSetCount === 1 ? "set" : "sets"})` : "Open DILR library", href: "/exams/cat/dilr" }}
          />

          {/* VARC — live source bank */}
          <ModuleCard
            icon={BookOpenText}
            name="VARC"
            state={varcCount > 0 ? "Active" : "Pipeline ready"}
            live={varcCount > 0}
            desc="Source-true verbal practice across RC and reasoning types, loaded from the local question bank."
            topics={VARC_TOPICS}
            cta={
              varcCount > 0
                ? { label: `Open VARC practice (${varcCount} questions)`, href: "/exams/cat/varc/source" }
                : undefined
            }
          />
        </div>

        {/* more intelligence: practice library, predicted papers, PYQ vault */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/exams/cat/practice"
            className="aurora-glass aurora-card-hover aurora-focus-ring group flex items-center gap-4 p-5"
          >
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}
            >
              <Layers size={18} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold" style={{ color: "var(--aurora-text-primary)" }}>
                Practice library
              </span>
              <span className="block text-xs tabular-nums" style={{ color: "var(--aurora-text-muted)" }}>
                {quantCount + quantLatexCount + varcCount} questions · {dilrSetCount} DILR{" "}
                {dilrSetCount === 1 ? "set" : "sets"}
              </span>
            </span>
            <ArrowRight size={15} aria-hidden className="ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--aurora-primary)" }} />
          </Link>
          <Link
            href="/exams/cat/predicted-papers"
            className="aurora-glass aurora-card-hover aurora-focus-ring group flex items-center gap-4 p-5"
          >
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-violet)" }}
            >
              <Sparkles size={18} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold" style={{ color: "var(--aurora-text-primary)" }}>
                Predicted papers
              </span>
              <span className="block text-xs tabular-nums" style={{ color: "var(--aurora-text-muted)" }}>
                {predictedCount} pattern-based {predictedCount === 1 ? "paper" : "papers"}
              </span>
            </span>
            <ArrowRight size={15} aria-hidden className="ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--aurora-primary)" }} />
          </Link>
          <Link
            href="/exams/cat/pyqs"
            className="aurora-glass aurora-card-hover aurora-focus-ring group flex items-center gap-4 p-5"
          >
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-cyan)" }}
            >
              <BookOpenText size={18} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold" style={{ color: "var(--aurora-text-primary)" }}>
                PYQ vault
              </span>
              <span className="block text-xs tabular-nums" style={{ color: "var(--aurora-text-muted)" }}>
                {pyqCount} validated questions
              </span>
            </span>
            <ArrowRight size={15} aria-hidden className="ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--aurora-primary)" }} />
          </Link>
        </div>

        {/* honest pipeline note */}
        <p
          className="mt-8 flex items-center gap-2 text-sm"
          style={{ color: "var(--aurora-text-muted)" }}
        >
          <Sparkles size={14} aria-hidden style={{ color: "var(--aurora-violet)" }} />
          Counts above are loaded from the local content pipeline at build time — no placeholder question sets.
        </p>
      </section>
    </AuroraPageShell>
  );
}

function ModuleCard({
  icon: Icon,
  name,
  state,
  live,
  desc,
  topics,
  cta,
  extra,
}: {
  icon: typeof Network;
  name: string;
  state: string;
  live: boolean;
  desc: string;
  topics: string[];
  cta?: { label: string; href: string };
  extra?: ReactNode;
}) {
  return (
    <div
      className={`aurora-glass aurora-card-hover relative flex flex-col overflow-hidden p-6 ${live ? "" : "opacity-95"}`}
      style={live ? { boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-md)" } : undefined}
    >
      {/* top hairline: aurora for live, muted for pipeline */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: live
            ? "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))"
            : "var(--aurora-border-soft)",
        }}
      />

      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{
            background: live
              ? "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))"
              : "linear-gradient(135deg, var(--aurora-text-muted), var(--aurora-text-secondary))",
            boxShadow: live ? "var(--aurora-glow-md)" : "var(--aurora-shadow-1)",
          }}
        >
          <Icon size={20} aria-hidden />
        </span>
        <span
          className="aurora-badge"
          style={
            live
              ? {
                  color: "var(--aurora-success)",
                  borderColor: "color-mix(in srgb, var(--aurora-success) 45%, transparent)",
                  background: "color-mix(in srgb, var(--aurora-success) 10%, transparent)",
                }
              : {
                  color: "var(--aurora-violet)",
                  borderColor: "color-mix(in srgb, var(--aurora-violet) 40%, transparent)",
                  background: "color-mix(in srgb, var(--aurora-violet) 8%, transparent)",
                }
          }
        >
          {live && (
            <span
              aria-hidden
              className="aurora-soft-pulse h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--aurora-success)" }}
            />
          )}
          {state}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight">{name}</h2>
      <p className="mt-2 flex-1 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
        {desc}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span key={topic} className="aurora-badge">
            {topic}
          </span>
        ))}
      </div>

      <div className="mt-6">
        {cta ? (
          <Link
            href={cta.href}
            className="aurora-button-primary aurora-focus-ring group w-full text-sm"
            style={{ boxShadow: "var(--aurora-shadow-2), var(--aurora-glow-md)" }}
          >
            {cta.label}
            <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold"
            style={{
              minHeight: 44,
              borderColor: "var(--aurora-border-strong)",
              color: "var(--aurora-text-muted)",
              background: "var(--aurora-background-soft)",
            }}
          >
            Coming soon
          </span>
        )}
        {extra}
      </div>
    </div>
  );
}

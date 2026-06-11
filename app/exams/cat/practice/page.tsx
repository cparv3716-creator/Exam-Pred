import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Calculator, FileText, Network, Sigma, Sparkles } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { getAllDilrSets } from "@/lib/content/dilr";
import { getCatQuantPracticeQuestions } from "@/lib/content/practice/cat-quant-practice";
import { getCatQuantLatexSourceQuestions } from "@/lib/content/practice/cat-quant-latex-source";
import { getCatVarcSourceQuestions } from "@/lib/content/practice/cat-varc-source";
import { getCatPredictedPapers } from "@/lib/content/cat";
import { getExamPyqs } from "@/lib/content/pyqs";

export const metadata: Metadata = {
  title: "CAT Practice Library",
  description:
    "Every CAT question bank connected to Statstrive: generated Quant practice, LaTeX-source Quant, source-true VARC, curated DILR sets, predicted papers and validated PYQs.",
};

/**
 * Aurora Library Mode — the unified CAT practice library. Every count below is
 * loaded from the real local content banks at build time; nothing is invented.
 */
export default function CatPracticeLibraryPage() {
  const banks = [
    {
      icon: Calculator,
      name: "Quant — generated practice",
      count: getCatQuantPracticeQuestions().length,
      unit: "questions",
      desc: "Topic-tagged generated quant bank with difficulty levels and worked solutions.",
      href: "/exams/cat/quant",
      accent: "var(--aurora-primary)",
    },
    {
      icon: Sigma,
      name: "Quant — LaTeX source bank",
      count: getCatQuantLatexSourceQuestions().length,
      unit: "questions",
      desc: "Math-faithful quant questions rendered from curated LaTeX sources.",
      href: "/exams/cat/quant/latex-source",
      accent: "var(--aurora-primary-bright)",
    },
    {
      icon: BookOpenText,
      name: "VARC — source practice",
      count: getCatVarcSourceQuestions().length,
      unit: "questions",
      desc: "Source-true verbal practice across RC and reasoning question types.",
      href: "/exams/cat/varc/source",
      accent: "var(--aurora-cyan)",
    },
    {
      icon: Network,
      name: "DILR — curated sets",
      count: getAllDilrSets().length,
      unit: "sets",
      desc: "Reviewed hidden-object DILR sets with answer keys and worked solutions.",
      href: "/exams/cat/dilr",
      accent: "var(--aurora-violet)",
    },
    {
      icon: Sparkles,
      name: "Predicted papers",
      count: getCatPredictedPapers().length,
      unit: "papers",
      desc: "Pattern-based practice papers built from the prediction portfolio.",
      href: "/exams/cat/predicted-papers",
      accent: "var(--aurora-violet)",
    },
    {
      icon: FileText,
      name: "PYQ vault",
      count: getExamPyqs("cat").length,
      unit: "validated questions",
      desc: "Website-ready validated past-year questions with topic metadata.",
      href: "/exams/cat/pyqs",
      accent: "var(--aurora-cyan)",
    },
  ].filter((bank) => bank.count > 0);

  const totalQuestions = banks
    .filter((bank) => bank.unit.includes("question"))
    .reduce((sum, bank) => sum + bank.count, 0);

  return (
    <AuroraPageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
          <Link
            href="/exams/cat"
            className="aurora-focus-ring rounded transition-colors hover:text-[color:var(--aurora-primary)]"
            style={{ color: "var(--aurora-text-muted)" }}
          >
            CAT Cockpit
          </Link>
          <span aria-hidden style={{ color: "var(--aurora-border-strong)" }}> / </span>
          <span style={{ color: "var(--aurora-cyan)" }}>Practice Library</span>
        </nav>

        <div className="aurora-fade-slide-up mt-3 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            The CAT practice library.
          </h1>
          <p className="mt-3 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
            Every connected question bank in one place —{" "}
            <span className="font-semibold tabular-nums" style={{ color: "var(--aurora-text-primary)" }}>
              {totalQuestions} questions
            </span>{" "}
            across Quant, VARC, DILR, predicted papers and validated PYQs. Counts come from the
            local content pipeline, not estimates.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map(({ icon: Icon, name, count, unit, desc, href, accent }) => (
            <Link
              key={name}
              href={href}
              className="aurora-glass aurora-card-hover aurora-focus-ring group flex flex-col p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, var(--aurora-primary))`,
                    boxShadow: "var(--aurora-glow-md)",
                  }}
                >
                  <Icon size={19} aria-hidden />
                </span>
                <span className="aurora-badge px-3 py-1.5 tabular-nums">
                  {count} {unit}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-tight">{name}</h2>
              <p className="mt-2 flex-1 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                {desc}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
                style={{ color: "var(--aurora-primary)" }}
              >
                Open bank <ArrowRight size={15} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AuroraPageShell>
  );
}

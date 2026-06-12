import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { examCategories, exams } from "@/data/exams";

export const metadata: Metadata = {
  title: "Supported Exams",
  description: "Explore Statstrive supported exams with PYQ coverage and analytics previews.",
};

export default function ExamsPage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
              Exam directory
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Choose an intelligence cockpit.
            </h1>
            <p className="mt-4 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              ISI MSQE and CAT are active. Other exam cards show preview coverage until
              their pipelines are uploaded.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {examCategories.map((category) => (
              <span key={category} className="aurora-badge px-3 py-1.5">
                {category}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const active = exam.slug === "cat" || exam.slug === "isi";
              const href = exam.slug === "cat" ? "/exams/cat" : `/exams/${exam.slug}`;
              const statusText = exam.slug === "cat"
                ? "DILR practice live"
                : exam.slug === "isi"
                  ? "MSQE PEA PYQ practice live"
                  : "Pipeline pending";
              return (
                <Link
                  key={exam.slug}
                  href={href}
                  className="aurora-glass aurora-card-hover aurora-focus-ring group relative flex flex-col overflow-hidden p-6"
                  style={active ? { boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-md)" } : undefined}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{
                      background: active
                        ? "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))"
                        : "var(--aurora-border-soft)",
                    }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      style={{
                        background: active
                          ? "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))"
                          : "linear-gradient(135deg, var(--aurora-text-muted), var(--aurora-text-secondary))",
                      }}
                    >
                      <BookOpen size={18} aria-hidden />
                    </span>
                    <span
                      className="aurora-badge"
                      style={
                        active
                          ? {
                              color: "var(--aurora-success)",
                              borderColor: "color-mix(in srgb, var(--aurora-success) 45%, transparent)",
                              background: "color-mix(in srgb, var(--aurora-success) 10%, transparent)",
                            }
                          : undefined
                      }
                    >
                      {active ? "Active" : "Preview"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold tracking-tight">{exam.name}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>
                    {exam.category}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {exam.sections.map((section) => (
                      <span key={section.code} className="aurora-badge">
                        {section.code}
                      </span>
                    ))}
                  </div>

                  <div
                    className="mt-5 flex flex-1 items-end justify-between border-t pt-4"
                    style={{ borderColor: "var(--aurora-border-soft)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--aurora-text-muted)" }}>
                      {statusText}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--aurora-primary)" }}
                    >
                      Open <ArrowRight size={15} aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </AuroraPageShell>
  );
}

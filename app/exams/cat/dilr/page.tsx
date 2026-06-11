import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Gauge, Layers3, Network, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { getAllDilrSets } from "@/lib/content/dilr";
import type { DilrSetMetadata } from "@/types/dilr";

export const metadata: Metadata = {
  title: "CAT DILR Library",
  description: "Curated CAT DILR practice sets grouped by reasoning pattern, with metadata, answer keys and review status.",
};

function difficultyColor(label: string): string {
  const value = label.toLowerCase();
  if (value.includes("very") || value.includes("expert")) return "var(--aurora-danger)";
  if (value.includes("hard")) return "var(--aurora-violet)";
  if (value.includes("med")) return "var(--aurora-cyan)";
  if (value.includes("easy")) return "var(--aurora-success)";
  return "var(--aurora-primary)";
}

export default function CatDilrPage() {
  const sets = getAllDilrSets();
  const families = Array.from(new Set(sets.map((set) => set.surface_family).filter(Boolean)));
  const engines = Array.from(new Set(sets.map((set) => set.engine_archetype).filter(Boolean)));
  const statuses = Array.from(new Set(sets.map((set) => set.website_ready).filter(Boolean)));

  return (
    <AuroraPageShell>
      <main style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_430px]">
            <div className="aurora-glass aurora-fade-slide-up rounded-[2rem] p-6 shadow-[0_30px_110px_rgba(14,165,233,0.13)] sm:p-8 lg:p-10">
              <nav aria-label="Breadcrumb" className="text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
                <Link
                  href="/exams/cat"
                  className="aurora-focus-ring rounded transition-colors hover:text-[color:var(--aurora-primary)]"
                  style={{ color: "var(--aurora-text-muted)" }}
                >
                  CAT Cockpit
                </Link>
                <span aria-hidden style={{ color: "var(--aurora-border-strong)" }}> / </span>
                <span style={{ color: "var(--aurora-cyan)" }}>DILR Library</span>
              </nav>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] shadow-sm" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.72)", color: "var(--aurora-primary)" }}>
                <Sparkles size={14} /> Statstrive Library Mode
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "var(--aurora-text-primary)" }}>
                CAT DILR Library
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 sm:text-lg" style={{ color: "var(--aurora-text-secondary)" }}>
                Reasoning-pattern based DILR sets built around hidden objects, constraints, casework, and answer determinacy. Pick a set by engine, then solve it like a timed CAT section block.
              </p>

              <div className="mt-7 flex flex-wrap gap-2" aria-label="Library status chips">
                <HeroChip>Active module</HeroChip>
                <HeroChip>Content-driven</HeroChip>
                <HeroChip>CAT-focused</HeroChip>
                <HeroChip>Review required</HeroChip>
              </div>
            </div>

            <DilrIntelligencePanel families={families} engines={engines} statuses={statuses} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2" aria-label="Reasoning patterns in this library">
            <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>
              Patterns
            </span>
            {families.length > 0 ? families.map((family) => (
              <span key={family} className="aurora-chip">
                <Network size={12} /> {family}
              </span>
            )) : <span className="aurora-chip">Awaiting accepted sets</span>}
          </div>

          <section className="mt-6 grid gap-5" aria-label="DILR set cards">
            {sets.length ? (
              sets.map((set) => <DilrSetCard key={set.set_id} set={set} />)
            ) : (
              <div className="aurora-surface p-8 text-center text-sm" style={{ color: "var(--aurora-text-muted)" }}>
                No accepted DILR sets found yet.
              </div>
            )}
          </section>
        </section>
      </main>
    </AuroraPageShell>
  );
}

function DilrIntelligencePanel({ families, engines, statuses }: { families: string[]; engines: string[]; statuses: string[] }) {
  const rows = [
    { label: "Set families", value: families.join(" + ") || "Awaiting library content", accent: "var(--aurora-cyan)", fill: "82%" },
    { label: "Hidden constraints", value: engines[0] || "Mapped per accepted set", accent: "var(--aurora-violet)", fill: "72%" },
    { label: "Casework depth", value: "Branching and determinacy reviewed", accent: "var(--aurora-primary)", fill: "64%" },
    { label: "Review status", value: statuses.join(" + ") || "Not published", accent: "var(--aurora-success)", fill: "54%" },
  ];

  return (
    <aside className="aurora-surface aurora-fade-slide-up rounded-[2rem] p-6 shadow-[0_30px_100px_rgba(15,23,42,0.09)] sm:p-7" aria-label="DILR Intelligence Panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-cyan)" }}>DILR Intelligence Panel</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight" style={{ color: "var(--aurora-text-primary)" }}>Library signals</h2>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.72)", color: "var(--aurora-primary)" }}>
          <Layers3 size={20} />
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border p-4" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.58)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>{row.label}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6" style={{ color: "var(--aurora-text-primary)" }}>{row.value}</p>
              </div>
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: row.accent, boxShadow: `0 0 18px ${row.accent}` }} />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: "rgba(148,163,184,0.18)" }}>
              <div className="h-full rounded-full" style={{ width: row.fill, background: `linear-gradient(90deg, ${row.accent}, rgba(255,255,255,0.72))` }} />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DilrSetCard({ set }: { set: DilrSetMetadata }) {
  const difficulty = difficultyColor(set.difficulty_label);
  const hasQuestionCount = Number.isFinite(set.question_count) && set.question_count > 0;
  const hasEstimatedTime = Number.isFinite(set.estimated_time_min) && set.estimated_time_min > 0;

  return (
    <article className="aurora-surface aurora-card-hover overflow-hidden rounded-[2rem] p-0 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-6 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="aurora-badge" style={{ color: difficulty, borderColor: difficulty }}>
              {set.difficulty_label}
            </span>
            <span className="aurora-badge">{set.website_ready}</span>
            <span className="aurora-badge">{set.status}</span>
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--aurora-text-primary)" }}>
            {set.title}
          </h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <InfoBlock icon={Network} label="Family" value={set.surface_family} />
            <InfoBlock icon={ShieldCheck} label="Engine" value={set.engine_archetype} />
          </div>
        </div>

        <div className="flex flex-col justify-between border-t p-6 sm:p-7 lg:border-l lg:border-t-0" style={{ borderColor: "var(--aurora-border-soft)", background: "linear-gradient(160deg, rgba(255,255,255,0.72), rgba(224,247,255,0.42))" }}>
          <dl className="grid gap-3">
            {hasQuestionCount && <CompactMetric icon={FileText} label="Questions" value={String(set.question_count)} />}
            {hasEstimatedTime && <CompactMetric icon={Clock} label="Estimated time" value={`${set.estimated_time_min} min`} />}
            <CompactMetric icon={Gauge} label="Quality" value={`Level ${set.quality_level}`} />
          </dl>

          <Link
            href={`/exams/cat/dilr/practice/${set.set_id}`}
            className="aurora-focus-ring mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(14,165,233,0.24)] transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))" }}
          >
            Start Set <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function HeroChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-3.5 py-2 text-xs font-semibold" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.68)", color: "var(--aurora-text-secondary)" }}>
      {children}
    </span>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.58)" }}>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>
        <Icon size={13} /> {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold leading-6" style={{ color: "var(--aurora-text-primary)" }}>{value}</dd>
    </div>
  );
}

function CompactMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: "var(--aurora-border-soft)", background: "rgba(255,255,255,0.64)" }}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(14,165,233,0.1)", color: "var(--aurora-primary)" }}>
        <Icon size={17} />
      </span>
      <span>
        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</span>
        <span className="block text-sm font-semibold" style={{ color: "var(--aurora-text-primary)" }}>{value}</span>
      </span>
    </div>
  );
}



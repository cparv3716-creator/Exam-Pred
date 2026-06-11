import { Clock, FileText, Gauge, Network, ShieldCheck, Tag } from "lucide-react";
import type { DilrSetMetadata } from "@/types/dilr";

/**
 * Focus Mode side panel — calm "set details" instrument.
 * Estimated time, question count, difficulty, family/engine, status. Opaque
 * light surface, no glow. The set title is the page <h1> (in DilrSetViewer),
 * so this panel uses a non-heading eyebrow to avoid a duplicate top-level heading.
 */
export function DilrMetadataCard({ metadata }: { metadata: DilrSetMetadata }) {
  return (
    <aside className="aurora-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}
        >
          <Network size={18} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-text-muted)" }}>
          Set details
        </p>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <MetaItem icon={Clock} label="Estimated time" value={`${metadata.estimated_time_min} min`} />
        <MetaItem icon={FileText} label="Questions" value={String(metadata.question_count)} />
        <MetaItem icon={Tag} label="Difficulty" value={metadata.difficulty_label} />
        <MetaItem icon={Network} label="Family" value={metadata.surface_family} />
        <MetaItem icon={ShieldCheck} label="Engine" value={metadata.engine_archetype} />
        <MetaItem icon={Gauge} label="Status" value={metadata.status} />
      </dl>

      {metadata.engine_hybrid_of.length > 0 && (
        <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--aurora-text-muted)" }}>
            Hybrid engine
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {metadata.engine_hybrid_of.map((item) => (
              <span key={item} className="aurora-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--aurora-border-soft)", background: "var(--aurora-background-soft)" }}
    >
      <dt
        className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.12em]"
        style={{ color: "var(--aurora-text-muted)" }}
      >
        <Icon size={13} /> {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold" style={{ color: "var(--aurora-text-primary)" }}>
        {value}
      </dd>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

type Accent = "primary" | "cyan" | "violet";

const accentColor: Record<Accent, string> = {
  primary: "var(--aurora-primary)",
  cyan: "var(--aurora-cyan)",
  violet: "var(--aurora-violet)",
};

/**
 * FloatingStatCard — a glass stat card for the Showcase hero.
 *
 * Uses the Phase 1 `.aurora-glass` recipe (light translucent surface with the
 * solid fallback) + `.aurora-card-hover` for the hover lift. The gentle idle
 * float (`.aurora-float-slow`) is opt-in via `float` and is frozen under
 * reduced motion by the Phase 1 media query. Decorative-only, but the text is
 * real DOM content so screen readers read the metric.
 */
const noteColor: Record<NoteTone, string> = {
  success: "var(--aurora-success)",
  primary: "var(--aurora-primary)",
  muted: "var(--aurora-text-muted)",
};

type NoteTone = "success" | "primary" | "muted"; // delta/accent line tones

export function FloatingStatCard({
  eyebrow,
  value,
  label,
  note,
  noteTone = "muted",
  icon: Icon,
  accent = "primary",
  float = true,
  style,
}: {
  eyebrow: string;
  value: string;
  label?: string;
  note?: string;
  noteTone?: NoteTone;
  icon?: LucideIcon;
  accent?: Accent;
  float?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`aurora-glass aurora-card-hover w-full max-w-xs p-5 ${float ? "aurora-float-slow" : ""}`}
      style={style}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--aurora-background-soft)", color: accentColor[accent] }}
          >
            <Icon size={15} />
          </span>
        )}
        <span
          className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--aurora-text-muted)" }}
        >
          {eyebrow}
        </span>
      </div>
      <p
        className="mt-3 text-2xl font-bold tracking-tight tabular-nums"
        style={{ color: "var(--aurora-text-primary)" }}
      >
        {value}
      </p>
      {label && (
        <p className="mt-1 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
          {label}
        </p>
      )}
      {note && (
        <p className="mt-1 text-sm font-semibold" style={{ color: noteColor[noteTone] }}>
          {note}
        </p>
      )}
    </div>
  );
}

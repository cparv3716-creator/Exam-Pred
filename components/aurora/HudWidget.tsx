import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type Accent = "primary" | "cyan" | "violet";

const accentVar: Record<Accent, string> = {
  primary: "var(--aurora-primary)",
  cyan: "var(--aurora-cyan)",
  violet: "var(--aurora-violet)",
};

/**
 * HudWidget — a frosted-glass HUD card describing a real product intelligence
 * module (engine/map/scanner). Intentionally carries NO numeric metrics: it
 * shows a name, a one-line capability and a small abstract visual. Uses the
 * Phase 1 `.aurora-glass` recipe + hover lift; idle float is opt-in and frozen
 * under reduced motion.
 */
export function HudWidget({
  icon: Icon,
  title,
  desc,
  accent = "primary",
  float = true,
  visual,
  style,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent?: Accent;
  float?: boolean;
  visual?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`aurora-glass aurora-card-hover w-full p-4 ${float ? "aurora-float-slow" : ""}`}
      style={style}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
          style={{
            background: `linear-gradient(135deg, ${accentVar[accent]}, var(--aurora-primary))`,
            boxShadow: `0 0 16px -4px ${accentVar[accent]}`,
          }}
        >
          <Icon size={15} aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className="truncate text-[0.84rem] font-bold tracking-tight"
            style={{ color: "var(--aurora-text-primary)" }}
          >
            {title}
          </p>
          <p
            className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
            style={{ color: accentVar[accent] }}
          >
            Module
          </p>
        </div>
      </div>
      <p
        className="mt-2.5 text-[0.78rem] leading-5"
        style={{ color: "var(--aurora-text-secondary)" }}
      >
        {desc}
      </p>
      {visual && <div className="mt-3">{visual}</div>}
    </div>
  );
}

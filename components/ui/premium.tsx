import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   ExamIQ premium design-system primitives.
   A small, dependency-free set of reusable surfaces tuned for a high-trust,
   Linear/Vercel-grade dark SaaS feel. All colours use the existing Tailwind
   palette + tokens defined in tailwind.config.ts / globals.css.
   ───────────────────────────────────────────────────────────────────────── */

export type Accent = "cyan" | "blue" | "purple" | "emerald" | "amber" | "rose" | "slate";

const ACCENT_TEXT: Record<Accent, string> = {
  cyan: "text-cyan-300",
  blue: "text-blue-300",
  purple: "text-purple-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
  slate: "text-slate-300",
};

const ACCENT_CHIP: Record<Accent, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  blue: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  purple: "border-purple-400/25 bg-purple-400/10 text-purple-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  slate: "border-white/10 bg-white/[0.04] text-slate-300",
};

const ACCENT_ICON: Record<Accent, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  blue: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  purple: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  slate: "border-white/10 bg-white/[0.04] text-slate-300",
};

/* ── PremiumPanel ─────────────────────────────────────────────────────────
   The base surface for everything else: a clean glassy card with restrained
   borders and an optional hover lift. */
export function PremiumPanel({
  children,
  className,
  interactive = false,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.045]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Breadcrumb ───────────────────────────────────────────────────────── */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.href && !last ? (
              <Link href={item.href} className="transition-colors hover:text-slate-300">
                {item.label}
              </Link>
            ) : (
              <span className={cn(last && "text-slate-300")}>{item.label}</span>
            )}
            {!last && <span className="text-slate-700">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

/* ── PageHero ─────────────────────────────────────────────────────────────
   Inner-page header with eyebrow, title, lede, optional breadcrumb, actions
   and a stat strip. Designed to anchor section/dashboard pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  actions,
  stats,
  accent = "cyan",
  align = "left",
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  stats?: { label: string; value: string }[];
  accent?: Accent;
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "mx-auto max-w-3xl text-center items-center",
        className,
      )}
    >
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      {eyebrow && (
        <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", ACCENT_TEXT[accent])}>
          {eyebrow}
        </p>
      )}
      <div className={cn("space-y-4", align === "center" && "flex flex-col items-center")}>
        <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center")}>{actions}</div>
      )}
      {stats && stats.length > 0 && (
        <dl
          className={cn(
            "grid w-full grid-cols-2 gap-3 sm:grid-cols-4",
            align === "center" && "max-w-2xl",
          )}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-left"
            >
              <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </dt>
              <dd className="mt-1 text-xl font-semibold tracking-tight text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </header>
  );
}

/* ── PremiumSectionHeader ──────────────────────────────────────────────── */
export function PremiumSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  accent = "cyan",
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  accent?: Accent;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "mx-auto max-w-3xl text-center sm:block",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className={cn("text-xs font-semibold uppercase tracking-[0.2em]", ACCENT_TEXT[accent])}>
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        {description && (
          <p
            className={cn(
              "mt-3 max-w-2xl text-sm leading-relaxed text-slate-400",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── PremiumStatCard ──────────────────────────────────────────────────── */
export function PremiumStatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "cyan",
  className,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon?: LucideIcon;
  accent?: Accent;
  className?: string;
}) {
  return (
    <PremiumPanel interactive className={cn("group", className)}>
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", ACCENT_ICON[accent])}>
            <Icon size={18} />
          </div>
        )}
        <p className="ml-auto text-3xl font-semibold tracking-tight text-white">{value}</p>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      {detail && <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>}
    </PremiumPanel>
  );
}

/* ── ProgressPill ─────────────────────────────────────────────────────────
   Small status/label chip. Use for "Live", "Coming soon", counts, levels. */
export function ProgressPill({
  children,
  accent = "slate",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  accent?: Accent;
  dot?: boolean;
  className?: string;
}) {
  const dotColor: Record<Accent, string> = {
    cyan: "bg-cyan-300",
    blue: "bg-blue-300",
    purple: "bg-purple-300",
    emerald: "bg-emerald-300",
    amber: "bg-amber-300",
    rose: "bg-rose-300",
    slate: "bg-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        ACCENT_CHIP[accent],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {accent === "emerald" && (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dotColor[accent])} />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dotColor[accent])} />
        </span>
      )}
      {children}
    </span>
  );
}

/* ── DifficultyBadge ──────────────────────────────────────────────────────
   Flexible difficulty badge that maps free-form difficulty strings
   (Easy, Medium, Hard, Very Hard, etc.) onto a calm three-step scale. */
export function DifficultyBadge({ level, className }: { level: string; className?: string }) {
  const normalized = level.trim().toLowerCase();
  let accent: Accent = "cyan";
  if (normalized.includes("very hard") || normalized.includes("advanced")) accent = "rose";
  else if (normalized.includes("hard")) accent = "purple";
  else if (normalized.includes("easy") || normalized.includes("beginner") || normalized.includes("foundation"))
    accent = "emerald";
  else if (normalized.includes("medium") || normalized.includes("intermediate")) accent = "cyan";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        ACCENT_CHIP[accent],
        className,
      )}
    >
      {level}
    </span>
  );
}

/* ── RouteCTA ─────────────────────────────────────────────────────────────
   Consistent link-button. Primary = gradient, secondary = outline,
   ghost = text-only. */
export function RouteCTA({
  href,
  children,
  variant = "primary",
  size = "md",
  icon: Icon = ArrowRight,
  iconPosition = "end",
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  icon?: LucideIcon | null;
  iconPosition?: "start" | "end";
  external?: boolean;
  className?: string;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all";
  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm",
  };
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-cyan hover:opacity-90",
    secondary:
      "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/40 hover:bg-white/[0.06]",
    ghost: "text-slate-300 hover:text-white",
  };
  const iconNode = Icon ? (
    <Icon
      size={size === "sm" ? 13 : 16}
      className={cn(
        "transition-transform",
        iconPosition === "end" && "group-hover:translate-x-0.5",
        iconPosition === "start" && "group-hover:-translate-x-0.5",
      )}
    />
  ) : null;

  const content = (
    <>
      {iconPosition === "start" && iconNode}
      {children}
      {iconPosition === "end" && iconNode}
    </>
  );
  const classes = cn(base, sizes[size], variants[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/* ── FeaturePillarCard ────────────────────────────────────────────────── */
export function FeaturePillarCard({
  icon: Icon,
  title,
  description,
  accent = "cyan",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: Accent;
  className?: string;
}) {
  return (
    <PremiumPanel interactive className={cn("p-6 sm:p-7", className)}>
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", ACCENT_ICON[accent])}>
        <Icon size={20} />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </PremiumPanel>
  );
}

/* ── TrustSignalCard ──────────────────────────────────────────────────────
   Quality/trust assurance card with a leading icon and a one-line proof. */
export function TrustSignalCard({
  icon: Icon,
  title,
  description,
  accent = "emerald",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: Accent;
  className?: string;
}) {
  return (
    <PremiumPanel interactive className={cn("flex gap-4", className)}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", ACCENT_ICON[accent])}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </PremiumPanel>
  );
}

/* ── ExamSectionCard ──────────────────────────────────────────────────────
   For a section of an exam (e.g. Quant / VARC / DILR). Shows a status,
   short description, optional stats, and a CTA. When status is "soon" the
   whole card is non-interactive (no link). */
export function ExamSectionCard({
  title,
  abbr,
  description,
  status,
  href,
  ctaLabel = "Start practice",
  icon: Icon,
  accent = "cyan",
  stats,
}: {
  title: string;
  abbr?: string;
  description: string;
  status: "live" | "soon";
  href?: string;
  ctaLabel?: string;
  icon?: LucideIcon;
  accent?: Accent;
  stats?: { label: string; value: string }[];
}) {
  const live = status === "live";
  const inner = (
    <>
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{
          background:
            accent === "purple"
              ? "#a855f7"
              : accent === "emerald"
                ? "#34d399"
                : accent === "blue"
                  ? "#3b82f6"
                  : accent === "amber"
                    ? "#f59e0b"
                    : "#22d3ee",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", ACCENT_ICON[accent])}>
              <Icon size={20} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
            {abbr && <p className="text-xs font-medium text-slate-500">{abbr}</p>}
          </div>
        </div>
        {live ? (
          <ProgressPill accent="emerald" dot>
            Live
          </ProgressPill>
        ) : (
          <ProgressPill accent="slate">Coming soon</ProgressPill>
        )}
      </div>
      <p className="relative mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
      {stats && stats.length > 0 && (
        <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-white">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="relative mt-5">
        {live ? (
          <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", ACCENT_TEXT[accent])}>
            {ctaLabel}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-sm font-medium text-slate-600">Available in a future release</span>
        )}
      </div>
    </>
  );

  const shell = cn(
    "group relative flex min-h-[230px] flex-col overflow-hidden rounded-2xl border bg-white/[0.025] p-6",
    live
      ? "border-white/8 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]"
      : "border-white/6 opacity-80",
  );

  if (live && href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={shell} aria-disabled={!live}>
      {inner}
    </div>
  );
}

/* ── PracticeLaunchCard ───────────────────────────────────────────────────
   Level launcher (Beginner / Intermediate / Advanced) with a count and CTA. */
export function PracticeLaunchCard({
  title,
  count,
  detail,
  href,
  icon: Icon,
  accent = "cyan",
  ctaLabel = "Open level",
}: {
  title: string;
  count?: number | string;
  detail: string;
  href: string;
  icon?: LucideIcon;
  accent?: Accent;
  ctaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.045]"
    >
      <div className="flex items-start justify-between gap-4">
        {Icon && (
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", ACCENT_ICON[accent])}>
            <Icon size={20} />
          </div>
        )}
        {count !== undefined && (
          <span className="text-3xl font-semibold tracking-tight text-white">{count}</span>
        )}
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
      <span className={cn("mt-5 inline-flex items-center gap-1.5 text-sm font-semibold", ACCENT_TEXT[accent])}>
        {ctaLabel}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400">
          <Icon size={22} />
        </div>
      )}
      <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ── QuestionPager ────────────────────────────────────────────────────────
   Whole-bank previous/next navigation between question detail pages.
   Buttons disable (render as inert) at the boundaries of the bank. */
export function QuestionPager({
  prevHref,
  nextHref,
  label,
  className,
}: {
  prevHref: string | null;
  nextHref: string | null;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <PagerButton href={prevHref} direction="prev" />
      {label && <span className="text-center text-xs font-medium text-slate-500">{label}</span>}
      <PagerButton href={nextHref} direction="next" />
    </div>
  );
}

function PagerButton({ href, direction }: { href: string | null; direction: "prev" | "next" }) {
  const isPrev = direction === "prev";
  const text = isPrev ? "Previous" : "Next";
  const Icon = isPrev ? ChevronLeft : ChevronRight;
  const base =
    "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all";
  if (!href) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-not-allowed border-white/8 bg-white/[0.02] text-slate-700")}
      >
        {isPrev && <Icon size={15} />}
        {text}
        {!isPrev && <Icon size={15} />}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(base, "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/30 hover:text-white")}
    >
      {isPrev && <Icon size={15} />}
      {text}
      {!isPrev && <Icon size={15} />}
    </Link>
  );
}

/* ── QuickLinkCard ────────────────────────────────────────────────────────
   Compact navigational tile used for "quick links" rows. Exported as part of
   the premium kit for dashboard-style pages. */
export function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  accent = "cyan",
}: {
  title: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-4 transition-all hover:border-white/18 hover:bg-white/[0.045]"
    >
      {Icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", ACCENT_ICON[accent])}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        {description && <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>}
      </div>
      <ArrowUpRight
        size={16}
        className="shrink-0 text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
      />
    </Link>
  );
}

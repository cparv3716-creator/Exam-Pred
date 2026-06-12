import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function IsiPageHeader({ eyebrow, title, description, chips = [] }: { eyebrow: string; title: string; description: string; chips?: string[] }) {
  return <div className="aurora-fade-slide-up max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-primary)" }}>{eyebrow}</p><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1><p className="mt-4 text-base leading-8 sm:text-lg" style={{ color: "var(--aurora-text-secondary)" }}>{description}</p>{chips.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{chips.map((chip) => <span key={chip} className="aurora-badge px-3 py-1.5">{chip}</span>)}</div>}</div>;
}

export function IsiLinkCard({ icon: Icon, title, description, href, badge, children }: { icon: LucideIcon; title: string; description: string; href?: string; badge?: string; children?: ReactNode }) {
  const body = <><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))", boxShadow: "var(--aurora-glow-md)" }}><Icon size={19} /></span>{badge && <span className="aurora-badge">{badge}</span>}</div><h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2><p className="mt-2 flex-1 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>{description}</p>{children}{href && <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>Open module <ArrowRight size={15} /></span>}</>;
  return href ? <Link href={href} className="aurora-glass aurora-card-hover aurora-focus-ring group flex flex-col p-6">{body}</Link> : <article className="aurora-glass flex flex-col p-6 opacity-90">{body}</article>;
}

export function IsiStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="rounded-2xl border bg-white/65 p-4" style={{ borderColor: "var(--aurora-border-soft)" }}><p className="text-[0.68rem] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--aurora-text-muted)" }}>{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p>{note && <p className="mt-1 text-xs leading-5" style={{ color: "var(--aurora-text-muted)" }}>{note}</p>}</div>;
}

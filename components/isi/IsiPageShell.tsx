import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Sigma } from "lucide-react";

const links = [
  { label: "ISI", href: "/exams/isi" },
  { label: "MSQE", href: "/exams/isi/msqe" },
  { label: "Practice", href: "/exams/isi/msqe/practice" },
  { label: "Solutions", href: "/exams/isi/msqe/solutions" },
  { label: "Inference", href: "/exams/isi/msqe/inference" },
];

export function IsiPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip antialiased" style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}>
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="aurora-glass flex items-center justify-between gap-3 px-4 py-3 sm:px-6" style={{ borderRadius: "var(--aurora-radius-xl)" }}>
            <Link href="/" className="aurora-focus-ring flex items-center gap-3 rounded-xl">
              <span className="grid h-9 w-9 place-items-center rounded-full text-white" style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))", boxShadow: "var(--aurora-glow-md)" }}><Sigma size={17} aria-hidden /></span>
              <span><span className="block text-base font-extrabold tracking-tight">Statstrive</span><span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--aurora-text-muted)" }}>ISI intelligence</span></span>
            </Link>
            <nav aria-label="ISI navigation" className="hidden items-center gap-1 md:flex">
              {links.map((link) => <Link key={link.href} href={link.href} className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60" style={{ color: "var(--aurora-text-secondary)" }}>{link.label}</Link>)}
            </nav>
            <Link href="/exams/isi/msqe/practice" className="aurora-button-primary aurora-focus-ring px-4 text-sm sm:px-5">Practice <ArrowRight size={15} aria-hidden /></Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold">Statstrive <span style={{ color: "var(--aurora-text-muted)" }}>ISI exam intelligence</span></p>
          <Link href="/exams" className="aurora-focus-ring rounded-md text-sm font-semibold" style={{ color: "var(--aurora-primary)" }}>All exam verticals</Link>
        </div>
      </footer>
    </div>
  );
}


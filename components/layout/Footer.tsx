import Link from "next/link";
import { Brain } from "lucide-react";
import { ProgressPill } from "@/components/ui/premium";
import { legalDisclaimer } from "@/lib/utils";

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "CAT",
    links: [
      { label: "CAT dashboard", href: "/exams/cat" },
      { label: "Quant practice", href: "/exams/cat/quant/latex-source" },
      { label: "VARC practice", href: "/exams/cat/varc/source" },
      { label: "Reports", href: "/exams/cat/reports" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "All exams", href: "/exams" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "About", href: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-ink-950/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <Brain size={19} className="text-white" />
            </div>
            <span className="text-base font-semibold text-white">
              Exam<span className="text-cyan-300">IQ</span>
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">{legalDisclaimer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ProgressPill accent="emerald" dot>
              CAT live
            </ProgressPill>
            <ProgressPill accent="slate">JEE · NEET · UPSC coming soon</ProgressPill>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{column.heading}</p>
            <div className="mt-4 grid gap-2.5 text-sm text-slate-400">
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} ExamIQ · AI exam intelligence &amp; practice.</p>
          <p>Pattern-based insights only. Not affiliated with any official examination body.</p>
        </div>
      </div>
    </footer>
  );
}

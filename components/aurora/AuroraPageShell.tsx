import Link from "next/link";
import type { ReactNode } from "react";
import { AuroraHeaderNavigation } from "@/components/aurora/AuroraHeaderNavigation";

const NAV_LINKS = [
  { label: "Exams", href: "/exams" },
  { label: "ISI MSQE", href: "/exams/isi/msqe" },
  { label: "CAT", href: "/exams/cat" },
  { label: "Practice", href: "/exams/isi/msqe/pyqs/pea" },
  { label: "Pricing", href: "/pricing" },
];

export function AuroraPageShell({ children }: { children: ReactNode }) {

  return (
    <div
      className="min-h-screen overflow-x-clip antialiased"
      style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}
    >
      <header className="sticky top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="aurora-glass flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6"
            style={{ borderRadius: "var(--aurora-radius-xl)" }}
          >
            <Link href="/" className="aurora-focus-ring flex min-w-0 items-center gap-2 rounded-xl sm:gap-3">
              <span
                aria-hidden
                className="relative grid h-9 w-9 place-items-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #ffffff, var(--aurora-primary-bright) 55%, var(--aurora-primary) 100%)",
                  boxShadow: "var(--aurora-glow-md)",
                }}
              >
                <span className="absolute inset-1 rounded-full border border-white/40" />
                <span className="text-xs font-black text-white">S</span>
              </span>
              <span>
                <span className="block text-base font-extrabold tracking-tight">Statstrive</span>
                <span
                  className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--aurora-text-muted)" }}
                >
                  AI exam cockpit
                </span>
              </span>
            </Link>

            <AuroraHeaderNavigation links={NAV_LINKS} />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold">
            Statstrive <span style={{ color: "var(--aurora-text-muted)" }}>- AI exam intelligence</span>
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-5 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="aurora-focus-ring rounded-md font-medium text-[color:var(--aurora-text-secondary)] transition-colors hover:text-[color:var(--aurora-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

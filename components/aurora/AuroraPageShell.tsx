import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/backend/auth";

const NAV_LINKS = [
  { label: "Exams", href: "/exams" },
  { label: "ISI MSQE", href: "/exams/isi/msqe" },
  { label: "CAT", href: "/exams/cat" },
  { label: "Practice", href: "/exams/isi/msqe/pyqs/pea" },
  { label: "Pricing", href: "/pricing" },
];

export async function AuroraPageShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const authLinks = user
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Logout", href: "/logout" },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Sign up", href: "/signup" },
      ];
  const shellLinks = [...NAV_LINKS, ...authLinks];

  return (
    <div
      className="min-h-screen overflow-x-clip antialiased"
      style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}
    >
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="aurora-glass flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
            style={{ borderRadius: "var(--aurora-radius-xl)" }}
          >
            <Link href="/" className="aurora-focus-ring flex items-center gap-3 rounded-xl">
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

            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {shellLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60"
                  style={{ color: "var(--aurora-text-secondary)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href={user ? "/dashboard" : "/signup"} className="aurora-button-primary aurora-focus-ring px-5 text-sm">
              {user ? "Dashboard" : "Get Started"}
              <ArrowRight size={15} aria-hidden />
            </Link>
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
            {shellLinks.map((link) => (
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

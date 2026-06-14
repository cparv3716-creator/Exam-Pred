import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Layers,
  Network,
  Radar,
  Route,
  ScanLine,
  Signal,
  Sparkles,
} from "lucide-react";
import { AuroraBackground } from "@/components/aurora/AuroraBackground";
import { AuroraHeroScene } from "@/components/aurora/AuroraHeroScene";

/* ── nav / content data ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Exams", href: "/exams" },
  { label: "ISI MSQE", href: "/exams/isi/msqe" },
  { label: "CAT", href: "/exams/cat" },
  { label: "Practice", href: "/exams/isi/msqe/pyqs/pea" },
  { label: "Feedback", href: "/feedback" },
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" },
];

const HERO_CHIPS = ["ISI MSQE live", "CAT DILR practice", "PYQ-backed intelligence", "Multi-exam roadmap"];


/* ── tiny abstract visuals (decorative, no metrics) ─────────────────── */

function RadarVisual() {
  return (
    <div aria-hidden className="relative mx-auto h-24 w-24">
      {["inset-0", "inset-3", "inset-6"].map((inset) => (
        <span key={inset} className={`absolute ${inset} rounded-full`} style={{ border: "1px solid var(--aurora-border-strong)" }} />
      ))}
      <span
        className="aurora-spin-slow absolute inset-0 rounded-full"
        style={{
          animationDuration: "7s",
          background: "conic-gradient(from 0deg, var(--aurora-glow-cyan), transparent 70deg)",
        }}
      />
      {[
        { left: "62%", top: "24%" },
        { left: "30%", top: "52%" },
        { left: "68%", top: "66%" },
      ].map((pos, i) => (
        <span
          key={i}
          className={i === 0 ? "aurora-soft-pulse absolute h-1.5 w-1.5 rounded-full" : "absolute h-1.5 w-1.5 rounded-full"}
          style={{ ...pos, background: "var(--aurora-cyan)", boxShadow: "0 0 8px 1px var(--aurora-glow-cyan)" }}
        />
      ))}
    </div>
  );
}

function ScannerVisual() {
  return (
    <div aria-hidden className="relative h-24 overflow-hidden rounded-lg" style={{ background: "var(--aurora-background-soft)" }}>
      <div className="absolute inset-2 grid grid-cols-8 gap-1.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="rounded-[3px]"
            style={{ background: `color-mix(in srgb, var(--aurora-violet) ${(i * 37) % 70}%, transparent)` }}
          />
        ))}
      </div>
      <span
        className="aurora-scan-x absolute bottom-1 top-1 w-[10%] rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, var(--aurora-glow-cyan), rgba(255,255,255,0.5), var(--aurora-glow-cyan), transparent)" }}
      />
    </div>
  );
}

function RouteVisual() {
  return (
    <div aria-hidden className="relative h-24">
      <svg viewBox="0 0 220 90" className="h-full w-full" fill="none">
        <path
          d="M10 70 C 60 70, 70 24, 116 24 S 190 56, 210 36"
          stroke="url(#routeGrad)"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--aurora-1)" />
            <stop offset="0.5" stopColor="var(--aurora-2)" />
            <stop offset="1" stopColor="var(--aurora-3)" />
          </linearGradient>
        </defs>
      </svg>
      {[
        { left: "2%", top: "72%" },
        { left: "50%", top: "18%" },
        { left: "93%", top: "32%" },
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${i === 1 ? "aurora-soft-pulse" : ""}`}
          style={{
            ...pos,
            background: i === 1 ? "var(--aurora-cyan)" : "var(--aurora-primary-bright)",
            boxShadow: "0 0 10px 1px var(--aurora-glow-primary)",
            border: "2px solid rgba(255,255,255,0.85)",
          }}
        />
      ))}
    </div>
  );
}

function MemoryVisual() {
  return (
    <div aria-hidden className="flex h-24 items-center gap-1">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className={`w-full rounded-full ${i === 13 ? "aurora-soft-pulse" : ""}`}
          style={{
            height: `${28 + ((i * 23) % 46)}%`,
            background:
              i === 13
                ? "var(--aurora-cyan)"
                : `color-mix(in srgb, var(--aurora-primary) ${35 + ((i * 17) % 50)}%, var(--aurora-background-soft))`,
          }}
        />
      ))}
    </div>
  );
}

const BENTO = [
  {
    icon: Radar,
    title: "Pattern Radar",
    desc: "Watches structural repetition across PYQ years and flags what keeps returning.",
    visual: <RadarVisual />,
  },
  {
    icon: ScanLine,
    title: "Weakness Scanner",
    desc: "Sweeps your attempts for fragile concepts, slow zones and avoidable errors.",
    visual: <ScannerVisual />,
  },
  {
    icon: Route,
    title: "Practice Route",
    desc: "Sequences sets so difficulty rises exactly as your skill does.",
    visual: <RouteVisual />,
  },
  {
    icon: Layers,
    title: "Performance Memory",
    desc: "Remembers every attempt so the next session starts smarter than the last.",
    visual: <MemoryVisual />,
  },
];

const MODULES_STRIP = [
  {
    icon: Sparkles,
    title: "Prediction Layer",
    desc: "Models how exam patterns evolve before the exam does.",
  },
  {
    icon: Signal,
    title: "Exam Signal Scanner",
    desc: "Surfaces high-signal topics from years of PYQ data.",
  },
  {
    icon: Network,
    title: "Question-Type Intelligence",
    desc: "Reads question structure and skill demands, not just topic tags.",
  },
];

const EXAM_PATHS = [
  {
    icon: BookOpenCheck,
    title: "ISI MSQE PEA PYQ Practice",
    desc: "2022–2026 previous-year questions with interactive checking and stepwise solutions.",
    cta: "Open ISI MSQE",
    href: "/exams/isi/msqe",
    badge: "Active",
  },
  {
    icon: Route,
    title: "CAT DILR practice",
    desc: "Focused DILR sets stay visible as one active option inside the broader Statstrive cockpit.",
    cta: "Open CAT",
    href: "/exams/cat",
    badge: "Active",
  },
  {
    icon: Network,
    title: "Multi-exam roadmap",
    desc: "PYQ-backed exam intelligence expanding across ISI, CAT, JAM, and other serious exam tracks.",
    cta: "Explore all exams",
    href: "/exams",
    badge: "Roadmap",
  },
];

/* ── page ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main
      className="min-h-screen overflow-x-clip antialiased"
      style={{ background: "var(--aurora-background)", color: "var(--aurora-text-primary)" }}
    >
      {/* HERO — Showcase Mode */}
      <AuroraBackground className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        {/* neural particle field */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage: "radial-gradient(circle, var(--aurora-glow-primary) 1px, transparent 1.5px)",
            backgroundSize: "30px 30px",
            maskImage: "radial-gradient(ellipse at 72% 36%, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 72% 36%, black, transparent 70%)",
          }}
        />
        {/* deep violet bloom on the stage side */}
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 hidden rounded-full blur-3xl lg:block"
          style={{
            top: "6%",
            right: "-8%",
            width: "46rem",
            height: "46rem",
            background: "radial-gradient(circle, var(--aurora-glow-violet), transparent 70%)",
            opacity: 0.85,
          }}
        />

        {/* cinematic 3D prediction field — background atmosphere layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{
            maskImage: "radial-gradient(125% 95% at 62% 42%, black 52%, transparent 94%)",
            WebkitMaskImage: "radial-gradient(125% 95% at 62% 42%, black 52%, transparent 94%)",
          }}
        >
          <AuroraHeroScene className="absolute inset-0 h-full w-full" />
          {/* readability veil over the copy column (desktop) */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, var(--aurora-background) 4%, color-mix(in srgb, var(--aurora-background) 62%, transparent) 34%, transparent 58%)",
            }}
          />
          {/* readability veil (mobile/tablet — even wash) */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: "color-mix(in srgb, var(--aurora-background) 52%, transparent)" }}
          />
          {/* bottom fade into the next section */}
          <div
            className="absolute inset-x-0 bottom-0 h-36"
            style={{
              background: "linear-gradient(180deg, transparent, var(--aurora-background))",
            }}
          />
        </div>

        {/* glass navbar */}
        <header className="sticky top-4 z-50 mx-auto max-w-7xl">
          <div
            className="aurora-glass flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
            style={{ borderRadius: "var(--aurora-radius-xl)" }}
          >
            <Link href="/" className="aurora-focus-ring flex items-center gap-3 rounded-xl">
              <span
                aria-hidden
                className="relative grid h-10 w-10 place-items-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #ffffff, var(--aurora-primary-bright) 55%, var(--aurora-primary) 100%)",
                  boxShadow: "var(--aurora-glow-md)",
                }}
              >
                <span className="absolute inset-1 rounded-full border border-white/40" />
                <span className="text-sm font-black text-white">S</span>
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
              {NAV_LINKS.map((link) => (
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

            <Link href="/signup" className="aurora-button-primary aurora-focus-ring px-5 text-sm">
              Get Started
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </header>

        {/* hero composition — one cinematic block over the 3D field */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl items-center px-0 pb-10 pt-20 sm:pt-24 lg:pt-12">
          <div className="aurora-fade-slide-up relative max-w-3xl">
            <p
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                color: "var(--aurora-primary)",
                background: "var(--aurora-surface-glass)",
                border: "1px solid var(--aurora-border-soft)",
                boxShadow: "var(--aurora-shadow-1)",
              }}
            >
              <span
                aria-hidden
                className="aurora-soft-pulse h-2 w-2 rounded-full"
                style={{ background: "var(--aurora-cyan)", boxShadow: "0 0 12px 2px var(--aurora-glow-cyan)" }}
              />
              Statstrive · AI Exam Intelligence
            </p>

            <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
              AI-powered{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(100deg, var(--aurora-1), var(--aurora-2) 50%, var(--aurora-3))" }}
              >
                exam intelligence
              </span>{" "}
              for serious aspirants.
            </h1>

            <p
              className="mt-7 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9"
              style={{ color: "var(--aurora-text-secondary)" }}
            >
              Analyze PYQ patterns, map weak areas, and practice with exam-aware intelligence across ISI, CAT and the multi-exam roadmap.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/exams/isi/msqe/pyqs/pea"
                className="aurora-button-primary aurora-focus-ring group px-8 py-4 text-base"
                style={{ boxShadow: "var(--aurora-shadow-2), var(--aurora-glow-md)" }}
              >
                Start ISI MSQE Practice
                <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/exams"
                className="aurora-button-secondary aurora-focus-ring px-8 py-4 text-base"
              >
                Explore All Exams
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2.5">
              {HERO_CHIPS.map((chip) => (
                <span key={chip} className="aurora-badge px-3 py-1.5">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </AuroraBackground>

      {/* EXAM PATHS */}
      <section className="border-t px-4 py-16 sm:px-6 sm:py-20 lg:px-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
                Active exam paths
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                ISI is live. CAT stays in the cockpit.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              Start with ISI MSQE PEA PYQs, continue with CAT DILR practice, and follow the PYQ-backed exam intelligence roadmap as new tracks come online.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {EXAM_PATHS.map(({ icon: Icon, title, desc, cta, href, badge }) => (
              <Link key={title} href={href} className="aurora-glass aurora-card-hover aurora-focus-ring group flex flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))", boxShadow: "var(--aurora-glow-md)" }}
                  >
                    <Icon size={19} aria-hidden />
                  </span>
                  <span className="aurora-badge">{badge}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
                  {desc}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--aurora-primary)" }}>
                  {cta} <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO — intelligence systems */}
      <section className="border-t px-4 py-16 sm:px-6 sm:py-20 lg:px-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
                Intelligence systems
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                A cockpit, not a question bank.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              Statstrive turns PYQ patterns, attempt history and topic coverage into one
              connected practice system.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {BENTO.map(({ icon: Icon, title, desc, visual }) => (
              <div key={title} className="aurora-glass aurora-card-hover flex flex-col p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--aurora-primary), var(--aurora-violet))",
                      boxShadow: "var(--aurora-glow-md)",
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <h3 className="text-lg font-bold">{title}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                  {desc}
                </p>
                <div className="mt-5">{visual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES STRIP */}
      <section className="aurora-soft-bg px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-violet)" }}>
            The prediction stack
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for serious aspirants.
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {MODULES_STRIP.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="aurora-glass aurora-card-hover flex items-start gap-4 p-6">
                <span
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}
                >
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div
          className="aurora-gradient-bg relative mx-auto max-w-7xl overflow-hidden px-6 py-14 text-center sm:px-12"
          style={{
            borderRadius: "var(--aurora-radius-xl)",
            border: "1px solid var(--aurora-border-soft)",
            boxShadow: "var(--aurora-shadow-3)",
          }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Start where the exam is heading.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
            Jump into ISI MSQE PEA PYQs, keep CAT DILR in view, and let the intelligence layer map your next move.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/exams/isi/msqe/pyqs/pea" className="aurora-button-primary aurora-focus-ring px-7 py-3.5 text-base">
              Start ISI MSQE Practice
              <ArrowRight size={17} aria-hidden />
            </Link>
            <Link href="/exams" className="aurora-button-secondary aurora-focus-ring px-7 py-3.5 text-base">
              Explore All Exams
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: "var(--aurora-border-soft)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold">
            Statstrive <span style={{ color: "var(--aurora-text-muted)" }}>— AI exam intelligence</span>
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
    </main>
  );
}

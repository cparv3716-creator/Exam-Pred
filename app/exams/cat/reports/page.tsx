import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarkdownCard } from "@/components/content/MarkdownRenderer";
import { CatDownloadsExperience } from "@/components/content/CatDownloadsExperience";
import { getCatDownloads, getCatFinalRecommendation, getCatPipelineSummary } from "@/lib/content/cat";

export const metadata: Metadata = {
  title: "CAT Intelligence Lab",
  description: "CAT report PDFs and pipeline markdown summaries loaded from local content.",
};

/** Abstract lab instrument — decorative only, carries no data. */
function LabPulseStrip() {
  return (
    <div aria-hidden className="pointer-events-none mt-8 grid gap-4 sm:grid-cols-[auto_1fr]">
      {/* radar rings */}
      <div className="relative mx-auto h-24 w-24 sm:mx-0">
        <span className="absolute inset-0 rounded-full border border-cyan-400/25" />
        <span className="absolute inset-3 rounded-full border border-indigo-400/25" />
        <span className="absolute inset-6 rounded-full border border-violet-400/25" />
        <span
          className="aurora-spin-slow absolute inset-0 rounded-full"
          style={{
            animationDuration: "8s",
            background: "conic-gradient(from 0deg, rgba(6,182,212,0.28), transparent 70deg)",
          }}
        />
        <span className="absolute left-[58%] top-[30%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-cyan" />
        <span className="absolute left-[34%] top-[58%] h-1.5 w-1.5 rounded-full bg-violet-300" />
      </div>
      {/* heat strip */}
      <div>
        <div className="grid grid-cols-12 items-center gap-1.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={`h-3 rounded-[3px] ${i % 5 === 0 ? "aurora-soft-pulse" : ""}`}
              style={{
                background: `rgba(99, 102, 241, ${0.08 + ((i * 29) % 60) / 100})`,
                animationDelay: `${(i % 5) * -0.9}s`,
              }}
            />
          ))}
        </div>
        {/* signal waveform — line draw on load */}
        <svg viewBox="0 0 560 56" className="mt-4 h-12 w-full" fill="none" preserveAspectRatio="none">
          <path
            className="aurora-dash-draw"
            d="M0 36 C 30 36, 38 18, 64 18 S 96 44, 124 44 S 158 12, 190 12 S 224 40, 256 40 S 288 22, 318 22 S 350 48, 382 48 S 414 16, 446 16 S 480 34, 510 34 S 540 26, 560 28"
            stroke="url(#labWave)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="labWave" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function CatReportsPage() {
  const downloads = getCatDownloads();
  const recommendation = getCatFinalRecommendation();
  const pipeline = getCatPipelineSummary();

  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="aurora-fade-slide-up relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #6366F1, #06B6D4, #8B5CF6)" }}
          />
          <SectionHeader
            eyebrow="Intelligence Lab"
            title="CAT reports and pipeline intelligence"
            description="Real local CAT pipeline output: report PDFs served from public downloads, markdown summaries rendered from content files. Signals are presented as estimates, never as certainty."
          />
          <LabPulseStrip />
        </div>

        <div className="mt-10">
          <CatDownloadsExperience downloads={downloads} />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <MarkdownCard title="Final recommendation summary" markdown={recommendation.report.body} />
          <MarkdownCard title="Full pipeline summary" markdown={pipeline.body} />
        </div>
      </section>
    </PageShell>
  );
}

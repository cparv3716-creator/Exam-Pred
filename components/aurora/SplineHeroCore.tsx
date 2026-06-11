import { IntelligenceCore } from "@/components/aurora/IntelligenceCore";

/**
 * SplineHeroCore — the cinematic hero visual stage.
 *
 * If NEXT_PUBLIC_SPLINE_HERO_URL is set, renders a real Spline 3D scene in an
 * iframe slot. Otherwise falls back to the CSS-only IntelligenceCore. The
 * stage itself adds depth: HUD grid, backdrop rings, light wash and corner
 * module tags. No fake metrics anywhere — tags name real product modules.
 */
export function SplineHeroCore({ fallbackSize = 380 }: { fallbackSize?: number }) {
  const splineUrl = process.env.NEXT_PUBLIC_SPLINE_HERO_URL;

  return (
    <div className="relative mx-auto grid w-full max-w-[660px] place-items-center">
      {/* ambient bloom behind the stage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3rem] opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, var(--aurora-glow-cyan), transparent 46%), radial-gradient(circle at 72% 18%, var(--aurora-glow-violet), transparent 42%)",
        }}
      />

      <div
        className="aurora-glass relative w-full overflow-hidden p-5"
        style={{
          borderRadius: "var(--aurora-radius-xl)",
          boxShadow: "var(--aurora-shadow-3), var(--aurora-glow-md)",
        }}
      >
        {/* internal light wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 36%, rgba(255,255,255,0.9), transparent 28%), linear-gradient(135deg, var(--aurora-glow-cyan), transparent 45%, var(--aurora-glow-violet))",
          }}
        />

        {/* HUD grid floor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(var(--aurora-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--aurora-text-primary) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 50% 48%, black, transparent 76%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 48%, black, transparent 76%)",
          }}
        />

        {/* backdrop rings */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: "1px solid var(--aurora-border-soft)" }}
        />
        <div
          aria-hidden
          className="aurora-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            animationDuration: "70s",
            background:
              "conic-gradient(from 120deg, transparent 0deg, var(--aurora-glow-cyan) 24deg, transparent 60deg, transparent 200deg, var(--aurora-glow-violet) 230deg, transparent 270deg)",
            maskImage: "radial-gradient(circle, transparent 96%, black 97.5%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 96%, black 97.5%)",
          }}
        />

        {/* scene */}
        <div className="relative z-10 grid min-h-[440px] place-items-center py-6">
          {splineUrl ? (
            <iframe
              title="Statstrive 3D intelligence core"
              src={splineUrl}
              className="h-[440px] w-full border-0"
              style={{ borderRadius: "var(--aurora-radius-lg)" }}
              loading="lazy"
              allow="autoplay; fullscreen; xr-spatial-tracking"
            />
          ) : (
            <IntelligenceCore size={fallbackSize} />
          )}
        </div>

        {/* corner module tags (real modules, no metrics) */}
        <div className="aurora-glass pointer-events-none absolute left-5 top-5 px-3.5 py-2.5" style={{ borderRadius: "var(--aurora-radius-md)" }}>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-cyan)" }}>
            AI Core
          </p>
          <p className="mt-0.5 text-xs font-bold" style={{ color: "var(--aurora-text-primary)" }}>
            Exam-aware modeling
          </p>
        </div>
        <div
          className="pointer-events-none absolute bottom-5 right-5 px-3.5 py-2.5 text-white"
          style={{
            borderRadius: "var(--aurora-radius-md)",
            background: "color-mix(in srgb, var(--aurora-text-primary) 88%, transparent)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "var(--aurora-shadow-2)",
          }}
        >
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-2)" }}>
            Coverage
          </p>
          <p className="mt-0.5 text-xs font-bold">DILR · Quant · VARC</p>
        </div>
      </div>
    </div>
  );
}

/**
 * IntelligenceCore — cinematic CSS-only "AI prediction core" for Showcase Mode.
 *
 * Layered glass sphere with a deep-indigo inner core, rotating tick/arc rings,
 * two orbiting neural-node belts, a radar sweep, an internal scanning beam,
 * HUD crosshairs, a radial spotlight and a glass pedestal. No 3D library, no
 * canvas, no images — pure CSS transforms and gradients. Entirely decorative
 * (`aria-hidden`, pointer-events none). All looping motion uses Phase 1 aurora
 * classes which the reduced-motion media query freezes to a static still.
 */

const BELT_A = [10, 55, 100, 145, 190, 235, 280, 325];
const BELT_B = [30, 110, 190, 270, 350];

const nodeColor = (i: number) =>
  i % 3 === 0
    ? "var(--aurora-cyan)"
    : i % 3 === 1
      ? "var(--aurora-violet)"
      : "var(--aurora-primary-bright)";

export function IntelligenceCore({ size = 380 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative select-none"
      style={{ width: size, height: size }}
    >
      {/* radial spotlight behind the whole core */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "-18%",
          background:
            "radial-gradient(circle at 50% 42%, var(--aurora-glow-primary), var(--aurora-glow-violet) 45%, transparent 72%)",
          opacity: 0.85,
          filter: "blur(8px)",
        }}
      />

      {/* glass pedestal + ground glow */}
      <div
        className="absolute left-1/2 h-[13%] w-[96%] -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: "-10%",
          background:
            "radial-gradient(ellipse at center, var(--aurora-glow-primary), transparent 70%)",
          filter: "blur(12px)",
        }}
      />
      <div
        className="absolute left-1/2 h-[8%] w-[72%] -translate-x-1/2"
        style={{
          bottom: "-6%",
          borderRadius: "50%",
          background: "var(--aurora-surface-glass)",
          border: "1px solid rgba(255,255,255,0.65)",
          boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-cyan-md)",
        }}
      />
      <div
        className="absolute left-1/2 h-[3%] w-[46%] -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: "-4.2%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
          opacity: 0.7,
        }}
      />

      {/* HUD crosshair hairlines */}
      <div
        className="absolute left-0 top-1/2 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--aurora-border-strong) 30%, transparent 50%, var(--aurora-border-strong) 70%, transparent)",
          opacity: 0.55,
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-full w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent, var(--aurora-border-strong) 30%, transparent 50%, var(--aurora-border-strong) 70%, transparent)",
          opacity: 0.45,
        }}
      />

      {/* floating assembly */}
      <div className="aurora-float-slow relative h-full w-full">
        {/* breathing halo */}
        <div
          className="aurora-soft-pulse absolute inset-[2%] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, var(--aurora-glow-primary), transparent 70%)",
          }}
        />

        {/* outer tick ring (instrument bezel) */}
        <div
          className="aurora-spin-slow absolute inset-0 rounded-full"
          style={{
            animationDuration: "90s",
            background:
              "repeating-conic-gradient(var(--aurora-border-strong) 0deg 0.7deg, transparent 0.7deg 6deg)",
            maskImage: "radial-gradient(circle, transparent 64.5%, black 65.5%, black 68%, transparent 69%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 64.5%, black 65.5%, black 68%, transparent 69%)",
            opacity: 0.8,
          }}
        />

        {/* dashed orbit */}
        <div
          className="absolute inset-[4%] rounded-full"
          style={{ border: "1px dashed var(--aurora-border-strong)", opacity: 0.6 }}
        />

        {/* neural node belt A */}
        <div className="aurora-spin-slow absolute inset-[4%]" style={{ animationDuration: "46s" }}>
          {BELT_A.map((angle, i) => (
            <span
              key={angle}
              className={i % 2 === 0 ? "aurora-soft-pulse absolute" : "absolute"}
              style={{
                left: "50%",
                top: "50%",
                width: i % 3 === 0 ? 9 : 6,
                height: i % 3 === 0 ? 9 : 6,
                marginLeft: i % 3 === 0 ? -4.5 : -3,
                marginTop: i % 3 === 0 ? -4.5 : -3,
                borderRadius: "999px",
                background: nodeColor(i),
                boxShadow: `0 0 12px 1px ${nodeColor(i)}`,
                transform: `rotate(${angle}deg) translateY(-${size * 0.46}px)`,
              }}
            />
          ))}
        </div>

        {/* neural node belt B (counter-orbit, inner) */}
        <div
          className="aurora-spin-slow absolute inset-[14%]"
          style={{ animationDirection: "reverse", animationDuration: "64s" }}
        >
          {BELT_B.map((angle, i) => (
            <span
              key={angle}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: 5,
                height: 5,
                marginLeft: -2.5,
                marginTop: -2.5,
                borderRadius: "999px",
                background: nodeColor(i + 1),
                boxShadow: `0 0 10px 1px ${nodeColor(i + 1)}`,
                transform: `rotate(${angle}deg) translateY(-${size * 0.355}px)`,
              }}
            />
          ))}
        </div>

        {/* glowing arc ring A (cyan) */}
        <div
          className="aurora-spin-slow absolute inset-[9%] rounded-full"
          style={{
            animationDuration: "18s",
            background:
              "conic-gradient(from 20deg, transparent 0deg, var(--aurora-2) 28deg, var(--aurora-1) 58deg, transparent 86deg)",
            maskImage: "radial-gradient(circle, transparent 88%, black 90%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 88%, black 90%)",
            opacity: 0.9,
          }}
        />

        {/* glowing arc ring B (violet, counter) */}
        <div
          className="aurora-spin-slow absolute inset-[16%] rounded-full"
          style={{
            animationDirection: "reverse",
            animationDuration: "27s",
            background:
              "conic-gradient(from 210deg, transparent 0deg, var(--aurora-3) 34deg, transparent 70deg)",
            maskImage: "radial-gradient(circle, transparent 86%, black 88%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 86%, black 88%)",
            opacity: 0.85,
          }}
        />

        {/* radar sweep wedge */}
        <div
          className="aurora-spin-slow absolute inset-[20%] rounded-full"
          style={{
            animationDuration: "9s",
            background:
              "conic-gradient(from 0deg, var(--aurora-glow-cyan) 0deg, transparent 55deg)",
            opacity: 0.6,
          }}
        />

        {/* layered glass sphere */}
        <div
          className="absolute inset-[23%] overflow-hidden rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95), rgba(255,255,255,0.35) 36%, rgba(199,210,254,0.22) 64%, rgba(165,180,252,0.30) 100%)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow:
              "var(--aurora-shadow-glass), var(--aurora-glow-md), inset 0 -14px 34px rgba(99,102,241,0.22)",
          }}
        >
          {/* deep indigo inner core */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "17%",
              background:
                "radial-gradient(circle at 36% 30%, var(--aurora-primary-bright), var(--aurora-primary) 42%, var(--aurora-text-primary) 96%)",
              boxShadow:
                "0 0 52px -6px var(--aurora-glow-primary), 0 0 90px -10px var(--aurora-glow-violet), inset 0 2px 14px rgba(255,255,255,0.35)",
            }}
          >
            <div
              className="absolute rounded-full"
              style={{ inset: "8%", border: "1px solid rgba(255,255,255,0.28)" }}
            />
            <div
              className="aurora-soft-pulse absolute rounded-full blur-md"
              style={{
                left: "22%",
                top: "16%",
                width: "26%",
                height: "20%",
                background: "rgba(255,255,255,0.65)",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <span
                className="text-center text-[0.5rem] font-bold uppercase leading-relaxed tracking-[0.3em] text-white/90"
                style={{ textShadow: "0 1px 10px rgba(15,23,42,0.5)" }}
              >
                Statstrive
                <br />
                AI Core
              </span>
            </div>
          </div>

          {/* internal scanning beam */}
          <div
            className="aurora-scan-y absolute left-[6%] top-0 h-[16%] w-[88%]"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--aurora-glow-cyan) 45%, rgba(255,255,255,0.35) 50%, var(--aurora-glow-cyan) 55%, transparent)",
              opacity: 0.7,
            }}
          />

          {/* sphere rim light */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 10px rgba(139,92,246,0.25)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

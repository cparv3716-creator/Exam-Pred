/**
 * AuroraHeroSceneFallback — static CSS atmosphere used when WebGL is
 * unavailable or the visitor prefers reduced motion. No animation at all:
 * soft aurora blooms, faint orbit rings and a quiet core glow.
 */
export function AuroraHeroSceneFallback() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* core glow (offset right on desktop, centered on mobile) */}
      <div
        className="absolute left-1/2 top-[38%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl lg:left-[68%]"
        style={{
          background:
            "radial-gradient(circle, var(--aurora-glow-primary), var(--aurora-glow-violet) 45%, transparent 72%)",
          opacity: 0.7,
        }}
      />
      {/* aurora ribbons */}
      <div
        className="absolute -right-[10%] top-[12%] h-72 w-[60%] rounded-full blur-3xl"
        style={{
          background: "linear-gradient(100deg, transparent, var(--aurora-glow-cyan), transparent)",
          opacity: 0.8,
        }}
      />
      <div
        className="absolute -right-[5%] bottom-[10%] h-64 w-[50%] rounded-full blur-3xl"
        style={{
          background: "linear-gradient(80deg, transparent, var(--aurora-glow-violet), transparent)",
          opacity: 0.7,
        }}
      />
      {/* static orbit rings */}
      <div
        className="absolute left-1/2 top-[38%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full lg:left-[68%]"
        style={{ border: "1px solid var(--aurora-border-soft)", opacity: 0.8 }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full lg:left-[68%]"
        style={{ border: "1px dashed var(--aurora-border-strong)", opacity: 0.5 }}
      />
    </div>
  );
}

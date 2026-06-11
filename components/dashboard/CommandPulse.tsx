/**
 * CommandPulse — lightweight Command Mode cockpit decor (CSS only, no canvas).
 * Concentric command rings, a slow radar sweep and two pulsing signal dots.
 * Decorative: aria-hidden, pointer-events none; frozen by reduced-motion.
 */
export function CommandPulse({ size = 150, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-full" style={{ border: "1px solid var(--aurora-border-soft)" }} />
      <span className="absolute inset-[16%] rounded-full" style={{ border: "1px dashed var(--aurora-border-strong)", opacity: 0.7 }} />
      <span className="absolute inset-[34%] rounded-full" style={{ border: "1px solid var(--aurora-border-soft)" }} />
      <span
        className="aurora-spin-slow absolute inset-0 rounded-full"
        style={{
          animationDuration: "11s",
          background: "conic-gradient(from 0deg, var(--aurora-glow-cyan), transparent 60deg)",
        }}
      />
      <span
        className="aurora-soft-pulse absolute h-1.5 w-1.5 rounded-full"
        style={{ left: "64%", top: "26%", background: "var(--aurora-cyan)", boxShadow: "0 0 10px 2px var(--aurora-glow-cyan)" }}
      />
      <span
        className="aurora-soft-pulse absolute h-1.5 w-1.5 rounded-full"
        style={{ left: "30%", top: "60%", background: "var(--aurora-violet)", boxShadow: "0 0 10px 2px var(--aurora-glow-violet)", animationDelay: "-1.4s" }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "var(--aurora-primary-bright)", boxShadow: "var(--aurora-glow-md)" }}
      />
    </div>
  );
}

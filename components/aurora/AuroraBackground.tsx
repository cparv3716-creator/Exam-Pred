import type { ReactNode } from "react";

/**
 * AuroraBackground — Showcase/Lab decorative background layer.
 *
 * Renders an icy Aurora canvas (`.aurora-orb-bg` drifting orbs from Phase 1)
 * with an optional faint grid, then slots its children above it. The orb layer
 * is purely decorative: `aria-hidden` + `pointer-events:none`, and the Phase 1
 * reduced-motion rules already freeze the drift animation.
 */
export function AuroraBackground({
  children,
  grid = true,
  className = "",
}: {
  children?: ReactNode;
  grid?: boolean;
  className?: string;
}) {
  return (
    <div className={`aurora-orb-bg relative isolate ${className}`}>
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(var(--aurora-border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--aurora-border-soft) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)",
          }}
        />
      )}
      {children}
    </div>
  );
}

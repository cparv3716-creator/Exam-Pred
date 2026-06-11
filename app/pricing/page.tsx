import type { Metadata } from "next";
import { Check, Crown } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { pricingPlans } from "@/data/pricing";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Statstrive demo pricing for free, premium and institution access tiers.",
};

export default function PricingPage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--aurora-primary)" }}>
              Pricing
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pick the intelligence layer you need.
            </h1>
            <p className="mt-4 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              Demo plans for the product preview. Payments and subscriptions are connected in a later phase.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="aurora-glass aurora-card-hover relative flex flex-col overflow-hidden p-7"
                style={
                  plan.highlighted
                    ? { boxShadow: "var(--aurora-shadow-glass), var(--aurora-glow-md)", borderColor: "var(--aurora-primary-bright)" }
                    : undefined
                }
              >
                {plan.highlighted && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
                  />
                )}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{plan.name}</h2>
                  {plan.highlighted && (
                    <span
                      className="aurora-badge"
                      style={{
                        color: "var(--aurora-primary)",
                        borderColor: "color-mix(in srgb, var(--aurora-primary) 40%, transparent)",
                        background: "color-mix(in srgb, var(--aurora-primary) 8%, transparent)",
                      }}
                    >
                      <Crown size={12} aria-hidden /> Most popular
                    </span>
                  )}
                </div>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tabular-nums tracking-tight">
                    {plan.price === "Custom" ? "Custom" : `\u20b9${plan.price}`}
                  </span>
                  <span className="text-sm" style={{ color: "var(--aurora-text-muted)" }}>
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                  {plan.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
                      <Check size={15} aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--aurora-success)" }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span
                  aria-disabled="true"
                  className={`${plan.highlighted ? "aurora-button-primary" : "aurora-button-secondary"} mt-6 w-full cursor-not-allowed text-sm opacity-90`}
                >
                  {plan.cta}
                </span>
              </div>
            ))}
          </div>

          <p
            className="aurora-surface mx-auto mt-10 max-w-3xl p-5 text-center text-sm leading-6"
            style={{ color: "var(--aurora-text-muted)" }}
          >
            {legalDisclaimer}
          </p>
        </div>
      </section>
    </AuroraPageShell>
  );
}

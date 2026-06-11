import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PricingCard } from "@/components/marketing/PricingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { pricingPlans } from "@/data/pricing";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Statstrive demo pricing for free, premium and institution access tiers.",
};

export default function PricingPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Pick the intelligence layer you need"
          description="Mock plans for the product demo. Payments and subscriptions will be connected in Phase 2."
          align="center"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl rounded-xl border border-white/8 bg-white/[0.025] p-5 text-center text-sm leading-relaxed text-slate-500">
          {legalDisclaimer}
        </p>
      </section>
    </PageShell>
  );
}

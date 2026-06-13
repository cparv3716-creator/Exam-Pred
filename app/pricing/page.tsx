import type { Metadata } from "next";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { RazorpayPricing } from "@/components/payments/RazorpayPricing";
import { legalDisclaimer } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose an exam and unlock Statstrive Pro securely with Razorpay.",
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
              One plan. Your chosen exam. Smarter preparation.
            </h1>
            <p className="mt-4 text-base leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
              Select your exam, choose monthly or yearly Pro access, and complete payment securely through Razorpay.
            </p>
          </div>

          <RazorpayPricing />

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

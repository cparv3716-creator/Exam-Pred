import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your Statstrive payment was verified successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg px-4 py-20 sm:px-6 lg:px-8">
        <div className="aurora-glass mx-auto max-w-xl p-8 text-center sm:p-12">
          <BadgeCheck size={52} className="mx-auto" style={{ color: "var(--aurora-success)" }} aria-hidden />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-success)" }}>
            Payment verified
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Your payment was verified successfully.</h1>
          <p className="mt-4 leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
            Access for your selected exam will be activated. You can continue to your dashboard now.
          </p>
          <Link href="/dashboard" className="aurora-button-primary mt-8 w-full text-sm">
            Go to dashboard <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </AuroraPageShell>
  );
}


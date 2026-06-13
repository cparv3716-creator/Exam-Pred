import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleX } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";

export const metadata: Metadata = {
  title: "Payment Unsuccessful",
  description: "Your Statstrive payment could not be completed or verified.",
};

export default function PaymentFailurePage() {
  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg px-4 py-20 sm:px-6 lg:px-8">
        <div className="aurora-glass mx-auto max-w-xl p-8 text-center sm:p-12">
          <CircleX size={52} className="mx-auto" style={{ color: "var(--aurora-danger)" }} aria-hidden />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-danger)" }}>
            Payment unsuccessful
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Payment failed or could not be verified.</h1>
          <p className="mt-4 leading-7" style={{ color: "var(--aurora-text-secondary)" }}>
            No access changes were made. Please return to pricing and try the payment again.
          </p>
          <Link href="/pricing" className="aurora-button-primary mt-8 w-full text-sm">
            <ArrowLeft size={16} aria-hidden /> Retry from pricing
          </Link>
        </div>
      </section>
    </AuroraPageShell>
  );
}

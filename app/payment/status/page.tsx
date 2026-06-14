import type { Metadata } from "next";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { PaymentStatusClient } from "@/components/payments/PaymentStatusClient";
import { requireUser } from "@/lib/backend/auth";
import { isExamId, isPaidPlanId } from "@/lib/payments/plans";

export const metadata: Metadata = {
  title: "Payment Status",
  description: "Confirming your Statstrive payment and premium exam access.",
};

export const dynamic = "force-dynamic";

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams?: Promise<{
    order_id?: string;
    examId?: string;
    planId?: string;
  }>;
}) {
  await requireUser("/payment/status");
  const params = searchParams ? await searchParams : {};

  return (
    <AuroraPageShell>
      <section className="aurora-soft-bg px-4 py-20 sm:px-6 lg:px-8">
        <PaymentStatusClient
          orderId={params.order_id?.trim() || null}
          examId={isExamId(params.examId) ? params.examId : null}
          planId={isPaidPlanId(params.planId) ? params.planId : null}
        />
      </section>
    </AuroraPageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { AuroraPageShell } from "@/components/aurora/AuroraPageShell";
import { requireUser } from "@/lib/backend/auth";
import {
  getExam,
  getExamAccessHref,
  isExamId,
  isPaidPlanId,
} from "@/lib/payments/plans";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your Statstrive payment was verified successfully.",
};

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ examId?: string; planId?: string; validUntil?: string }>;
}) {
  await requireUser("/payment/success");

  const params = searchParams ? await searchParams : {};
  const examId = isExamId(params.examId) ? params.examId : null;
  const planId = isPaidPlanId(params.planId) ? params.planId : null;
  const exam = examId ? getExam(examId) : null;
  const examHref = examId ? getExamAccessHref(examId) : "/dashboard";
  const expiry = params.validUntil ? new Date(params.validUntil) : null;
  const formattedExpiry = expiry && !Number.isNaN(expiry.getTime())
    ? expiry.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

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
            {exam
              ? `${exam.name} access is active${formattedExpiry ? ` until ${formattedExpiry}` : ""}.`
              : "Your selected exam access is active."}
          </p>
          {planId && (
            <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-muted)" }}>
              Plan: {planId === "pro_monthly" ? "Pro Monthly" : "Pro Yearly"}
            </p>
          )}
          <Link href={examHref} className="aurora-button-primary mt-8 w-full text-sm">
            Open {exam?.name ?? "dashboard"} <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </AuroraPageShell>
  );
}

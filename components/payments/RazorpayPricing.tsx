"use client";

import { useRef, useState } from "react";
import { Check, Crown, LoaderCircle, ShieldCheck } from "lucide-react";
import {
  getExam,
  getPlan,
  paymentExams,
  paymentPlans,
  type CreateOrderResponse,
  type ExamId,
  type PaidPlanId,
  type PlanId,
  type VerifyPaymentRequest,
} from "@/lib/payments/plans";

type RazorpaySuccessResponse = Pick<
  VerifyPaymentRequest,
  "razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature"
>;

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  notes: {
    examId: ExamId;
    planId: PaidPlanId;
  };
  theme: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

async function readJson<T extends object>(response: Response): Promise<T> {
  const body = (await response.json()) as T | { error?: string };

  if (!response.ok) {
    throw new Error("error" in body && body.error ? body.error : "Payment request failed.");
  }

  return body as T;
}

export function RazorpayPricing({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [examId, setExamId] = useState<ExamId>("cat");
  const [planId, setPlanId] = useState<PlanId>("pro_monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const paymentOutcomeStarted = useRef(false);

  const selectedExam = getExam(examId);
  const selectedPlan = getPlan(planId);

  async function startPayment() {
    if (planId === "free") {
      setMessage(`${selectedExam?.name ?? "This exam"} includes free access by default.`);
      return;
    }

    if (!isAuthenticated) {
      window.location.assign("/login?next=%2Fpricing");
      return;
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      setMessage("Razorpay is not configured. Add the public key and restart the app.");
      return;
    }

    setLoading(true);
    setMessage(null);
    paymentOutcomeStarted.current = false;

    try {
      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded. Check your connection and try again.");
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, planId }),
      });

      if (orderResponse.status === 401) {
        window.location.assign("/login?next=%2Fpricing");
        return;
      }

      const order = await readJson<CreateOrderResponse>(orderResponse);

      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: process.env.NEXT_PUBLIC_APP_NAME || "Statstrive",
        description: `${selectedExam?.name ?? examId} - ${selectedPlan?.name ?? planId}`,
        order_id: order.orderId,
        notes: { examId: order.examId, planId: order.planId },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: () => {
            if (!paymentOutcomeStarted.current) {
              window.location.assign("/payment/failure?reason=cancelled");
            }
          },
        },
        handler: async (payment) => {
          paymentOutcomeStarted.current = true;
          const params = new URLSearchParams({
            order_id: payment.razorpay_order_id || order.orderId,
            examId: order.examId,
            planId: order.planId,
          });

          try {
            const verifyPayload: VerifyPaymentRequest = {
              ...payment,
              examId: order.examId,
              planId: order.planId,
            };
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload),
            });
            await verifyResponse.json().catch(() => null);
          } catch (error) {
            console.error(
              "[payments/checkout] Browser verification request failed; status polling will reconcile.",
              error,
            );
          } finally {
            window.location.assign(`/payment/status?${params.toString()}`);
          }
        },
      });

      checkout.on("payment.failed", () => {
        if (paymentOutcomeStarted.current) {
          return;
        }

        paymentOutcomeStarted.current = true;
        window.location.assign("/payment/failure");
      });
      checkout.open();
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Payment could not be started.");
    }
  }

  return (
    <div className="mt-12">
      <section aria-labelledby="exam-selector-heading">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-primary)" }}>
              Step 1
            </p>
            <h2 id="exam-selector-heading" className="mt-2 text-2xl font-extrabold">
              Choose your exam
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--aurora-text-muted)" }}>
            Your Pro access will be tied to this exam.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {paymentExams.map((exam) => {
            const selected = exam.id === examId;
            return (
              <button
                key={exam.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setExamId(exam.id);
                  setMessage(null);
                }}
                className="aurora-focus-ring rounded-2xl border p-4 text-left transition-all"
                style={{
                  borderColor: selected ? "var(--aurora-primary-bright)" : "var(--aurora-border-soft)",
                  background: selected ? "rgba(99, 102, 241, 0.08)" : "var(--aurora-surface)",
                  boxShadow: selected ? "var(--aurora-glow-sm)" : "var(--aurora-shadow-1)",
                }}
              >
                <span className="block text-sm font-extrabold">{exam.name}</span>
                <span className="mt-1 block text-xs leading-5" style={{ color: "var(--aurora-text-muted)" }}>
                  {exam.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="plan-selector-heading">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--aurora-primary)" }}>
          Step 2
        </p>
        <h2 id="plan-selector-heading" className="mt-2 text-2xl font-extrabold">
          Select a plan
        </h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          {paymentPlans.map((plan) => {
            const selected = plan.id === planId;
            return (
              <article
                key={plan.id}
                className="aurora-glass relative flex flex-col overflow-hidden p-7"
                style={{
                  borderColor: selected ? "var(--aurora-primary-bright)" : undefined,
                  boxShadow: selected ? "var(--aurora-shadow-glass), var(--aurora-glow-md)" : undefined,
                }}
              >
                {plan.highlighted && (
                  <span className="aurora-badge absolute right-5 top-5" style={{ color: "var(--aurora-primary)" }}>
                    <Crown size={12} aria-hidden /> Most popular
                  </span>
                )}
                <h3 className="pr-28 text-lg font-extrabold">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {"\u20b9"}
                    {plan.priceRupees}
                  </span>
                  <span className="text-sm" style={{ color: "var(--aurora-text-muted)" }}>
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
                  {plan.description}
                </p>
                <ul className="mt-5 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
                      <Check size={15} aria-hidden className="mt-0.5 shrink-0" style={{ color: "var(--aurora-success)" }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setPlanId(plan.id);
                    setMessage(null);
                  }}
                  className={`${selected ? "aurora-button-primary" : "aurora-button-secondary"} mt-7 w-full text-sm`}
                >
                  {selected ? "Selected" : `Choose ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="aurora-surface mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck size={18} style={{ color: "var(--aurora-success)" }} />
            {planId === "free" ? "Free access" : "Secure Razorpay checkout"}
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--aurora-text-secondary)" }}>
            {selectedExam?.name} - {selectedPlan?.name} - {"\u20b9"}
            {selectedPlan?.priceRupees}
          </p>
          {message && (
            <p role="status" className="mt-2 text-sm font-semibold" style={{ color: "var(--aurora-danger)" }}>
              {message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={startPayment}
          disabled={loading}
          className="aurora-button-primary min-w-56 text-sm disabled:cursor-wait disabled:opacity-60"
        >
          {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
          {loading ? "Preparing checkout..." : planId === "free" ? "Continue with free access" : "Pay with Razorpay"}
        </button>
      </section>
    </div>
  );
}

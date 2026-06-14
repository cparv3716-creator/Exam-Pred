"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ExamId,
  PaidPlanId,
  PaymentStatusResponse,
} from "@/lib/payments/plans";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 20_000;

type ViewState =
  | { phase: "checking" }
  | {
      phase: "active";
      examId: ExamId;
      planId: PaidPlanId;
      validUntil: string;
    }
  | { phase: "unresolved" };

export function PaymentStatusClient({
  orderId,
  examId,
  planId,
}: {
  orderId: string | null;
  examId: ExamId | null;
  planId: PaidPlanId | null;
}) {
  const [view, setView] = useState<ViewState>({ phase: "checking" });
  const runId = useRef(0);

  const checkStatus = useCallback(async () => {
    runId.current += 1;
    const currentRun = runId.current;
    setView({ phase: "checking" });

    if (!orderId || !examId || !planId) {
      setView({ phase: "unresolved" });
      return;
    }

    const startedAt = Date.now();

    while (runId.current === currentRun) {
      const remainingTime = POLL_TIMEOUT_MS - (Date.now() - startedAt);
      if (remainingTime <= 0) {
        setView({ phase: "unresolved" });
        return;
      }

      const controller = new AbortController();
      const requestTimeout = window.setTimeout(
        () => controller.abort(),
        Math.min(POLL_INTERVAL_MS, remainingTime),
      );

      try {
        const query = new URLSearchParams({
          order_id: orderId,
          examId,
          planId,
        });
        const response = await fetch(`/api/payments/status?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as PaymentStatusResponse;

        if (result.status === "active") {
          setView({
            phase: "active",
            examId: result.examId,
            planId: result.planId,
            validUntil: result.validUntil,
          });
          return;
        }

        if (result.status === "failed") {
          setView({ phase: "unresolved" });
          return;
        }
      } catch {
        // Transient status lookup failures are retried until the polling window ends.
      } finally {
        window.clearTimeout(requestTimeout);
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setView({ phase: "unresolved" });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }, [examId, orderId, planId]);

  useEffect(() => {
    void checkStatus();
    return () => {
      runId.current += 1;
    };
  }, [checkStatus]);

  if (view.phase === "active") {
    const expiry = new Date(view.validUntil);
    const validUntil = Number.isNaN(expiry.getTime())
      ? view.validUntil
      : expiry.toLocaleString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

    return (
      <div className="aurora-glass mx-auto max-w-xl p-8 text-center sm:p-12">
        <BadgeCheck
          size={52}
          className="mx-auto"
          style={{ color: "var(--aurora-success)" }}
          aria-hidden
        />
        <p
          className="mt-6 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--aurora-success)" }}
        >
          Payment successful
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Premium unlocked
        </h1>
        <div
          className="mt-6 grid gap-2 rounded-2xl border p-5 text-left text-sm"
          style={{
            borderColor: "var(--aurora-border-soft)",
            color: "var(--aurora-text-secondary)",
          }}
        >
          <p>Exam: <strong>{view.examId}</strong></p>
          <p>Plan: <strong>{view.planId}</strong></p>
          <p>Valid until: <strong>{validUntil}</strong></p>
        </div>
        <Link href="/dashboard" className="aurora-button-primary mt-8 w-full text-sm">
          Go to dashboard <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    );
  }

  if (view.phase === "unresolved") {
    return (
      <div className="aurora-glass mx-auto max-w-xl p-8 text-center sm:p-12">
        <RefreshCw
          size={48}
          className="mx-auto"
          style={{ color: "var(--aurora-warning)" }}
          aria-hidden
        />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Payment received but activation is still pending.
        </h1>
        <p
          className="mt-4 leading-7"
          style={{ color: "var(--aurora-text-secondary)" }}
        >
          Please refresh or contact support.
        </p>
        <button
          type="button"
          onClick={() => void checkStatus()}
          className="aurora-button-primary mt-8 w-full text-sm"
        >
          <RefreshCw size={16} aria-hidden /> Check again
        </button>
        <Link href="/dashboard" className="aurora-button-secondary mt-3 w-full text-sm">
          Go to dashboard <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="aurora-glass mx-auto max-w-xl p-8 text-center sm:p-12">
      <LoaderCircle
        size={50}
        className="mx-auto animate-spin"
        style={{ color: "var(--aurora-primary)" }}
        aria-hidden
      />
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Activating your subscription...
      </h1>
      <p
        className="mt-4 leading-7"
        style={{ color: "var(--aurora-text-secondary)" }}
      >
        We are confirming your payment and unlocking premium exam access.
      </p>
    </div>
  );
}

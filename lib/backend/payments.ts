import "server-only";

import { supabaseAdminRestFetch } from "@/lib/supabase/admin";
import type { ExamId, PaidPlanId } from "@/lib/payments/plans";

export type PaymentOrderRow = {
  id: string;
  user_id: string;
  exam_id: ExamId;
  plan_id: PaidPlanId;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type UserExamSubscriptionRow = {
  id: string;
  user_id: string;
  exam_id: ExamId;
  plan_id: PaidPlanId;
  status: string;
  valid_from: string;
  valid_until: string;
  source_payment_id: string | null;
};

type ActivateVerifiedPaymentRow = {
  valid_until: string;
  already_processed: boolean;
};

export function insertPaymentOrder(input: {
  userId: string;
  examId: ExamId;
  planId: PaidPlanId;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}) {
  return supabaseAdminRestFetch<PaymentOrderRow[]>("payment_orders", {
    method: "POST",
    body: JSON.stringify({
      user_id: input.userId,
      exam_id: input.examId,
      plan_id: input.planId,
      razorpay_order_id: input.razorpayOrderId,
      amount: input.amount,
      currency: input.currency,
      status: "created",
    }),
  });
}

export async function getPaymentOrder(input: {
  userId: string;
  examId: ExamId;
  planId: PaidPlanId;
  razorpayOrderId: string;
}) {
  const rows = await supabaseAdminRestFetch<PaymentOrderRow[]>(
    `payment_orders?user_id=eq.${encodeURIComponent(input.userId)}&exam_id=eq.${encodeURIComponent(input.examId)}&plan_id=eq.${encodeURIComponent(input.planId)}&razorpay_order_id=eq.${encodeURIComponent(input.razorpayOrderId)}&select=*&limit=1`,
  );

  return rows[0] ?? null;
}

export async function getPaymentOrderByRazorpayId(razorpayOrderId: string) {
  const rows = await supabaseAdminRestFetch<PaymentOrderRow[]>(
    `payment_orders?razorpay_order_id=eq.${encodeURIComponent(razorpayOrderId)}&select=*&limit=1`,
  );

  return rows[0] ?? null;
}

export async function activateVerifiedPayment(input: {
  userId: string;
  examId: ExamId;
  planId: PaidPlanId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  durationMonths: number;
}) {
  const rows = await supabaseAdminRestFetch<ActivateVerifiedPaymentRow[]>(
    "rpc/activate_verified_payment",
    {
      method: "POST",
      body: JSON.stringify({
        p_user_id: input.userId,
        p_exam_id: input.examId,
        p_plan_id: input.planId,
        p_razorpay_order_id: input.razorpayOrderId,
        p_razorpay_payment_id: input.razorpayPaymentId,
        p_razorpay_signature: input.razorpaySignature,
        p_amount: input.amount,
        p_currency: input.currency,
        p_duration_months: input.durationMonths,
      }),
    },
  );

  return rows[0] ?? null;
}

export async function recordFailedPayment(input: {
  userId: string;
  examId: ExamId;
  planId: PaidPlanId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  webhookEventId: string | null;
  errorCode: string | null;
  errorDescription: string | null;
  errorSource: string | null;
  errorStep: string | null;
  errorReason: string | null;
}) {
  return supabaseAdminRestFetch<string>("rpc/record_failed_payment", {
    method: "POST",
    body: JSON.stringify({
      p_user_id: input.userId,
      p_exam_id: input.examId,
      p_plan_id: input.planId,
      p_razorpay_order_id: input.razorpayOrderId,
      p_razorpay_payment_id: input.razorpayPaymentId,
      p_amount: input.amount,
      p_currency: input.currency,
      p_webhook_event_id: input.webhookEventId,
      p_error_code: input.errorCode,
      p_error_description: input.errorDescription,
      p_error_source: input.errorSource,
      p_error_step: input.errorStep,
      p_error_reason: input.errorReason,
    }),
  });
}

export async function getActiveExamSubscription(userId: string, examId: ExamId) {
  const now = new Date().toISOString();
  const rows = await supabaseAdminRestFetch<UserExamSubscriptionRow[]>(
    `user_exam_subscriptions?user_id=eq.${encodeURIComponent(userId)}&exam_id=eq.${encodeURIComponent(examId)}&status=eq.active&valid_until=gt.${encodeURIComponent(now)}&select=*&limit=1`,
  );

  return rows[0] ?? null;
}

export async function getAnyActiveExamSubscription(userId: string) {
  const now = new Date().toISOString();
  const rows = await supabaseAdminRestFetch<UserExamSubscriptionRow[]>(
    `user_exam_subscriptions?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&valid_until=gt.${encodeURIComponent(now)}&select=*&order=valid_until.desc&limit=1`,
  );

  return rows[0] ?? null;
}

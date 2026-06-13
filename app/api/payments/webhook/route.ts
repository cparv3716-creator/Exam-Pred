import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  activateVerifiedPayment,
  getPaymentOrderByRazorpayId,
  recordFailedPayment,
} from "@/lib/backend/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_EVENTS = new Set(["payment.captured", "payment.failed", "order.paid"]);

type RazorpayPaymentEntity = {
  id?: unknown;
  order_id?: unknown;
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
  error_code?: unknown;
  error_description?: unknown;
  error_source?: unknown;
  error_step?: unknown;
  error_reason?: unknown;
};

type RazorpayWebhookPayload = {
  event?: unknown;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
};

function text(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function integer(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) ? value : null;
}

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const generated = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(generated, "utf8");
  const received = Buffer.from(signature, "utf8");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function logWebhook(message: string, details: Record<string, unknown>) {
  console.info(`[payments/webhook] ${message}`, details);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[payments/webhook] RAZORPAY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    console.warn("[payments/webhook] Rejected invalid webhook signature.");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let webhook: RazorpayWebhookPayload;
  try {
    webhook = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const event = text(webhook.event);
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!event || !SUPPORTED_EVENTS.has(event)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const payment = webhook.payload?.payment?.entity;
  const paymentId = text(payment?.id);
  const orderId = text(payment?.order_id);
  const amount = integer(payment?.amount);
  const currency = text(payment?.currency);

  if (!paymentId || !orderId || amount === null || !currency) {
    console.error("[payments/webhook] Supported event is missing payment fields.", {
      event,
      eventId,
    });
    return NextResponse.json({ error: "Incomplete webhook payload." }, { status: 400 });
  }

  try {
    const order = await getPaymentOrderByRazorpayId(orderId);

    if (!order) {
      logWebhook("Ignoring event for an unknown local order.", { event, eventId, orderId, paymentId });
      return NextResponse.json({ received: true, ignored: true });
    }

    if (amount !== order.amount || currency !== order.currency) {
      console.error("[payments/webhook] Payment amount or currency did not match the local order.", {
        event,
        eventId,
        orderId,
        paymentId,
      });
      return NextResponse.json({ error: "Payment does not match order." }, { status: 400 });
    }

    if (event === "payment.failed") {
      await recordFailedPayment({
        userId: order.user_id,
        examId: order.exam_id,
        planId: order.plan_id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        amount,
        currency,
        webhookEventId: eventId,
        errorCode: text(payment?.error_code),
        errorDescription: text(payment?.error_description),
        errorSource: text(payment?.error_source),
        errorStep: text(payment?.error_step),
        errorReason: text(payment?.error_reason),
      });

      console.warn("[payments/webhook] Payment failed.", {
        eventId,
        orderId,
        paymentId,
        errorCode: text(payment?.error_code),
        errorReason: text(payment?.error_reason),
      });
      return NextResponse.json({ received: true, status: "failed" });
    }

    const activation = await activateVerifiedPayment({
      userId: order.user_id,
      examId: order.exam_id,
      planId: order.plan_id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: null,
      amount,
      currency,
      durationMonths: order.plan_id === "pro_monthly" ? 1 : 12,
    });

    if (!activation?.valid_until) {
      throw new Error("Subscription activation returned no expiry.");
    }

    logWebhook("Premium exam access activated.", {
      event,
      eventId,
      orderId,
      paymentId,
      examId: order.exam_id,
      alreadyProcessed: activation.already_processed,
    });

    return NextResponse.json({
      received: true,
      status: "verified",
      alreadyProcessed: activation.already_processed,
    });
  } catch (error) {
    console.error("[payments/webhook] Event processing failed.", {
      event,
      eventId,
      orderId,
      paymentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

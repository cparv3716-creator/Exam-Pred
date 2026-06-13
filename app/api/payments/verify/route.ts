import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import { activateVerifiedPayment, getPaymentOrder } from "@/lib/backend/payments";
import {
  isExamId,
  isPaidPlanId,
  type VerifyPaymentResponse,
} from "@/lib/payments/plans";

export const runtime = "nodejs";

function devLog(message: string, details?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[payments/verify] ${message}`, details ?? "");
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      examId,
      planId,
    } = body;
    const user = await getCurrentUser();

    devLog("request received", { examId, planId, authenticated: Boolean(user) });

    if (!user) {
      return NextResponse.json({ success: false, error: "Login required." }, { status: 401 });
    }

    if (!isExamId(examId) || !isPaidPlanId(planId)) {
      return NextResponse.json({ success: false, error: "Invalid examId or planId." }, { status: 400 });
    }

    if (
      !isNonEmptyString(razorpay_order_id) ||
      !isNonEmptyString(razorpay_payment_id) ||
      !isNonEmptyString(razorpay_signature)
    ) {
      return NextResponse.json({ success: false, error: "Missing Razorpay payment fields." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      devLog("Razorpay key secret is not configured.");
      return NextResponse.json({ success: false, error: "Payment service is not configured." }, { status: 500 });
    }

    let order;
    try {
      order = await getPaymentOrder({
        userId: user.id,
        examId,
        planId,
        razorpayOrderId: razorpay_order_id,
      });
    } catch (error) {
      devLog("Supabase payment order lookup failed", {
        orderId: razorpay_order_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ success: false, error: "Could not load payment order." }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Payment order was not found." }, { status: 400 });
    }

    const generatedSignature = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const expected = Buffer.from(generatedSignature, "utf8");
    const received = Buffer.from(razorpay_signature, "utf8");
    const signatureIsValid =
      expected.length === received.length && timingSafeEqual(expected, received);

    if (!signatureIsValid) {
      return NextResponse.json({ success: false } satisfies VerifyPaymentResponse, { status: 400 });
    }

    const durationMonths = planId === "pro_monthly" ? 1 : 12;
    let activation;

    try {
      activation = await activateVerifiedPayment({
        userId: user.id,
        examId,
        planId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: order.amount,
        currency: order.currency,
        durationMonths,
      });
    } catch (error) {
      devLog("Supabase payment activation failed", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ success: false, error: "Could not activate exam access." }, { status: 500 });
    }

    if (!activation?.valid_until) {
      devLog("Supabase activation returned no subscription expiry", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json({ success: false, error: "Could not activate exam access." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      examId,
      planId,
      validUntil: activation.valid_until,
    } satisfies VerifyPaymentResponse);
  } catch (error) {
    devLog("Payment verification failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false } satisfies VerifyPaymentResponse, { status: 500 });
  }
}

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  isExamId,
  isPaidPlanId,
  type VerifyPaymentResponse,
} from "@/lib/payments/plans";

export const runtime = "nodejs";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      examId,
      planId,
    } = body;

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
      console.error("Razorpay key secret is not configured.");
      return NextResponse.json({ success: false, error: "Payment service is not configured." }, { status: 500 });
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

    // TODO: Persist the verified purchase after auth and subscription tables are available.
    // Store userId, examId, planId, paymentId, orderId, and the calculated subscription expiry.

    return NextResponse.json({ success: true } satisfies VerifyPaymentResponse);
  } catch (error) {
    console.error("Razorpay payment verification failed:", error);
    return NextResponse.json({ success: false } satisfies VerifyPaymentResponse, { status: 500 });
  }
}


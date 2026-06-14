import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import {
  getActiveExamSubscription,
  getPaymentOrder,
  getPaymentsForOrder,
} from "@/lib/backend/payments";
import {
  isExamId,
  isPaidPlanId,
  type PaymentStatusResponse,
} from "@/lib/payments/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failed(reason: string, status: number) {
  return NextResponse.json(
    { status: "failed", reason } satisfies PaymentStatusResponse,
    { status },
  );
}

export async function GET(request: Request) {
  let user;

  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error(
      "[payments/status] Authentication lookup failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return failed("Could not check payment status.", 500);
  }

  if (!user) {
    return failed("Login required.", 401);
  }

  const params = new URL(request.url).searchParams;
  const orderId = params.get("order_id")?.trim();
  const examId = params.get("examId");
  const planId = params.get("planId");

  if (!orderId || !isExamId(examId) || !isPaidPlanId(planId)) {
    return failed("Invalid payment status request.", 400);
  }

  try {
    const order = await getPaymentOrder({
      userId: user.id,
      examId,
      planId,
      razorpayOrderId: orderId,
    });

    if (!order) {
      return failed("Payment order was not found.", 404);
    }

    const [subscription, payments] = await Promise.all([
      getActiveExamSubscription(user.id, examId),
      getPaymentsForOrder({
        userId: user.id,
        examId,
        planId,
        razorpayOrderId: orderId,
      }),
    ]);

    const verifiedPayment = payments.some(
      (payment) => payment.status.toLowerCase() === "verified",
    );
    const orderIsVerified = order.status.toLowerCase() === "verified";

    if (subscription && (verifiedPayment || orderIsVerified)) {
      return NextResponse.json({
        status: "active",
        examId,
        planId,
        validUntil: subscription.valid_until,
      } satisfies PaymentStatusResponse);
    }

    if (verifiedPayment || orderIsVerified) {
      return NextResponse.json({
        status: "verified_but_activating",
        examId,
        planId,
      } satisfies PaymentStatusResponse);
    }

    const failedPayment = payments.find(
      (payment) => payment.status.toLowerCase() === "failed",
    );

    if (failedPayment || order.status.toLowerCase() === "failed") {
      return failed(
        failedPayment?.error_reason ||
          failedPayment?.error_description ||
          "Payment was not completed.",
        200,
      );
    }

    return NextResponse.json({
      status: "pending",
      examId,
      planId,
    } satisfies PaymentStatusResponse);
  } catch (error) {
    console.error("[payments/status] Status lookup failed:", {
      orderId,
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return failed("Could not check payment status.", 500);
  }
}

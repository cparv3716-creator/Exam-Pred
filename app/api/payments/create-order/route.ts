import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCurrentUser } from "@/lib/backend/auth";
import { insertPaymentOrder } from "@/lib/backend/payments";
import {
  getPlan,
  isExamId,
  isPaidPlanId,
  type CreateOrderResponse,
} from "@/lib/payments/plans";

export const runtime = "nodejs";

function devLog(message: string, details?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[payments/create-order] ${message}`, details ?? "");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const { examId, planId } = body;
    // Server-confirmed identity only — derived from the cookie session via getUser().
    const user = await getCurrentUser();

    devLog("request received", { examId, planId, authenticated: Boolean(user) });

    if (!user) {
      return NextResponse.json(
        { error: "Please log in before upgrading.", redirect: "/login?next=/pricing" },
        { status: 401 },
      );
    }

    if (!isExamId(examId)) {
      return NextResponse.json({ error: "Invalid examId." }, { status: 400 });
    }

    if (!isPaidPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid paid planId. Free plans do not require a Razorpay order." },
        { status: 400 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      devLog("Razorpay server credentials are not configured.");
      return NextResponse.json({ error: "Payment service is not configured." }, { status: 500 });
    }

    const plan = getPlan(planId);
    if (!plan || plan.priceRupees <= 0) {
      return NextResponse.json({ error: "The selected plan cannot be purchased." }, { status: 400 });
    }

    const amount = plan.priceRupees * 100;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `examiq_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: { examId, planId },
    });

    devLog("Razorpay order created", { orderId: order.id });

    try {
      await insertPaymentOrder({
        userId: user.id,
        examId,
        planId,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      });
    } catch (error) {
      devLog("Supabase payment_orders insert failed", {
        orderId: order.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ error: "Unable to save payment order." }, { status: 500 });
    }

    const response: CreateOrderResponse = {
      orderId: order.id,
      amount: Number(order.amount),
      currency: "INR",
      examId,
      planId,
    };

    return NextResponse.json(response);
  } catch (error) {
    devLog("Order creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Unable to create payment order." }, { status: 500 });
  }
}

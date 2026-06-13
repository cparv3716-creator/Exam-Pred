import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import {
  getPlan,
  isExamId,
  isPaidPlanId,
  type CreateOrderResponse,
} from "@/lib/payments/plans";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { examId, planId } = body;

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
      console.error("Razorpay server credentials are not configured.");
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
      receipt: `examiq_${Date.now()}`,
      notes: { examId, planId },
    });

    const response: CreateOrderResponse = {
      orderId: order.id,
      amount: Number(order.amount),
      currency: "INR",
      examId,
      planId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json({ error: "Unable to create payment order." }, { status: 500 });
  }
}


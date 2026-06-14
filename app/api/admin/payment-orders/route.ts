import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/backend/auth";
import { listPaymentOrders } from "@/lib/backend/admin-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin("/admin/payments");
  const paymentOrders = await listPaymentOrders();
  return NextResponse.json({ paymentOrders });
}

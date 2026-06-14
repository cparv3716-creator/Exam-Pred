import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/backend/auth";
import { listUserExamSubscriptions } from "@/lib/backend/admin-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin("/admin/subscriptions");
  const subscriptions = await listUserExamSubscriptions();
  return NextResponse.json({ subscriptions });
}

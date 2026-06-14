import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/backend/auth";
import { getAdminUserAccessSummaries } from "@/lib/backend/admin-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin("/admin/users");
  const users = await getAdminUserAccessSummaries();
  return NextResponse.json({ users });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/backend/auth";
import { revokeManualPremium } from "@/lib/backend/admin-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ grantId: string }> },
) {
  const admin = await requireAdmin("/admin/users");
  const { grantId } = await params;

  try {
    const grant = await revokeManualPremium({ adminUserId: admin.id, grantId });
    return NextResponse.json({ grant });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not revoke premium access." },
      { status: 400 },
    );
  }
}

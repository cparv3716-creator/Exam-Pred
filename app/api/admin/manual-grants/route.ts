import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/backend/auth";
import {
  assertAdminExamId,
  assertAdminTargetUserId,
  grantManualPremium,
} from "@/lib/backend/admin-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await requireAdmin("/admin/users");
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const targetUserId = assertAdminTargetUserId(body.targetUserId);
    const examId = assertAdminExamId(body.examId);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const validUntil = typeof body.validUntil === "string" && body.validUntil ? body.validUntil : null;

    const grant = await grantManualPremium({
      adminUserId: admin.id,
      targetUserId,
      examId,
      reason,
      validUntil,
    });

    return NextResponse.json({ grant });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not grant premium access." },
      { status: 400 },
    );
  }
}

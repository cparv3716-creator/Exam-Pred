import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import { getEffectiveAccess } from "@/lib/backend/access";
import { isExamId, type AccessCheckResponse } from "@/lib/payments/plans";

export const runtime = "nodejs";

function devLog(message: string, details?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[access/check] ${message}`, details ?? "");
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const user = await getCurrentUser();

  devLog("request received", { examId: body.examId, authenticated: Boolean(user) });

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!isExamId(body.examId)) {
    return NextResponse.json({ error: "Invalid examId." }, { status: 400 });
  }

  try {
    const access = await getEffectiveAccess({ user, examId: body.examId });
    const response: AccessCheckResponse = access.isPremium || access.isAdmin
      ? {
          hasAccess: true,
          examId: body.examId,
          validUntil: access.validUntil,
        }
      : {
          hasAccess: false,
          examId: body.examId,
        };

    return NextResponse.json(response);
  } catch (error) {
    devLog("Supabase access lookup failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Could not check exam access." }, { status: 500 });
  }
}

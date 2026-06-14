import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import { getEffectiveAccess } from "@/lib/backend/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const access = await getEffectiveAccess({ user });

  return NextResponse.json({
    level: access.level,
    source: access.source,
    isGuest: access.isGuest,
    isFree: access.isFree,
    isPremium: access.isPremium,
    isAdmin: access.isAdmin,
    premiumExamIds: access.premiumExamIds,
  });
}

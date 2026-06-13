import { NextResponse } from "next/server";
import { getUserFromToken, setAuthCookies } from "@/lib/supabase/server";

type SessionPayload = {
  accessToken?: string;
  refreshToken?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SessionPayload;

  if (!body.accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 400 });
  }

  const user = await getUserFromToken(body.accessToken);

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Session stored." });
  setAuthCookies(response, {
    access_token: body.accessToken,
    refresh_token: body.refreshToken,
    expires_in: 60 * 60,
    user,
  });

  return response;
}

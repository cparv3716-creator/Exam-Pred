import { NextResponse } from "next/server";
import { clearCodeVerifierCookie, exchangeCodeForSession, setAuthCookies } from "@/lib/supabase/server";

type ExchangePayload = {
  code?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ExchangePayload;
  const code = body.code;

  if (!code) {
    return NextResponse.json({ error: "Missing auth code." }, { status: 400 });
  }

  try {
    const session = await exchangeCodeForSession(code);
    const response = NextResponse.json({ message: "Signed in." });
    setAuthCookies(response, session);
    clearCodeVerifierCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auth callback failed." },
      { status: 400 },
    );
  }
}

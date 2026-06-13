import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies, supabaseAuthFetch, type AuthSessionPayload } from "@/lib/supabase/server";

type ExchangePayload = {
  code?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ExchangePayload;
  const code = body.code;
  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("ss-code-verifier")?.value;

  if (!code) {
    return NextResponse.json({ error: "Missing auth code." }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing verifier for auth callback." }, { status: 400 });
  }

  try {
    const session = await supabaseAuthFetch<AuthSessionPayload>("/token?grant_type=pkce", {
      method: "POST",
      body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
    });

    const response = NextResponse.json({ message: "Signed in." });
    setAuthCookies(response, session);
    response.cookies.set("ss-code-verifier", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auth callback failed." },
      { status: 400 },
    );
  }
}

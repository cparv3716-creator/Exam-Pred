import { NextResponse } from "next/server";
import { setAuthCookies, supabaseAuthFetch, type AuthSessionPayload } from "@/lib/supabase/server";

type VerifyRecoveryOtpPayload = {
  email?: string;
  token?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VerifyRecoveryOtpPayload;
  const email = body.email?.trim();
  const token = body.token?.trim();

  if (!email || !token) {
    return NextResponse.json({ error: "Email and reset code are required." }, { status: 400 });
  }

  try {
    const session = await supabaseAuthFetch<AuthSessionPayload>("/verify", {
      method: "POST",
      body: JSON.stringify({
        email,
        token,
        type: "recovery",
      }),
    });

    const response = NextResponse.json({ message: "Reset code verified." });
    setAuthCookies(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid or expired reset code." },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { setAuthCookies, supabaseAuthFetch, type AuthSessionPayload } from "@/lib/supabase/server";

type LoginPayload = {
  email?: string;
  password?: string;
};

function isEmailNotConfirmed(error: unknown) {
  return error instanceof Error && /confirm|verified|verify/i.test(error.message);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const session = await supabaseAuthFetch<AuthSessionPayload>("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!session.access_token) {
      return NextResponse.json({ error: "Login failed. Please try again." }, { status: 401 });
    }

    const response = NextResponse.json({ next: "/dashboard" });
    setAuthCookies(response, session);
    return response;
  } catch (error) {
    if (isEmailNotConfirmed(error)) {
      return NextResponse.json(
        { error: "Please verify your email before logging in.", code: "email_not_confirmed" },
        { status: 403 },
      );
    }

    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
}

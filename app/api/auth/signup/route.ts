import { NextResponse } from "next/server";
import { getSiteUrl, setAuthCookies, supabaseAuthFetch, type AuthSessionPayload } from "@/lib/supabase/server";

type SignupPayload = {
  email?: string;
  password?: string;
  fullName?: string;
};

type SignupResponse = AuthSessionPayload & {
  session?: AuthSessionPayload | null;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SignupPayload;
  const email = body.email?.trim();
  const password = body.password;
  const fullName = body.fullName?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const data = await supabaseAuthFetch<SignupResponse>("/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: { full_name: fullName },
        email_redirect_to: `${getSiteUrl()}/auth/callback`,
      }),
    });

    const session = data.session ?? (data.access_token ? data : null);
    const hasConfirmedSession = Boolean(session?.access_token && data.user?.email_confirmed_at);
    const response = NextResponse.json({
      message: "Check your email to verify your account",
      hasSession: hasConfirmedSession,
    });

    if (hasConfirmedSession && session) {
      setAuthCookies(response, session);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed. Please try again." },
      { status: 400 },
    );
  }
}

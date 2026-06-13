import { NextResponse } from "next/server";
import { getSiteUrl, supabaseAuthFetch } from "@/lib/supabase/server";

type ForgotPasswordPayload = {
  email?: string;
  redirectTo?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ForgotPasswordPayload;
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const fallbackRedirectTo = `${getSiteUrl()}/auth/callback?next=/reset-password`;
    const redirectTo = getSafeResetRedirect(body.redirectTo) ?? fallbackRedirectTo;

    await supabaseAuthFetch("/recover", {
      method: "POST",
      body: JSON.stringify({
        email,
        redirect_to: redirectTo,
      }),
    });

    return NextResponse.json({ message: "Check your email for the password reset link." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send reset email." },
      { status: 400 },
    );
  }
}

function getSafeResetRedirect(value: string | undefined) {
  if (!value) {
    return null;
  }

  const siteUrl = getSiteUrl();

  try {
    const parsed = new URL(value);
    const expected = new URL(siteUrl);

    if (parsed.origin !== expected.origin || parsed.pathname !== "/auth/callback") {
      return null;
    }

    if (parsed.searchParams.get("next") !== "/reset-password") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

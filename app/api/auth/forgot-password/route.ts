import { NextResponse } from "next/server";
import { getSiteUrl, supabaseAuthFetch } from "@/lib/supabase/server";

type ForgotPasswordPayload = {
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ForgotPasswordPayload;
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    await supabaseAuthFetch("/recover", {
      method: "POST",
      body: JSON.stringify({ email, redirect_to: `${getSiteUrl()}/reset-password` }),
    });

    return NextResponse.json({ message: "Password reset email sent." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send reset email." },
      { status: 400 },
    );
  }
}

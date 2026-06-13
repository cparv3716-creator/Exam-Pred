import { NextResponse } from "next/server";
import { getAccessTokenFromCookies, supabaseAuthFetch } from "@/lib/supabase/server";

type ResetPasswordPayload = {
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ResetPasswordPayload;
  const password = body.password;
  const accessToken = await getAccessTokenFromCookies();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Reset session expired. Please use a fresh reset link." }, { status: 401 });
  }

  try {
    await supabaseAuthFetch("/user", {
      method: "PUT",
      body: JSON.stringify({ password }),
    }, accessToken);

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update password." },
      { status: 400 },
    );
  }
}

import { NextResponse } from "next/server";
import { clearAuthCookies, getAccessTokenFromCookies, supabaseAuthFetch } from "@/lib/supabase/server";

export async function POST() {
  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) {
    await supabaseAuthFetch("/logout", { method: "POST" }, accessToken).catch(() => null);
  }

  const response = NextResponse.json({ message: "Signed out." });
  clearAuthCookies(response);
  return response;
}

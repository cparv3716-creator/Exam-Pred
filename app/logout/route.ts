import { NextResponse } from "next/server";
import { clearAuthCookies, getAccessTokenFromCookies, supabaseAuthFetch } from "@/lib/supabase/server";

async function signOut(request: Request) {
  const accessToken = await getAccessTokenFromCookies();

  if (accessToken) {
    await supabaseAuthFetch("/logout", { method: "POST" }, accessToken).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookies(response);
  return response;
}

export function GET(request: Request) {
  return signOut(request);
}

export function POST(request: Request) {
  return signOut(request);
}

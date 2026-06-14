import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Run on every navigation so session cookies are refreshed app-wide
   * (homepage, dashboard, refresh, payment pages). The negative lookahead
   * excludes Next internals, static assets AND all `/api` routes — which means
   * /api/payments/verify (and create-order) are never intercepted or blocked
   * by auth middleware; those routes enforce auth themselves via getUser().
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$).*)",
  ],
};

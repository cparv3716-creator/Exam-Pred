"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type NavLink = {
  label: string;
  href: string;
};

type AuthState = "loading" | "signed-in" | "signed-out";

export function AuroraHeaderNavigation({ links }: { links: NavLink[] }) {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;

    void (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setAuthState(data.user ? "signed-in" : "signed-out");
      } catch {
        if (mounted) setAuthState("signed-out");
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (mounted) setAuthState(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setAuthState("signed-out");

    try {
      await getSupabaseBrowserClient().auth.signOut();
    } finally {
      window.location.assign("/logout");
    }
  }

  const signedIn = authState === "signed-in";

  return (
    <>
      <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60"
            style={{ color: "var(--aurora-text-secondary)" }}
          >
            {link.label}
          </Link>
        ))}
        {authState !== "loading" && (
          signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60"
                style={{ color: "var(--aurora-text-secondary)" }}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60"
                style={{ color: "var(--aurora-text-secondary)" }}
              >
                Profile
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="aurora-focus-ring rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-white/60"
              style={{ color: "var(--aurora-text-secondary)" }}
            >
              Login
            </Link>
          )
        )}
      </nav>

      {authState === "loading" ? (
        <span
          aria-label="Checking login status"
          className="h-10 w-28 animate-pulse rounded-xl bg-white/50"
        />
      ) : signedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          className="aurora-button-secondary aurora-focus-ring px-5 text-sm"
        >
          Logout
          <LogOut size={15} aria-hidden />
        </button>
      ) : (
        <Link href="/signup" className="aurora-button-primary aurora-focus-ring px-5 text-sm">
          Sign up
          <ArrowRight size={15} aria-hidden />
        </Link>
      )}
    </>
  );
}

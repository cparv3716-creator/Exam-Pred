"use client";

import { Download, MoreVertical, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "statstrive-pwa-install-dismissed";
const QUIET_ROUTES = [
  "/auth",
  "/login",
  "/signup",
  "/logout",
  "/dashboard",
  "/payment",
  "/pricing",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
}

function shouldStayQuiet(pathname: string) {
  return QUIET_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    setVisible(false);
    setShowManualHelp(false);

    if (shouldStayQuiet(pathname)) {
      return;
    }

    setIsAndroid(/Android/i.test(navigator.userAgent));

    if (isStandalone() || window.localStorage.getItem(DISMISS_KEY) === "true") {
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 1800);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [pathname]);

  async function install() {
    if (!installEvent) {
      setShowManualHelp(true);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);

    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      setShowManualHelp(true);
    }
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Install Statstrive app"
      className="fixed inset-x-3 z-[60] mx-auto max-w-md rounded-2xl border border-blue-200/70 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl sm:left-6 sm:right-auto sm:mx-0"
      style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <img src="/icons/statstrive-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl border border-blue-100" />
        <div className="min-w-0">
          <p className="font-bold">Install Statstrive App</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">Add Statstrive to your home screen for quick, app-like access.</p>
        </div>
      </div>

      {showManualHelp && (
        <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-950">
          {isAndroid
            ? "On Android, open your browser menu, then choose Install app or Add to Home screen."
            : "Open your browser menu and choose Install app or Add to Home Screen if the install prompt is unavailable."}
        </p>
      )}

      <button
        type="button"
        onClick={install}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800"
      >
        {installEvent ? <Download size={16} /> : <MoreVertical size={16} />}
        {installEvent ? "Install app" : "Show install instructions"}
      </button>
    </aside>
  );
}
import type { Metadata, Viewport } from "next";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import "./globals.css";
import "katex/dist/katex.min.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0755b5",
};

export const metadata: Metadata = {
  title: {
    default: "Statstrive | AI Exam Intelligence Platform",
    template: "%s | Statstrive",
  },
  applicationName: "Statstrive",
  description:
    "Premium AI-powered exam intelligence for PYQ analysis, topic probability, trend-weighted mocks, and pattern-based preparation insights.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/statstrive-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/statstrive-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/statstrive-apple-touch.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Statstrive",
  },
  keywords: [
    "Statstrive",
    "exam intelligence",
    "PYQ analysis",
    "topic probability",
    "mock papers",
    "CAT",
    "JEE",
    "NEET",
    "GATE",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaInstallPrompt />
        <FloatingChatbot />
      </body>
    </html>
  );
}
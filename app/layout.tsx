import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: {
    default: "ExamIQ | AI Exam Intelligence Platform",
    template: "%s | ExamIQ",
  },
  description:
    "Premium AI-powered exam intelligence for PYQ analysis, topic probability, trend-weighted mocks, and pattern-based preparation insights.",
  keywords: [
    "ExamIQ",
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
      <body>{children}</body>
    </html>
  );
}

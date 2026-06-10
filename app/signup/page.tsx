import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an ExamIQ account to save attempts and bookmarks across devices.",
};

export default function SignupPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-20">
        <AuthForm mode="signup" />
      </section>
    </PageShell>
  );
}

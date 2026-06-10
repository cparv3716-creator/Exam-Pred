import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to ExamIQ to save your practice attempts, bookmarks and progress.",
};

export default function LoginPage() {
  return (
    <PageShell withGrid>
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-20">
        <AuthForm mode="login" />
      </section>
    </PageShell>
  );
}

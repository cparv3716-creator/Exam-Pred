import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="aurora-soft-bg overflow-x-clip">
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-md items-center px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 sm:min-h-[calc(100vh-12rem)] sm:py-16">
        <div
          className="aurora-glass aurora-fade-slide-up relative w-full overflow-hidden p-5 sm:p-8"
          style={{ borderRadius: "var(--aurora-radius-xl)", boxShadow: "var(--aurora-shadow-3), var(--aurora-shadow-glass)" }}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))" }}
          />
          <Link href="/" className="aurora-focus-ring relative grid h-11 w-11 place-items-center rounded-full">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff, var(--aurora-primary-bright) 55%, var(--aurora-primary) 100%)",
                boxShadow: "var(--aurora-glow-md)",
              }}
            />
            <span className="absolute inset-1 rounded-full border border-white/40" />
            <span className="relative text-sm font-black text-white">S</span>
          </Link>

          <h1 className="mt-5 text-2xl font-bold tracking-tight" style={{ color: "var(--aurora-text-primary)" }}>
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--aurora-text-secondary)" }}>
            {description}
          </p>

          <div className="mt-6">{children}</div>

          {footer ? (
            <div className="mt-6 border-t pt-5 text-sm" style={{ borderColor: "var(--aurora-border-soft)" }}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

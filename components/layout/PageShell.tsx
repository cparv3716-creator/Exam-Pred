import { Footer } from "@/components/layout/Footer";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  withGrid = false,
  className,
}: {
  children: React.ReactNode;
  withGrid?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-ink-950 text-slate-200", className)}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {withGrid && <div className="absolute inset-0 grid-bg opacity-70" />}
        <div className="absolute -left-44 top-16 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float-slow" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/8 blur-[120px] animate-float-slow" />
      </div>
      <PremiumNavbar />
      <main className="relative z-10 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

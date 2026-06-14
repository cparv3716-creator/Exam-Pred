export default function DashboardLoading() {
  return (
    <main
      className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
      style={{ background: "var(--aurora-background)" }}
      aria-label="Loading dashboard"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-7 w-56 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="h-48 rounded-3xl bg-white shadow-sm" />
          <div className="h-48 rounded-3xl bg-white shadow-sm" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="h-64 rounded-3xl bg-white shadow-sm" />
          <div className="h-64 rounded-3xl bg-white shadow-sm" />
          <div className="h-64 rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { listUserExamSubscriptions } from "@/lib/backend/admin-management";

export const metadata: Metadata = {
  title: "Admin Subscriptions | Statstrive",
  description: "Inspect Statstrive exam-scoped premium subscriptions.",
};

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listUserExamSubscriptions().catch(() => []);

  return (
    <AdminShell title="Subscriptions" subtitle="Exam-scoped active and historical premium subscriptions.">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Exam</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Valid until</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-t border-white/10">
                  <td className="py-3 pr-4 font-mono text-xs">{subscription.user_id}</td>
                  <td className="py-3 pr-4 font-bold text-white">{subscription.exam_id.toUpperCase()}</td>
                  <td className="py-3 pr-4">{subscription.plan_id}</td>
                  <td className="py-3 pr-4">{subscription.status}</td>
                  <td className="py-3 pr-4">{new Date(subscription.valid_until).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!subscriptions.length && <p className="py-8 text-sm text-slate-400">No subscription rows found.</p>}
        </div>
      </div>
    </AdminShell>
  );
}

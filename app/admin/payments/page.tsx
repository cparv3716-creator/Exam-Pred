import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { listPaymentOrders } from "@/lib/backend/admin-management";

export const metadata: Metadata = {
  title: "Admin Payment Orders | Statstrive",
  description: "Inspect Statstrive payment order records.",
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const orders = await listPaymentOrders().catch(() => []);

  return (
    <AdminShell title="Payment orders" subtitle="Read-only payment order view. Verification logic remains in the payment APIs.">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Exam</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/10">
                  <td className="py-3 pr-4 font-mono text-xs">{order.razorpay_order_id}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{order.user_id}</td>
                  <td className="py-3 pr-4 font-bold text-white">{order.exam_id.toUpperCase()}</td>
                  <td className="py-3 pr-4">{order.plan_id}</td>
                  <td className="py-3 pr-4">{order.currency} {order.amount}</td>
                  <td className="py-3 pr-4">{order.status}</td>
                  <td className="py-3 pr-4">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <p className="py-8 text-sm text-slate-400">No payment orders found.</p>}
        </div>
      </div>
    </AdminShell>
  );
}

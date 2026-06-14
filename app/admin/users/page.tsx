import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminAccessActions } from "@/components/admin/AdminAccessActions";
import { getAdminUserAccessSummaries, listAdminAuditLogs } from "@/lib/backend/admin-management";

export const metadata: Metadata = {
  title: "Admin Users | Statstrive",
  description: "Manage Statstrive user access, manual premium grants, and admin status.",
};

export const dynamic = "force-dynamic";

function isActive(status: string, validUntil?: string | null) {
  return status === "active" && (!validUntil || new Date(validUntil).getTime() > Date.now());
}

export default async function AdminUsersPage() {
  const [users, auditLogs] = await Promise.all([
    getAdminUserAccessSummaries(),
    listAdminAuditLogs(20).catch(() => []),
  ]);

  return (
    <AdminShell title="Users & access" subtitle="Server-side user, subscription, manual grant, and audit controls.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-cyan-400/20 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Users</p>
          <p className="mt-3 text-3xl font-black text-white">{users.length}</p>
          <p className="mt-1 text-sm text-slate-400">Profiles visible to admin service-role APIs.</p>
        </div>
        <div className="rounded-3xl border border-emerald-400/20 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Active grants</p>
          <p className="mt-3 text-3xl font-black text-white">
            {users.reduce((total, user) => total + user.manualGrants.filter((grant) => isActive(grant.status, grant.valid_until)).length, 0)}
          </p>
          <p className="mt-1 text-sm text-slate-400">Manual exam-scoped premium grants.</p>
        </div>
        <div className="rounded-3xl border border-violet-400/20 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Admins</p>
          <p className="mt-3 text-3xl font-black text-white">{users.filter((user) => user.adminUser?.is_active).length}</p>
          <p className="mt-1 text-sm text-slate-400">Active rows in admin_users.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {users.map(({ profile, adminUser, subscriptions, manualGrants }) => {
          const activeGrant = manualGrants.find((grant) => isActive(grant.status, grant.valid_until));
          const activeSubscriptions = subscriptions.filter((subscription) => isActive(subscription.status, subscription.valid_until));

          return (
            <section key={profile.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{profile.id}</p>
                  <h2 className="mt-2 text-lg font-bold text-white">{profile.full_name || profile.email || "Unnamed user"}</h2>
                  <p className="text-sm text-slate-400">{profile.email || "No email on profile"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {adminUser?.is_active && <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-bold text-rose-100">Admin</span>}
                  {activeSubscriptions.map((subscription) => (
                    <span key={subscription.id} className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-100">
                      {subscription.exam_id.toUpperCase()} subscription
                    </span>
                  ))}
                  {activeGrant && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">Manual grant</span>}
                  {!adminUser?.is_active && activeSubscriptions.length === 0 && !activeGrant && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">Free</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-300 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Subscriptions</p>
                  <div className="mt-3 space-y-2">
                    {subscriptions.length ? subscriptions.map((subscription) => (
                      <p key={subscription.id}>
                        <span className="font-bold text-white">{subscription.exam_id.toUpperCase()}</span> {subscription.plan_id} - {subscription.status} until {new Date(subscription.valid_until).toLocaleDateString()}
                      </p>
                    )) : <p>No subscription rows.</p>}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Manual grants</p>
                  <div className="mt-3 space-y-2">
                    {manualGrants.length ? manualGrants.map((grant) => (
                      <p key={grant.id}>
                        <span className="font-bold text-white">{grant.exam_id.toUpperCase()}</span> - {grant.status}{grant.valid_until ? ` until ${new Date(grant.valid_until).toLocaleDateString()}` : ""}
                      </p>
                    )) : <p>No manual grant rows.</p>}
                  </div>
                </div>
              </div>

              <AdminAccessActions targetUserId={profile.id} activeGrantId={activeGrant?.id ?? null} />
            </section>
          );
        })}
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-lg font-bold text-white">Recent admin audit log</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {auditLogs.length ? auditLogs.map((log) => (
            <p key={log.id} className="rounded-2xl bg-slate-950/70 p-3">
              <span className="font-bold text-white">{log.action}</span> on {log.target_user_id || "n/a"} at {new Date(log.created_at).toLocaleString()}
            </p>
          )) : <p>No audit logs yet.</p>}
        </div>
      </section>
    </AdminShell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Crown, RotateCcw } from "lucide-react";
import { EXAM_IDS, type ExamId } from "@/lib/payments/plans";

export function AdminAccessActions({
  targetUserId,
  activeGrantId,
  defaultExamId = "cat",
}: {
  targetUserId: string;
  activeGrantId?: string | null;
  defaultExamId?: ExamId;
}) {
  const router = useRouter();
  const [examId, setExamId] = useState<ExamId>(defaultExamId);
  const [reason, setReason] = useState("Manual premium grant");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function grant() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/manual-grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, examId, reason }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Grant failed.");
      }
      setMessage("Premium access granted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Grant failed.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!activeGrantId) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/manual-grants/${activeGrantId}/revoke`, { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Revoke failed.");
      }
      setMessage("Manual grant revoked.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Revoke failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor={`exam-${targetUserId}`}>
          Exam
        </label>
        <select
          id={`exam-${targetUserId}`}
          value={examId}
          onChange={(event) => setExamId(event.target.value as ExamId)}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          {EXAM_IDS.map((id) => (
            <option key={id} value={id}>{id.toUpperCase()}</option>
          ))}
        </select>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor={`reason-${targetUserId}`}>
          Reason
        </label>
        <input
          id={`reason-${targetUserId}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={grant}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Crown size={14} aria-hidden /> Grant premium
        </button>
        {activeGrantId && (
          <button
            type="button"
            onClick={revoke}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={14} aria-hidden /> Revoke grant
          </button>
        )}
      </div>
      {message && <p className="mt-2 text-xs text-slate-300">{message}</p>}
    </div>
  );
}

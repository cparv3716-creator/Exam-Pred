"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookmarkCheck, CheckCircle2, Loader2, Target, TrendingUp, XCircle } from "lucide-react";
import { useAuthUser } from "@/lib/backend/use-practice-progress";
import { getPracticeAttemptsByUser, getPracticeSummary } from "@/lib/backend/practice-attempts";
import { getUserBookmarks } from "@/lib/backend/bookmarks";
import {
  EMPTY_PRACTICE_SUMMARY,
  type PracticeAttempt,
  type PracticeSummary,
  type QuestionBookmark,
} from "@/types/backend";

function questionHref(source: string, questionId: string): string {
  if (source === "varc_source") return `/exams/cat/varc/source/practice/${questionId}`;
  return `/exams/cat/quant/latex-source/practice/${questionId}`;
}

export function ProgressDashboard() {
  const { user, loading, configured } = useAuthUser();
  const [summary, setSummary] = useState<PracticeSummary>(EMPTY_PRACTICE_SUMMARY);
  const [recent, setRecent] = useState<PracticeAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<QuestionBookmark[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return;
    setDataLoading(true);
    Promise.all([
      getPracticeSummary(user.id),
      getPracticeAttemptsByUser(user.id, { limit: 10 }),
      getUserBookmarks(user.id),
    ])
      .then(([s, r, b]) => {
        if (!active) return;
        setSummary(s);
        setRecent(r);
        setBookmarks(b);
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center sm:p-12">
        <Target size={30} className="mx-auto text-cyan-300" />
        <h2 className="mt-5 text-2xl font-semibold text-white">Track your CAT practice</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          {configured
            ? "Log in to save your attempts and bookmarks and see your accuracy, section breakdown and recent activity here."
            : "Progress tracking isn’t enabled in this environment yet. You can still practice freely — every question works without an account."}
        </p>
        {configured && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30">
              Create account
            </Link>
          </div>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/exams/cat/quant/latex-source" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Practice Quant →
          </Link>
          <Link href="/exams/cat/varc/source" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Practice VARC →
          </Link>
        </div>
      </div>
    );
  }

  const accuracyPct = Math.round(summary.accuracy * 100);

  return (
    <div className="space-y-8">
      {dataLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={13} className="animate-spin" /> Refreshing…
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Attempted" value={String(summary.totalAttempts)} icon={Target} />
        <Stat label="Correct" value={String(summary.correct)} icon={CheckCircle2} tone="emerald" />
        <Stat label="Accuracy" value={`${accuracyPct}%`} icon={TrendingUp} tone="cyan" />
        <Stat label="Bookmarks" value={String(bookmarks.length)} icon={BookmarkCheck} tone="purple" />
      </div>

      {/* By section */}
      <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">By section</h3>
        {summary.bySection.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No attempts yet. Start practicing to see your breakdown.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {summary.bySection.map((s) => (
              <div key={s.section} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{s.section}</span>
                  <span className="text-sm text-cyan-300">{Math.round(s.accuracy * 100)}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {s.correct} correct of {s.attempts} attempted
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent attempts */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Recent attempts</h3>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No attempts recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link
                    href={questionHref(a.question_source, a.question_id)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 transition-colors hover:border-white/20"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {a.is_correct ? (
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />
                      ) : (
                        <XCircle size={15} className="shrink-0 text-rose-300" />
                      )}
                      <span className="truncate text-sm text-slate-300">
                        {a.section} · {a.topic ?? a.question_id}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {new Date(a.attempted_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bookmarks */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Bookmarked questions</h3>
          {bookmarks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No bookmarks yet. Use the bookmark button on any question.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {bookmarks.slice(0, 12).map((b) => (
                <li key={b.id}>
                  <Link
                    href={questionHref(b.question_source, b.question_id)}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 transition-colors hover:border-white/20"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <BookmarkCheck size={15} className="shrink-0 text-cyan-300" />
                      <span className="truncate text-sm text-slate-300">
                        {b.section} · {b.question_id}
                      </span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-slate-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Practice links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/exams/cat/quant/latex-source" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-semibold text-white">
          Practice Quant <ArrowRight size={15} />
        </Link>
        <Link href="/exams/cat/varc/source" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30">
          Practice VARC <ArrowRight size={15} />
        </Link>
        <Link href="/account" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30">
          Account
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string;
  icon: typeof Target;
  tone?: "slate" | "cyan" | "emerald" | "purple";
}) {
  const tones = {
    slate: "text-slate-300 border-white/10 bg-white/[0.04]",
    cyan: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    emerald: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
    purple: "text-purple-300 border-purple-400/20 bg-purple-400/10",
  }[tone];
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${tones}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import { supabaseAdminRestFetch } from "@/lib/supabase/admin";

type PracticeAttemptPayload = {
  exam_slug?: string;
  question_id?: string;
  source_type?: string;
  selected_answer?: string;
  correct_answer?: string;
  is_correct?: boolean;
  time_spent_seconds?: number;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json().catch(() => ({}))) as PracticeAttemptPayload;

  if (!user) {
    return NextResponse.json({ error: "Login required to save practice attempts." }, { status: 401 });
  }

  if (!body.exam_slug || !body.question_id) {
    return NextResponse.json({ error: "exam_slug and question_id are required." }, { status: 400 });
  }

  try {
    const rows = await supabaseAdminRestFetch<Array<{ id: string }>>("practice_attempts", {
      method: "POST",
      body: JSON.stringify({
        user_id: user.id,
        exam_slug: body.exam_slug,
        question_id: body.question_id,
        source_type: body.source_type ?? "pyq",
        selected_answer: body.selected_answer ?? null,
        correct_answer: body.correct_answer ?? null,
        is_correct: body.is_correct ?? null,
        time_spent_seconds: body.time_spent_seconds ?? null,
      }),
    });

    return NextResponse.json({ attempt: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save practice attempt." },
      { status: 500 },
    );
  }
}

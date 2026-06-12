import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { MsqeQuestionViewer } from "@/components/isi/MsqeQuestionViewer";
import { getMsqeAllQuestions, getMsqeQuestionById } from "@/lib/content/isi/msqe";

export function generateStaticParams() {
  return getMsqeAllQuestions().map((question) => ({ questionId: question.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ questionId: string }> }): Promise<Metadata> {
  const { questionId } = await params;
  const question = getMsqeQuestionById(questionId);
  return question ? { title: `${question.paper} ${question.questionNumber} | ISI MSQE` } : { title: "MSQE question not found" };
}

export default async function MsqeQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const question = getMsqeQuestionById(questionId);
  if (!question) notFound();
  return <IsiPageShell><MsqeQuestionViewer question={question} /></IsiPageShell>;
}

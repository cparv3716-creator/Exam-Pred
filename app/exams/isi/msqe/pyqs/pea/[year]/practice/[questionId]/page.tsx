import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IsiPageShell } from "@/components/isi/IsiPageShell";
import { IsiPyqQuestionViewer } from "@/components/isi/IsiPyqQuestionViewer";
import { getIsiMsqePeaPyqYears, getIsiMsqePyqQuestionById, getIsiMsqePyqQuestions } from "@/lib/content/isi/pyqPractice";

export function generateStaticParams() {
  return getIsiMsqePeaPyqYears().flatMap((year) => getIsiMsqePyqQuestions("PEA", year).map((question) => ({ year: String(year), questionId: question.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string; questionId: string }> }): Promise<Metadata> {
  const { questionId } = await params;
  const question = getIsiMsqePyqQuestionById(questionId);
  return question ? { title: `PEA ${question.year} Q${question.questionNumber} | ISI MSQE` } : { title: "MSQE PYQ question not found" };
}

export default async function IsiMsqePeaQuestionPage({ params }: { params: Promise<{ year: string; questionId: string }> }) {
  const { year: yearParam, questionId } = await params;
  const year = Number(yearParam);
  const questions = getIsiMsqePyqQuestions("PEA", year);
  const question = questions.find((item) => item.id === questionId);
  if (!question) notFound();
  const index = questions.findIndex((item) => item.id === question.id);
  const previous = index > 0 ? questions[index - 1] : null;
  const next = index < questions.length - 1 ? questions[index + 1] : null;
  return <IsiPageShell><IsiPyqQuestionViewer question={question} previous={previous ? { id: previous.id, label: `Question ${previous.questionNumber}`, href: `/exams/isi/msqe/pyqs/pea/${year}/practice/${previous.id}` } : null} next={next ? { id: next.id, label: `Question ${next.questionNumber}`, href: `/exams/isi/msqe/pyqs/pea/${year}/practice/${next.id}` } : null} /></IsiPageShell>;
}

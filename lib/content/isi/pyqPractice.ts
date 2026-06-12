import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { IsiMsqePyqPracticeSet, IsiMsqePyqQuestion, MsqePaper } from "@/types/isi";

const manifestPath = path.join(process.cwd(), "content", "isi", "msqe", "pyqs", "practice_manifest.json");
const publicRoot = path.join(process.cwd(), "public");
const contentRoot = process.cwd();

export function getIsiMsqePyqPracticeManifest(): IsiMsqePyqPracticeSet[] {
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "")) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isPracticeSet) : [];
  } catch {
    return [];
  }
}

export function getIsiMsqePyqPracticeSets(): IsiMsqePyqPracticeSet[] {
  return getIsiMsqePyqPracticeManifest()
    .map((set) => ({
      ...set,
      questionPdfPath: set.questionPdfPath && publicAssetExists(set.questionPdfPath) ? set.questionPdfPath : null,
      questionTexPath: set.questionTexPath && publicAssetExists(set.questionTexPath) ? set.questionTexPath : null,
    }))
    .sort((a, b) => b.year - a.year || a.paper.localeCompare(b.paper));
}

export function getIsiMsqePyqPracticeSet(paper: MsqePaper, year: number): IsiMsqePyqPracticeSet | null {
  return getIsiMsqePyqPracticeSets().find((set) => set.paper === paper && set.year === year) ?? null;
}

export function getIsiMsqePyqQuestions(paper: MsqePaper, year: number): IsiMsqePyqQuestion[] {
  const set = getIsiMsqePyqPracticeManifest().find((item) => item.paper === paper && item.year === year);
  if (!set) return [];
  const filePath = path.join(contentRoot, set.questionsPath);
  if (!filePath.startsWith(contentRoot) || !fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isPyqQuestion).sort((a, b) => a.questionNumber - b.questionNumber) : [];
  } catch {
    return [];
  }
}

export function getIsiMsqePyqQuestionById(questionId: string): IsiMsqePyqQuestion | null {
  for (const set of getIsiMsqePyqPracticeManifest()) {
    const question = getIsiMsqePyqQuestions(set.paper, set.year).find((item) => item.id === questionId);
    if (question) return question;
  }
  return null;
}

export function getIsiMsqePeaPyqYears(): number[] {
  return getIsiMsqePyqPracticeSets().filter((set) => set.paper === "PEA").map((set) => set.year).sort((a, b) => b - a);
}

function publicAssetExists(resourcePath: string): boolean {
  const normalized = resourcePath.replace(/^\/+/, "");
  const filePath = path.join(publicRoot, normalized);
  return filePath.startsWith(publicRoot) && fs.existsSync(filePath);
}

function isPracticeSet(value: unknown): value is IsiMsqePyqPracticeSet {
  if (!value || typeof value !== "object") return false;
  const set = value as Partial<IsiMsqePyqPracticeSet>;
  return set.exam === "ISI" && set.program === "MSQE" && (set.paper === "PEA" || set.paper === "PEB") && typeof set.year === "number" && typeof set.title === "string" && typeof set.questionsPath === "string";
}

function isPyqQuestion(value: unknown): value is IsiMsqePyqQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as Partial<IsiMsqePyqQuestion>;
  return question.exam === "ISI" && question.program === "MSQE" && (question.paper === "PEA" || question.paper === "PEB") && typeof question.id === "string" && typeof question.year === "number" && typeof question.questionNumber === "number" && typeof question.questionText === "string" && Array.isArray(question.options);
}

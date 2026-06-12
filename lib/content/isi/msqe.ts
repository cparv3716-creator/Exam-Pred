import "server-only";

import fs from "node:fs";
import path from "node:path";
import type {
  IsiQuestion,
  MsqeInferenceModule,
  MsqeManifest,
  MsqeOverview,
  MsqePracticeSet,
  MsqeTopicStat,
} from "@/types/isi";

const msqeRoot = path.join(process.cwd(), "content", "isi", "msqe");
const manifestPath = path.join(msqeRoot, "manifest.json");
const sampleQuestionPath = path.join(msqeRoot, "question_bank", "sample_msqe_questions.json");

export function getMsqeManifest(): MsqeManifest {
  const manifest = readJson<MsqeManifest>(manifestPath);
  if (manifest) return manifest;

  return {
    exam: "ISI",
    program: "MSQE",
    status: "manifest_missing",
    version: "0",
    websiteSourcePolicy: "Structured source not uploaded yet.",
    activeQuestionFile: "",
    sourceInventory: {
      structuredFilesFound: 0,
      reportedExternalPeaCount: null,
      reportedExternalPebCount: null,
      note: "Manifest not uploaded yet.",
    },
    modules: [],
  };
}

export function getMsqeOverview(): MsqeOverview {
  const questions = getMsqeAllQuestions();
  return {
    sampleQuestionCount: questions.length,
    peaCount: questions.filter((question) => question.paper === "PEA").length,
    pebCount: questions.filter((question) => question.paper === "PEB").length,
    topicCount: new Set(questions.map((question) => question.topic)).size,
    needsReviewCount: questions.filter((question) => question.needsReview).length,
    sourceMode: questions.some((question) => question.source === "sample_dev") ? "sample_dev" : "structured_local",
  };
}

export function getMsqePeaQuestions(): IsiQuestion[] {
  return getMsqeAllQuestions().filter((question) => question.paper === "PEA");
}

export function getMsqePebQuestions(): IsiQuestion[] {
  return getMsqeAllQuestions().filter((question) => question.paper === "PEB");
}

export function getMsqeAllQuestions(): IsiQuestion[] {
  const questions = readJson<unknown[]>(sampleQuestionPath);
  if (!Array.isArray(questions)) return [];
  return questions.filter(isIsiQuestion);
}

export function getMsqeQuestionById(questionId: string): IsiQuestion | null {
  return getMsqeAllQuestions().find((question) => question.id === questionId) ?? null;
}

export function getMsqeInferenceSummary(): MsqeInferenceModule[] {
  return [
    { id: "topic-frequency", title: "Topic frequency", description: "Structured topic incidence across PEA and PEB once verified banks are uploaded.", status: "report_module_ready" },
    { id: "deep-concepts", title: "Deep concept classification", description: "Concept and prerequisite hierarchy aligned to the MSQE taxonomy boundary.", status: "report_module_ready" },
    { id: "archetypes", title: "Repeated archetypes", description: "Recurring solution structures and question templates across papers.", status: "report_module_ready" },
    { id: "traps", title: "Trap analysis", description: "Distractor and reasoning-failure patterns, especially for objective PEA items.", status: "report_module_ready" },
    { id: "difficulty", title: "Difficulty shifts", description: "Paper-wise movement in depth, computation, and conceptual load.", status: "report_module_ready" },
    { id: "comparison", title: "PEA / PEB comparison", description: "Objective recognition versus descriptive construction and proof-quality demands.", status: "report_module_ready" },
  ];
}

export function getMsqeTopicStats(): MsqeTopicStat[] {
  const grouped = new Map<string, MsqeTopicStat>();
  for (const question of getMsqeAllQuestions()) {
    const current = grouped.get(question.topic) ?? { topic: question.topic, count: 0, peaCount: 0, pebCount: 0 };
    current.count += 1;
    if (question.paper === "PEA") current.peaCount += 1;
    if (question.paper === "PEB") current.pebCount += 1;
    grouped.set(question.topic, current);
  }
  return Array.from(grouped.values()).sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}

export function getMsqePracticeSets(): MsqePracticeSet[] {
  const pea = getMsqePeaQuestions().map((question) => question.id);
  const peb = getMsqePebQuestions().map((question) => question.id);
  return [
    {
      id: "msqe-sample-pea",
      title: "PEA objective sampler",
      description: "Development-only objective questions used to verify MCQ rendering and metadata flow.",
      paper: "PEA",
      questionIds: pea,
      status: "sample_dev",
    },
    {
      id: "msqe-sample-peb",
      title: "PEB descriptive sampler",
      description: "Development-only descriptive questions used to verify long-form solution rendering.",
      paper: "PEB",
      questionIds: peb,
      status: "sample_dev",
    },
  ];
}

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function isIsiQuestion(value: unknown): value is IsiQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as Partial<IsiQuestion>;
  return Boolean(
    question.id &&
    question.exam === "ISI" &&
    question.program === "MSQE" &&
    (question.paper === "PEA" || question.paper === "PEB") &&
    question.questionText &&
    question.topic &&
    Array.isArray(question.options) &&
    Array.isArray(question.tags),
  );
}

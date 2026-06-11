import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { DilrAnswerKey, DilrQuestion, DilrSetContent, DilrSetMetadata } from "@/types/dilr";

const acceptedRoot = path.join(process.cwd(), "content/cat/dilr/_accepted");

export function getAllDilrSets(): DilrSetMetadata[] {
  if (!fs.existsSync(acceptedRoot)) return [];
  return fs.readdirSync(acceptedRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readMetadata(path.join(acceptedRoot, entry.name)))
    .filter((metadata): metadata is DilrSetMetadata => Boolean(metadata))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getDilrSetById(setId: string): DilrSetContent | null {
  const safeSetId = path.basename(setId);
  const setDir = path.join(acceptedRoot, safeSetId);
  if (!setDir.startsWith(acceptedRoot) || !fs.existsSync(setDir)) return null;

  const metadata = readMetadata(setDir);
  if (!metadata) return null;

  const setMarkdown = readText(path.join(setDir, "set.md"));
  const solutionMarkdown = readText(path.join(setDir, "solution.md"));
  const answerKey = readAnswerKey(path.join(setDir, "answer_key.json"), metadata.set_id);
  const { passageMarkdown, questions } = splitSetMarkdown(setMarkdown, answerKey);

  return {
    metadata,
    setMarkdown,
    passageMarkdown,
    questions,
    solutionMarkdown,
    answerKey,
    assets: findAssets(setDir, metadata.set_id),
  };
}

function readMetadata(setDir: string): DilrSetMetadata | null {
  const parsed = readJson(path.join(setDir, "metadata.json"));
  if (!parsed || typeof parsed !== "object") return null;
  const value = parsed as Partial<DilrSetMetadata>;
  if (!value.set_id || !value.title) return null;
  return {
    set_id: String(value.set_id),
    title: String(value.title),
    exam: String(value.exam ?? "CAT"),
    section: String(value.section ?? "DILR"),
    surface_family: String(value.surface_family ?? "Unmapped"),
    engine_archetype: String(value.engine_archetype ?? "Unmapped"),
    engine_hybrid_of: Array.isArray(value.engine_hybrid_of) ? value.engine_hybrid_of.map(String) : [],
    difficulty_label: String(value.difficulty_label ?? "Unmapped"),
    quality_level: Number(value.quality_level ?? 0),
    website_ready: String(value.website_ready ?? "draft"),
    question_count: Number(value.question_count ?? 0),
    estimated_time_min: Number(value.estimated_time_min ?? 0),
    has_tita: Boolean(value.has_tita),
    has_mcq: Boolean(value.has_mcq),
    has_determinacy_question: Boolean(value.has_determinacy_question),
    source: String(value.source ?? "local_content"),
    status: String(value.status ?? "draft"),
  };
}

function readAnswerKey(filePath: string, setId: string): DilrAnswerKey {
  const parsed = readJson(filePath);
  if (!parsed || typeof parsed !== "object") return { set_id: setId, answers: [] };
  const value = parsed as Partial<DilrAnswerKey>;
  return {
    set_id: String(value.set_id ?? setId),
    answers: Array.isArray(value.answers)
      ? value.answers.map((answer) => ({
          question_id: String(answer.question_id ?? ""),
          type: String(answer.type ?? ""),
          answer: String(answer.answer ?? ""),
        })).filter((answer) => answer.question_id)
      : [],
  };
}

function splitSetMarkdown(markdown: string, answerKey: DilrAnswerKey): { passageMarkdown: string; questions: DilrQuestion[] } {
  const questionHeading = /^###\s+(Q\d+)\s*(?:\(([^)]+)\))?\s*$/gim;
  const matches = Array.from(markdown.matchAll(questionHeading));
  if (!matches.length) return { passageMarkdown: markdown, questions: [] };

  const firstQuestionStart = matches[0].index ?? 0;
  const passageMarkdown = markdown.slice(0, firstQuestionStart).trim();
  const questions = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const id = match[1];
    const fromHeading = match[2]?.trim();
    const fromAnswer = answerKey.answers.find((answer) => answer.question_id === id)?.type;
    return {
      id,
      type: fromHeading || fromAnswer || "unmapped",
      markdown: markdown.slice(start, end).trim(),
    };
  });
  return { passageMarkdown, questions };
}

function findAssets(setDir: string, setId: string) {
  const pdf = "CAT_DILR_Shuttle_OD_Fare_Capacity.pdf";
  const tex = "CAT_DILR_Shuttle_OD_Fare_Capacity.tex";
  return {
    pdf: fs.existsSync(path.join(setDir, pdf)) ? `/content/cat/dilr/_accepted/${setId}/${pdf}` : undefined,
    tex: fs.existsSync(path.join(setDir, tex)) ? `/content/cat/dilr/_accepted/${setId}/${tex}` : undefined,
  };
}

function readJson(filePath: string): unknown | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readText(filePath: string) {
  if (!fs.existsSync(filePath)) return "";
  try {
    return fs.readFileSync(filePath, "utf8").trim();
  } catch {
    return "";
  }
}
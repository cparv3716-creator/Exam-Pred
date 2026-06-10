import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion } from "../types/practice";
import { normalizeMathText } from "../lib/content/practice/solution-formatting";

const questionId = process.argv[2];
const dataPath = path.join(process.cwd(), "content/cat/practice/generated/cat_quant_generated_practice.json");

if (!questionId) {
  console.error("Usage: npm run debug:cat-quant-completeness-row -- <question_id>");
  process.exit(1);
}

if (!fs.existsSync(dataPath)) {
  console.error("Generated practice JSON not found.");
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(dataPath, "utf8")) as GeneratedPracticeQuestion[];
const question = questions.find((item) => item.question_id === questionId);

if (!question) {
  console.error(`Question not found: ${questionId}`);
  process.exit(1);
}

const visible = !["likely_incomplete", "source_not_found", "hide_until_repaired", "needs_manual_review"].includes(question.completeness_status ?? "complete");

console.log(`Question ID: ${question.question_id}`);
console.log(`Completeness: ${question.completeness_status ?? "complete"}`);
console.log(`Issue types: ${(question.completeness_issue_types ?? []).join("; ") || "none"}`);
console.log(`Repair source: ${question.repair_source ?? "none"}`);
console.log(`Repair confidence: ${question.repair_confidence ?? "none"}`);
console.log(`Student visible: ${visible ? "yes" : "no"}`);
console.log(`Source reference: ${question.source_reference || "none"}`);

console.log("\n--- raw question ---\n");
console.log(question.question_text);

console.log("\n--- repaired question ---\n");
console.log(question.question_text_repaired ?? "");

console.log("\n--- markdown question ---\n");
console.log(question.question_text_markdown ?? "");

console.log("\n--- solution variables/equations detected ---\n");
console.log(detectSolutionRelations(question.detailed_solution).join("\n") || "none");

console.log("\n--- source match ---\n");
console.log(question.repair_source ? `found: ${question.repair_source}` : "not recorded");

function detectSolutionRelations(solution: string) {
  const text = normalizeMathText(solution);
  const patterns = [
    /[a-z]{1,2}\s*[+\-*/]\s*[a-z0-9]{1,4}\s*=\s*[^,.]+/gi,
    /[a-z]{1,2}\s*=\s*[-]?\d+(?:\/\d+)?/gi,
    /log[_a-z{}]*\s+[a-z]/gi,
    /[a-z]{1,3}\s*[<>]=?\s*[-]?\d+/gi,
  ];
  const results = new Set<string>();
  for (const pattern of patterns) {
    for (const match of text.match(pattern) ?? []) results.add(match.trim());
  }
  return Array.from(results).slice(0, 20);
}

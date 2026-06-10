import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion } from "../types/practice";
import { findMathResidue } from "../lib/content/practice/solution-formatting";

const questionId = process.argv[2];
const sourcePath = path.join(process.cwd(), "content/cat/practice/generated/cat_quant_generated_practice.json");

if (!questionId) {
  console.error("Usage: npm run debug:cat-quant-render-row -- <question_id>");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error("Generated practice JSON not found.");
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as GeneratedPracticeQuestion[];
const question = questions.find((item) => item.question_id === questionId);

if (!question) {
  console.error(`Question not found: ${questionId}`);
  process.exit(1);
}

console.log(`Question ID: ${question.question_id}`);
console.log(`Status: ${question.content_status ?? "unset"} / ${question.math_review_status ?? "unset"}`);
console.log("\n--- raw question_text ---\n");
console.log(question.question_text);
console.log("\n--- question_text_display ---\n");
console.log(question.question_text_display ?? "");
console.log("\n--- question_text_markdown ---\n");
console.log(question.question_text_markdown ?? "");
console.log("\n--- option markdown ---\n");
console.log(`A: ${question.option_a_markdown ?? question.option_a}`);
console.log(`B: ${question.option_b_markdown ?? question.option_b}`);
console.log(`C: ${question.option_c_markdown ?? question.option_c}`);
console.log(`D: ${question.option_d_markdown ?? question.option_d}`);
console.log("\n--- detailed_solution_markdown ---\n");
console.log(question.detailed_solution_markdown ?? "");
console.log("\n--- cleanup notes ---\n");
console.log((question.math_cleanup_notes ?? []).join("; ") || "none");
console.log("\n--- markdown residue check ---\n");
const residue = [
  ["question", question.question_text_markdown],
  ["solution", question.detailed_solution_markdown],
  ["answer", question.correct_answer_markdown],
  ["option_a", question.option_a_markdown],
  ["option_b", question.option_b_markdown],
  ["option_c", question.option_c_markdown],
  ["option_d", question.option_d_markdown],
].flatMap(([field, value]) => findMathResidue(String(value ?? "")).map((note) => `${field}: ${note}`));
console.log(residue.length ? residue.join("\n") : "none — renders clean");
const block = /\$\$[\s\S]*?\$\$/.test(question.question_text_markdown ?? "");
console.log(`\nQuestion contains block equation ($$…$$): ${block ? "yes" : "no"}`);

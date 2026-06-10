import fs from "node:fs";
import path from "node:path";
import type { GeneratedPracticeQuestion } from "../types/practice";

const jsonRelative = "content/cat/practice/generated/cat_quant_generated_practice.json";
const reportRelative = "reports/local_imports/CAT_QUANT_VISIBILITY_GATE_REPORT.md";
const jsonPath = path.join(process.cwd(), jsonRelative);
const reportPath = path.join(process.cwd(), reportRelative);

if (!fs.existsSync(jsonPath)) {
  console.error(`Practice JSON not found: ${jsonRelative}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const questions = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as GeneratedPracticeQuestion[];
let visible = 0;
let hidden = 0;

for (const question of questions) {
  const latexClean = question.display_source === "latex_source" && question.latex_match_confidence === "high";
  const completenessBlocked =
    question.completeness_status === "likely_incomplete" ||
    question.completeness_status === "source_not_found" ||
    question.completeness_status === "hide_until_repaired" ||
    question.completeness_status === "needs_manual_review";
  const contentBlocked =
    question.content_status === "hide_from_student" ||
    question.content_status === "incomplete_question" ||
    question.content_status === "broken_options" ||
    question.content_status === "needs_math_review";

  if (latexClean) {
    question.student_visible = true;
    question.completeness_status = "repaired_from_latex_source";
    question.content_status = "safe_display";
    question.math_review_status = "latex_source_clean";
  } else {
    question.student_visible = !(completenessBlocked || contentBlocked);
  }

  if (question.student_visible) visible += 1;
  else hidden += 1;
}

fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), "utf8");
fs.writeFileSync(reportPath, `# CAT Quant Visibility Gate Report

Generated: ${new Date().toISOString()}

| Metric | Count |
| --- | ---: |
| Total rows | ${questions.length} |
| Student visible | ${visible} |
| Hidden/review | ${hidden} |
| LaTeX clean visible | ${questions.filter((q) => q.display_source === "latex_source" && q.latex_match_confidence === "high").length} |
`, "utf8");

console.log(`Student visible: ${visible}`);
console.log(`Hidden/review: ${hidden}`);
console.log(`Report: ${reportRelative}`);

import fs from "node:fs";
import path from "node:path";

const BANK_PATH = path.join(process.cwd(), "content/cat/practice/generated/cat_varc_source_practice.json");

const target = process.argv[2];

if (!fs.existsSync(BANK_PATH)) {
  console.error("Bank file not found. Run: npm run build:cat-varc-source-bank");
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(BANK_PATH, "utf8")) as Record<string, unknown>[];

if (!target) {
  // List first 20
  console.log(`Bank: ${rows.length} rows`);
  console.log("Usage: tsx scripts/debug-cat-varc-source-row.ts <question_id | set_number | varc_type>");
  console.log("\nFirst 20 question IDs:");
  rows.slice(0, 20).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r["question_id"]}  [${r["varc_type"]}] [${r["parse_status"]}] visible=${r["student_visible"]}`);
  });
  process.exit(0);
}

// Find rows matching the target
let matched = rows.filter((r) =>
  r["question_id"] === target ||
  String(r["source_set_number"]) === target ||
  String(r["varc_type"]).toLowerCase() === target.toLowerCase() ||
  String(r["source_file"]).toLowerCase().includes(target.toLowerCase()),
);

if (!matched.length) {
  console.error(`No rows match: ${target}`);
  process.exit(1);
}

// If too many, print summary
if (matched.length > 5 && !rows.some((r) => r["question_id"] === target)) {
  console.log(`${matched.length} rows match "${target}". Showing first 5:\n`);
  matched = matched.slice(0, 5);
}

for (const row of matched) {
  console.log("─".repeat(72));
  console.log(`question_id      : ${row["question_id"]}`);
  console.log(`source_file      : ${row["source_file"]}`);
  console.log(`set / q number   : S${row["source_set_number"]} / Q${row["source_question_number"]}`);
  console.log(`varc_type        : ${row["varc_type"]}`);
  console.log(`parse_status     : ${row["parse_status"]}`);
  console.log(`student_visible  : ${row["student_visible"]}`);
  console.log(`difficulty       : ${row["difficulty"] || "(not set)"}`);
  console.log(`practice_level   : ${row["practice_level"]}`);
  console.log(`parse_warnings   : ${(row["parse_warnings"] as string[]).join("; ") || "none"}`);

  const passagePreview = String(row["passage_text_markdown"] ?? "").slice(0, 300).replace(/\n/g, " ").trim();
  if (passagePreview) {
    console.log(`\nPassage preview  :\n  ${passagePreview}${passagePreview.length === 300 ? "…" : ""}`);
  }

  const question = String(row["question_text_markdown"] ?? "").trim();
  console.log(`\nQuestion         :\n${question || "(empty)"}`);

  for (const [label, key] of [["A", "option_a_markdown"], ["B", "option_b_markdown"], ["C", "option_c_markdown"], ["D", "option_d_markdown"], ["E", "option_e_markdown"]] as const) {
    const opt = String(row[key] ?? "").trim();
    if (opt) console.log(`Option ${label}         : ${opt.slice(0, 120)}${opt.length > 120 ? "…" : ""}`);
  }

  const answer = String(row["correct_answer"] ?? "").trim();
  console.log(`\nAnswer           : ${answer || "(missing)"}`);

  const sol = String(row["detailed_solution_markdown"] ?? "").slice(0, 400).trim();
  if (sol) console.log(`\nSolution preview : ${sol.slice(0, 400).replace(/\n/g, " ")}${sol.length === 400 ? "…" : ""}`);

  console.log("");
}

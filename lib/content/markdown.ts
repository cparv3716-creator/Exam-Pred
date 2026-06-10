import fs from "node:fs";
import path from "node:path";
import type { MarkdownDocument } from "@/types/content";

export function readMarkdownDocument(relativePath: string): MarkdownDocument {
  const absolutePath = path.join(process.cwd(), relativePath);
  const exists = fs.existsSync(absolutePath);
  const body = exists ? fs.readFileSync(absolutePath, "utf8") : "";
  const title = extractMarkdownTitle(body) ?? path.basename(relativePath, path.extname(relativePath));
  const excerpt = extractMarkdownExcerpt(body);

  return {
    title,
    body,
    excerpt,
    relativePath,
    exists,
  };
}

export function extractMarkdownTitle(markdown: string) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

export function extractMarkdownExcerpt(markdown: string) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("-") && !line.startsWith("**Disclaimer"));

  return lines[0] ?? "";
}

export function extractBulletValue(markdown: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^-\\s+${escaped}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? null;
}

export function extractBoldRiskNote(markdown: string, prefix: string) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\*\\*(${escaped}[^*]+)\\*\\*`, "i"));
  return match?.[1]?.trim() ?? "";
}

export function parseMarkdownTable(markdown: string, heading: string) {
  const headingIndex = markdown.search(new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im"));
  if (headingIndex < 0) return [];

  const section = markdown.slice(headingIndex).split(/\n##\s+/)[0];
  const tableLines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (tableLines.length < 3) return [];

  const headers = splitMarkdownTableRow(tableLines[0]);
  return tableLines.slice(2).map((line) => {
    const cells = splitMarkdownTableRow(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });
}

function splitMarkdownTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

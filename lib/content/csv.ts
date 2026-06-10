import fs from "node:fs";
import path from "node:path";
import type { CsvRow } from "../../types/content";

export function readCsvRows(relativePath: string): CsvRow[] {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  const text = fs.readFileSync(absolutePath, "utf8").replace(/^\uFEFF/, "");
  return parseCsv(text);
}

export function parseCsv(text: string): CsvRow[] {
  const rows = parseCsvMatrix(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) =>
    headers.reduce<CsvRow>((record, header, index) => {
      record[header] = row[index] ?? "";
      return record;
    }, {}),
  );
}

function parseCsvMatrix(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

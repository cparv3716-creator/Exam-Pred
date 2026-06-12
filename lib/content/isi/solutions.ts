import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { IsiMsqeSolutionResource, MsqePaper } from "@/types/isi";

const manifestPath = path.join(process.cwd(), "content", "isi", "msqe", "solutions", "manifest.json");
const publicRoot = path.join(process.cwd(), "public");

export function getIsiMsqeSolutionManifest(): IsiMsqeSolutionResource[] {
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "")) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isSolutionResource) : [];
  } catch {
    return [];
  }
}

export function getIsiMsqeSolutions(): IsiMsqeSolutionResource[] {
  return getIsiMsqeSolutionManifest()
    .map((resource) => ({
      ...resource,
      pdfPath: resource.pdfPath && publicAssetExists(resource.pdfPath) ? resource.pdfPath : null,
      texPath: resource.texPath && publicAssetExists(resource.texPath) ? resource.texPath : null,
    }))
    .filter((resource) => Boolean(resource.pdfPath || resource.texPath))
    .sort((a, b) => b.year - a.year || a.paper.localeCompare(b.paper));
}

export function getIsiMsqeSolutionsByPaper(paper: MsqePaper): IsiMsqeSolutionResource[] {
  return getIsiMsqeSolutions().filter((resource) => resource.paper === paper);
}

export function getIsiMsqeSolutionByYearAndPaper(year: number, paper: MsqePaper): IsiMsqeSolutionResource | null {
  return getIsiMsqeSolutions().find((resource) => resource.year === year && resource.paper === paper) ?? null;
}

function publicAssetExists(resourcePath: string): boolean {
  const normalized = resourcePath.replace(/^\/+/, "");
  const filePath = path.join(publicRoot, normalized);
  return filePath.startsWith(publicRoot) && fs.existsSync(filePath);
}

function isSolutionResource(value: unknown): value is IsiMsqeSolutionResource {
  if (!value || typeof value !== "object") return false;
  const resource = value as Partial<IsiMsqeSolutionResource>;
  return resource.exam === "ISI" && resource.program === "MSQE" &&
    (resource.paper === "PEA" || resource.paper === "PEB") &&
    typeof resource.year === "number" && typeof resource.title === "string" &&
    typeof resource.status === "string";
}

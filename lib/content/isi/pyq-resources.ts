import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { IsiMsqePyqResource, MsqePaper } from "@/types/isi";

const manifestPath = path.join(process.cwd(), "content", "isi", "msqe", "pyqs", "resource_manifest.json");
const publicRoot = path.join(process.cwd(), "public");

export function getIsiMsqePyqResourceManifest(): IsiMsqePyqResource[] {
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "")) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isPyqResource) : [];
  } catch {
    return [];
  }
}

export function getIsiMsqePyqResources(): IsiMsqePyqResource[] {
  return getIsiMsqePyqResourceManifest()
    .map((resource) => ({
      ...resource,
      pdfPath: resource.pdfPath && publicAssetExists(resource.pdfPath) ? resource.pdfPath : null,
      textPath: resource.textPath && publicAssetExists(resource.textPath) ? resource.textPath : null,
      texPath: resource.texPath && publicAssetExists(resource.texPath) ? resource.texPath : null,
    }))
    .filter((resource) => Boolean(resource.pdfPath || resource.textPath || resource.texPath))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.paper.localeCompare(b.paper));
}

export function getIsiMsqePyqResourcesByPaper(paper: MsqePaper): IsiMsqePyqResource[] {
  return getIsiMsqePyqResources().filter((resource) => resource.paper === paper);
}

function publicAssetExists(resourcePath: string): boolean {
  const normalized = resourcePath.replace(/^\/+/, "");
  const filePath = path.join(publicRoot, normalized);
  return filePath.startsWith(publicRoot) && fs.existsSync(filePath);
}

function isPyqResource(value: unknown): value is IsiMsqePyqResource {
  if (!value || typeof value !== "object") return false;
  const resource = value as Partial<IsiMsqePyqResource>;
  return resource.exam === "ISI" && resource.program === "MSQE" &&
    (resource.paper === "PEA" || resource.paper === "PEB") &&
    typeof resource.title === "string" && typeof resource.resourceType === "string" &&
    typeof resource.sourceFile === "string";
}

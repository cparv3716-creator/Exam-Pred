import { exams } from "../../../data/exams";
import type { ReportManifestInput, ReportValidationResult, ValidationIssue } from "./types";

const validExamSlugs = new Set(exams.map((exam) => exam.slug));
const validAccessTiers = new Set(["free", "premium"]);
const validStatuses = new Set(["draft", "review", "published", "unpublished"]);

export function validateReportManifest(input: ReportManifestInput): ReportValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const examSlug = text(input.exam_slug);
  const accessTier = text(input.access_tier) || "premium";
  const status = text(input.status) || "draft";

  for (const field of ["exam_slug", "title", "content_rights"]) {
    if (!text(input[field])) {
      errors.push({ field, message: `${field} is required.`, severity: "error" });
    }
  }

  if (!text(input.source_markdown_path) && !text(input.pdf_download_path)) {
    errors.push({
      field: "source",
      message: "At least one of source_markdown_path or pdf_download_path is required.",
      severity: "error",
    });
  }

  if (!validExamSlugs.has(examSlug)) {
    errors.push({ field: "exam_slug", message: `Unsupported exam_slug "${examSlug}".`, severity: "error" });
  }

  if (!validAccessTiers.has(accessTier)) {
    errors.push({ field: "access_tier", message: "access_tier must be free or premium.", severity: "error" });
  }

  if (!validStatuses.has(status)) {
    errors.push({ field: "status", message: "status must be draft, review, published, or unpublished.", severity: "error" });
  }

  if (status === "published" && !text(input.content_rights).toLowerCase().includes("licensed") && !text(input.content_rights).toLowerCase().includes("owned")) {
    warnings.push({
      field: "content_rights",
      message: "Published content should clearly state owned/licensed/legal permission.",
      severity: "warning",
    });
  }

  return {
    errors,
    warnings,
    clean: {
      exam_slug: examSlug,
      title: text(input.title),
      source_markdown_path: text(input.source_markdown_path),
      pdf_download_path: text(input.pdf_download_path),
      access_tier: validAccessTiers.has(accessTier) ? (accessTier as "free" | "premium") : "premium",
      status: validStatuses.has(status) ? (status as "draft" | "review" | "published" | "unpublished") : "draft",
      content_rights: text(input.content_rights),
    },
  };
}

function text(input: unknown) {
  if (input === null || input === undefined) return "";
  return String(input).trim();
}

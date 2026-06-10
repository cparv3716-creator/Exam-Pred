import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const legalDisclaimer =
  "This platform provides pattern-based preparation insights and practice material. It does not claim to provide leaked, official, or guaranteed exam questions.";

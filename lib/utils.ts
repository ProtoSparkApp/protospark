import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(error: any): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    return Object.values(error).flat().filter(Boolean).join(", ");
  }
  return "";
}


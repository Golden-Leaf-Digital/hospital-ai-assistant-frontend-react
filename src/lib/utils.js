import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind className merge helper
 * Combines clsx + tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
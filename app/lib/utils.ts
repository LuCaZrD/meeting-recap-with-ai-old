import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Kết hợp các class CSS với tailwind-merge để tránh xung đột
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

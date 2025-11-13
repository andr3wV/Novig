import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime12Hour(hour: number): string {
  const normalized = Math.max(0, Math.min(23, Math.floor(hour)))
  const h12 = ((normalized + 11) % 12) + 1
  const suffix = normalized >= 12 ? "pm" : "am"
  return `${h12}${suffix}`
}

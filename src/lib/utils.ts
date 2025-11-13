import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param hour24 - The hour in 24-hour format (0-23)
 * @returns Formatted time string (e.g., "4:00pm", "10:00am")
 */
export function formatTime12Hour(hour24: number): string {
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  const ampm = hour24 >= 12 ? "pm" : "am"
  return `${hour12}:00${ampm}`
}

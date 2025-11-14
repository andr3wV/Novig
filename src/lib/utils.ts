import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime12Hour(hour: number): string {
  const normalized = Math.max(0, Math.min(23, Math.floor(hour)))
  const h12 = ((normalized + 11) % 12) + 1
  return `${h12}${normalized >= 12 ? "pm" : "am"}`
}

export function calculateNextOccurrences(dayOfWeek: string, count: number): string[] {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const targetDayIndex = days.indexOf(dayOfWeek.toLowerCase())

  if (targetDayIndex === -1) throw new Error(`Invalid day of week: ${dayOfWeek}`)

  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDate = new Date(today)
  
  while (dates.length < count) {
    if (currentDate.getDay() === targetDayIndex && currentDate >= today) {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

import type { VisualCrossingDay } from "./types"

interface CacheEntry {
  data: VisualCrossingDay
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

class WeatherCache {
  private cache = new Map<string, CacheEntry>()

  private getDateCacheKey(lat: number, lon: number, date: string): string {
    const roundedLat = Math.round(lat * 10000) / 10000
    const roundedLon = Math.round(lon * 10000) / 10000
    return `${roundedLat},${roundedLon}|${date}`
  }

  getDate(lat: number, lon: number, date: string): VisualCrossingDay | null {
    const key = this.getDateCacheKey(lat, lon, date)
    const entry = this.cache.get(key)

    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  setDate(lat: number, lon: number, date: string, data: VisualCrossingDay): void {
    const key = this.getDateCacheKey(lat, lon, date)
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }
}

export const weatherCache = new WeatherCache()

if (typeof window !== "undefined") {
  setInterval(() => weatherCache.cleanup(), 5 * 60 * 1000)
}


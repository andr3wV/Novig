/**
 * Client-side weather data cache to prevent redundant API calls
 */

import type { WeatherDay } from "./types"

interface CacheEntry {
  data: WeatherDay[]
  timestamp: number
}

// Cache duration: 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000

class WeatherCache {
  private cache = new Map<string, CacheEntry>()

  /**
   * Generate a cache key from request parameters
   */
  private getCacheKey(lat: number, lon: number, dayOfWeek: string, eventTime: string): string {
    // Round coordinates to 4 decimal places (~11m precision) to group nearby locations
    const roundedLat = Math.round(lat * 10000) / 10000
    const roundedLon = Math.round(lon * 10000) / 10000
    return `${roundedLat},${roundedLon}|${dayOfWeek}|${eventTime}`
  }

  /**
   * Get cached data if available and not expired
   */
  get(lat: number, lon: number, dayOfWeek: string, eventTime: string): WeatherDay[] | null {
    const key = this.getCacheKey(lat, lon, dayOfWeek, eventTime)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if cache entry is expired
    if (age > CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    console.log(`Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`)
    return entry.data
  }

  /**
   * Store data in cache
   */
  set(lat: number, lon: number, dayOfWeek: string, eventTime: string, data: WeatherDay[]): void {
    const key = this.getCacheKey(lat, lon, dayOfWeek, eventTime)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
    console.log(`Cached data for ${key}`)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
    console.log("Weather cache cleared")
  }

  /**
   * Remove expired entries from cache
   */
  cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`Removed ${removed} expired cache entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Export a singleton instance
export const weatherCache = new WeatherCache()

// Periodically clean up expired entries (every 5 minutes)
if (typeof window !== "undefined") {
  setInterval(() => {
    weatherCache.cleanup()
  }, 5 * 60 * 1000)
}


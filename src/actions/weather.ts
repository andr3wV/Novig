"use server"

import type { WeatherDay, VisualCrossingDay } from "../lib/types"
import { processDayData } from "../lib/weather-processing"
import { weatherCache } from "../lib/weather-cache"

/**
 * Fetch weather data for a specific date
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param targetDate - Date in YYYY-MM-DD format
 * @param timeOfDay - Time of day filter (morning/afternoon/evening/custom)
 * @param occurrenceIndex - Which occurrence this is (0=first, 1=second, etc.)
 * @returns Single WeatherDay object
 */
export async function getWeatherForDate(
  latitude: number,
  longitude: number,
  targetDate: string,
  timeOfDay: string,
  occurrenceIndex: number = 0,
): Promise<WeatherDay> {
  const apiKey = process.env.VISUAL_CROSSING_API_KEY

  if (!apiKey) {
    console.error("Weather API error: VISUAL_CROSSING_API_KEY environment variable is not set")
    throw new Error("Weather service is temporarily unavailable. Please try again later.")
  }

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/${targetDate}?unitGroup=us&include=days,hours&key=${apiKey}`,
      {
        // Cache for 1 hour - weather doesn't change that frequently
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      let details = ""
      try {
        details = await response.text()
      } catch (_) {
        // ignore
      }
      console.error(`Weather API error: ${response.status} ${response.statusText} - ${details}`)
      throw new Error("Weather service is temporarily unavailable. Please try again later.")
    }

    const data = await response.json()

    if (!data.days || data.days.length === 0) {
      console.error("Weather API error: Invalid response structure - missing days array")
      throw new Error("Weather data is temporarily unavailable. Please try again later.")
    }

    const day: VisualCrossingDay = data.days[0]
    
    // Cache the raw API response (not filtered by time)
    weatherCache.setDate(latitude, longitude, targetDate, day)
    
    // Process the data with the time filter
    return processDayData(day, targetDate, timeOfDay, occurrenceIndex)
  } catch (error) {
    console.error("Weather API error:", error)
    throw new Error("Weather service is temporarily unavailable. Please try again later.")
  }
}
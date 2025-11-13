"use server"

import type { LocationSuggestion } from "../lib/types"

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return []

  const apiKey = process.env.VISUAL_CROSSING_API_KEY

  if (!apiKey) {
    throw new Error("VISUAL_CROSSING_API_KEY environment variable is not set")
  }

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(query)}?key=${apiKey}&include=current`,
      { cache: "no-store" }, // Not caching to avoid stale data
    )

    if (!response.ok) {
      if (response.status === 400) {
        console.log("Location not found:", query)
        return []
      }
      throw new Error(`Location search failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.resolvedAddress || !data.latitude || !data.longitude) {
      console.log("Invalid location response:", data)
      return []
    }

    return [
      {
        name: data.resolvedAddress,
        lat: data.latitude,
        lon: data.longitude,
        address: data.address,
      },
    ]
  } catch (error) {
    console.error("Location search error:", error)
    return []
  }
}

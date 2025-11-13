"use client"

import { useEffect, useState } from "react"
import { WeatherCard } from "./weather-card"
import { getWeatherData } from "@/actions/weather"
import { getRecommendation } from "@/lib/decision"
import type { WeatherDay } from "@/lib/types"
import { LoadingSkeleton } from "./loading"
import { RightAccordion } from "./right-accordion"
import { weatherCache } from "@/lib/weather-cache"

interface WeatherComparisonProps {
  location: string
  coordinates: { lat: number; lon: number }
  dayOfWeek: string
  eventTime: string
}

export function WeatherComparison({ location, coordinates, dayOfWeek, eventTime }: WeatherComparisonProps) {
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([])
  const [recommendedIndex, setRecommendedIndex] = useState<number | null>(null)
  const [recommendationReason, setRecommendationReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check cache first
        const cachedData = weatherCache.get(coordinates.lat, coordinates.lon, dayOfWeek, eventTime)
        
        let data: WeatherDay[]
        if (cachedData) {
          // Use cached data
          data = cachedData
        } else {
          // Fetch from API and cache the result
          data = await getWeatherData(coordinates.lat, coordinates.lon, dayOfWeek, eventTime)
          weatherCache.set(coordinates.lat, coordinates.lon, dayOfWeek, eventTime, data)
        }
        
        setWeatherData(data)
        
        // Generate recommendation if we have 2 days
        if (data.length >= 2) {
          const rec = getRecommendation(data[0], data[1])
          setRecommendedIndex(rec.recommendedIndex)
          setRecommendationReason(rec.reason)
        } else {
          setRecommendedIndex(null)
          setRecommendationReason(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [coordinates, dayOfWeek, eventTime])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-none p-6 text-center">
        <p className="text-destructive font-medium">Unable to load weather</p>
        <p className="text-sm text-destructive/80 mt-1">{error}</p>
      </div>
    )
  }

  if (weatherData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No weather data available for this day</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weather Cards with Inline Charts - Mobile Vertical Stack, Desktop Side-by-Side */}
      <div className="container mx-auto px-4">
        {/* Mobile vertical stack - show all days */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {weatherData.map((day, idx) => (
            <WeatherCard
              key={idx}
              day={day}
              location={location}
              isPrimary={idx === 0}
              isRecommended={recommendedIndex === idx}
              recommendationReason={recommendedIndex === idx ? recommendationReason ?? undefined : undefined}
            />
          ))}
        </div>

        {/* Desktop: left fixed card + right accordion carousel */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <WeatherCard
              day={weatherData[0]}
              location={location}
              isPrimary
              isRecommended={recommendedIndex === 0}
              recommendationReason={recommendedIndex === 0 ? recommendationReason ?? undefined : undefined}
            />
          </div>
          {weatherData.length > 1 ? (
            <RightAccordion
              days={weatherData.slice(1)}
              location={location}
              initialRightRecommended={recommendedIndex === 1}
              recommendationReason={recommendedIndex === 1 ? recommendationReason ?? undefined : undefined}
            />
          ) : (
            <div className="h-full" />
          )}
        </div>
      </div>
    </div>
  )
}

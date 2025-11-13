"use client"

import { useEffect, useState } from "react"
import { WeatherCard } from "./weather-card"
import { getWeatherData } from "@/actions/weather"
import { getRecommendation } from "@/lib/decision"
import type { WeatherDay } from "@/lib/types"
import { LoadingSkeleton } from "./loading"

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
        const data = await getWeatherData(coordinates.lat, coordinates.lon, dayOfWeek, eventTime)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weatherData.slice(0, 2).map((day, idx) => (
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
      </div>
    </div>
  )
}

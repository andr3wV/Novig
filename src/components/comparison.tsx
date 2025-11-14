"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { WeatherCard } from "./weather-card"
import { getWeatherForDate } from "@/actions/weather"
import { calculateNextOccurrences } from "@/lib/utils"
import { getRecommendation } from "@/lib/decision"
import type { WeatherDay } from "@/lib/types"
import { LoadingSkeleton } from "./loading"
import { RightAccordion } from "./right-accordion"
import { weatherCache } from "@/lib/weather-cache"
import { processDayData } from "@/lib/weather-processing"

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
  const [targetDates, setTargetDates] = useState<string[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  const fetchDateData = useCallback(async (date: string, index: number): Promise<WeatherDay> => {
    const cachedRawData = weatherCache.getDate(coordinates.lat, coordinates.lon, date)
    if (cachedRawData) {
      return processDayData(cachedRawData, date, eventTime, index)
    }
    return await getWeatherForDate(coordinates.lat, coordinates.lon, date, eventTime, index)
  }, [coordinates, eventTime])

  const loadMoreDates = useCallback(async (count: number) => {
    if (weatherData.length >= count || isLoadingMore || weatherData.length >= targetDates.length) return

    setIsLoadingMore(true)
    try {
      const datesToFetch = targetDates.slice(weatherData.length, count)
      const newData = await Promise.all(
        datesToFetch.map((date, i) => fetchDateData(date, weatherData.length + i))
      )
      setWeatherData(prev => [...prev, ...newData])
    } catch (err) {
      console.error("Error loading more dates:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [weatherData.length, targetDates, fetchDateData, isLoadingMore])

  const loadNextDate = useCallback(() => loadMoreDates(weatherData.length + 1), [loadMoreDates, weatherData.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const dates = calculateNextOccurrences(dayOfWeek, 10)
        setTargetDates(dates)
        
        const initialData = await Promise.all([
          fetchDateData(dates[0], 0),
          fetchDateData(dates[1], 1),
          fetchDateData(dates[2], 2)
        ])
        
        setWeatherData(initialData)
        
        if (initialData.length >= 2) {
          const rec = getRecommendation(initialData[0], initialData[1])
          setRecommendedIndex(rec.recommendedIndex)
          setRecommendationReason(rec.reason)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [coordinates, dayOfWeek, eventTime, fetchDateData])

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && weatherData.length < targetDates.length) {
          loadNextDate()
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    )

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [loadNextDate, isLoadingMore, weatherData.length, targetDates.length])

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
      <div className="container mx-auto px-4">
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
          
          {weatherData.length < targetDates.length && (
            <>
              <div ref={loadMoreTriggerRef} className="h-4" />
              {isLoadingMore && (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="hidden md:grid md:grid-cols-2 gap-6 items-stretch">
          <WeatherCard
            day={weatherData[0]}
            location={location}
            isPrimary
            isRecommended={recommendedIndex === 0}
            recommendationReason={recommendedIndex === 0 ? recommendationReason ?? undefined : undefined}
          />
          {weatherData.length > 1 && (
            <RightAccordion
              days={weatherData.slice(1)}
              location={location}
              initialRightRecommended={recommendedIndex === 1}
              recommendationReason={recommendedIndex === 1 ? recommendationReason ?? undefined : undefined}
              onLoadMore={loadMoreDates}
              maxDates={targetDates.length}
            />
          )}
        </div>
      </div>
    </div>
  )
}

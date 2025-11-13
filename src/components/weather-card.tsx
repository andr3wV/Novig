"use client"

import { useState } from "react"
import { Cloud, CloudRain, Sun, ChevronDown, ChevronUp, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { WeatherChart } from "./chart"
import type { WeatherDay } from "@/lib/types"


interface WeatherCardProps {
  day: WeatherDay
  location: string
  isPrimary?: boolean
  isRecommended?: boolean
  recommendationReason?: string
}

export function WeatherCard({ day, location, isPrimary, isRecommended, recommendationReason }: WeatherCardProps) {
  const [isChartExpanded, setIsChartExpanded] = useState(false)
  
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
      return <Sun className="w-12 h-12 text-amber-400" />
    }
    if (lowerCondition.includes("rain")) {
      return <CloudRain className="w-12 h-12 text-blue-400" />
    }
    if (lowerCondition.includes("cloud")) {
      return <Cloud className="w-12 h-12 text-gray-400" />
    }
    return <Cloud className="w-12 h-12 text-gray-400" />
  }

  return (
    <Card
      className={`h-full ${
        isPrimary
          ? " dark:hover:shadow-sm border-2 border-black dark:border-stone-100 bg-white dark:bg-black shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] transition duration-200 dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
          : "opacity-90"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-bold">{day.dateLabel}</CardTitle>
            <p className="text-sm text-muted-foreground">{day.timeOfDay}</p>
          </div>
          {isRecommended && recommendationReason && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="shrink-0 mt-1 mr-2">
                  <Star className="w-6 h-6 fill-blue-600 text-blue-600" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-700">Recommended Day</h4>
                  <p className="text-sm text-muted-foreground">{recommendationReason}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Weather Display */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-5xl font-bold">{Math.round(day.temperature)}°F</p>
            <p className="text-sm text-muted-foreground capitalize mt-1">{day.condition}</p>
          </div>
          <div className="shrink-0">{getWeatherIcon(day.condition)}</div>
        </div>

        {/* Chart Toggle Button (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsChartExpanded(!isChartExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border rounded-none hover:bg-muted/50 transition-colors"
          >
            {isChartExpanded ? (
              <>
                Hide Chart <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Chart <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Time-window Chart */}
        <div className={`pt-4 border-t ${isChartExpanded ? "block" : "hidden md:block"}`}>
          {day.hourlyData && day.hourlyData.length > 0 ? (
            <WeatherChart day={day} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No hourly data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

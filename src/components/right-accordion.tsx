"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, ArrowRight, Droplet, Wind } from "lucide-react"

import type { WeatherDay } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { WeatherCard } from "@/components/weather-card"

interface RightAccordionProps {
  days: WeatherDay[]
  location: string
  initialRightRecommended?: boolean
  recommendationReason?: string
  onLoadMore?: (count: number) => Promise<void>
  maxDates?: number
}

const MINI_WIDTH_PX = 56
const MINI_OVERLAP_PX = 16

function getSmallIcon(condition: string) {
  const lower = (condition || "").toLowerCase()
  if (lower.includes("sunny") || lower.includes("clear")) return <Sun className="w-4 h-4 text-amber-400" />
  if (lower.includes("rain")) return <CloudRain className="w-4 h-4 text-blue-400" />
  if (lower.includes("cloud")) return <Cloud className="w-4 h-4 text-gray-400" />
  return <Cloud className="w-4 h-4 text-gray-400" />
}

export function RightAccordion({ days, location, initialRightRecommended, recommendationReason, onLoadMore, maxDates = 10 }: RightAccordionProps) {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      const newIndex = api.selectedScrollSnap()
      setSelectedIndex(newIndex)

      if (onLoadMore && !isLoadingMore && days.length >= 2 && newIndex >= days.length - 1) {
        const totalDaysNeeded = days.length + 3
        if (totalDaysNeeded <= maxDates) {
          setIsLoadingMore(true)
          onLoadMore(totalDaysNeeded).finally(() => setIsLoadingMore(false))
        }
      }
    }
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api, days.length, isLoadingMore, maxDates, onLoadMore])

  const visibleStack = Math.min(selectedIndex, 4)
  const startIndex = Math.max(0, selectedIndex - visibleStack)
  const stackWidth = visibleStack > 0 ? MINI_WIDTH_PX + (visibleStack - 1) * MINI_OVERLAP_PX : 0

  return (
    <div className="relative h-full">
      <div
        className="absolute inset-y-0 left-0 hidden md:block"
        style={{ width: `${stackWidth}px` }}
        onClick={() => selectedIndex > 0 && api?.scrollPrev()}
        role="button"
        aria-label="Previous week"
      >
        {Array.from({ length: visibleStack }).map((_, i) => {
          const day = days[startIndex + i]
          const dateShort = day.dateLabel.includes(", ") ? day.dateLabel.split(", ")[1] : day.dateLabel
          return (
            <div
              key={startIndex + i}
              className="absolute top-0 bottom-0 border bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
              style={{
                left: `${i * MINI_OVERLAP_PX}px`,
                width: `${MINI_WIDTH_PX}px`,
                zIndex: 100 + i,
              }}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 px-1 text-center">
                <div className="shrink-0">{getSmallIcon(day.condition)}</div>
                <span className="text-[10px] font-medium tracking-wide">
                  {dateShort}
                </span>
                <span className="text-xs font-semibold">
                  {Math.round(day.temperature)}°
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Wind className="w-3 h-3" />
                  {Math.round(day.windSpeed)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Droplet className="w-3 h-3" />
                  {Math.round(day.precipProb)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="h-full"
        style={{
          paddingLeft: stackWidth,
          transition: "padding-left 300ms ease-in-out",
        }}
      >
        <Carousel
          opts={{ align: "start", loop: false }}
          setApi={setApi}
          className="h-full"
        >
          <CarouselContent className="h-full">
            {days.map((day, idx) => {
              const isRecommended = initialRightRecommended && idx === 0 && selectedIndex === 0
              return (
                <CarouselItem key={idx} className="h-full">
                  <WeatherCard
                    day={day}
                    location={location}
                    isPrimary={false}
                    isRecommended={isRecommended}
                    recommendationReason={isRecommended ? recommendationReason : undefined}
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full"
            onClick={() => !isLoadingMore && api?.scrollNext()}
            disabled={selectedIndex >= days.length - 1}
            aria-label="Next week"
          >
            <ArrowRight />
          </Button>
        </Carousel>
      </div>
    </div>
  )
}



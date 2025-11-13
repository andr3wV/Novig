"use client"

import * as React from "react"
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

export function RightAccordion({ days, location, initialRightRecommended, recommendationReason }: RightAccordionProps) {
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Bind to carousel selection
  React.useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  // Compute stack metrics
  const collapsedCount = selectedIndex
  const visibleStack = Math.min(collapsedCount, 4)
  const startIndex = Math.max(0, collapsedCount - visibleStack)
  const stackWidth = visibleStack > 0 ? MINI_WIDTH_PX + (visibleStack - 1) * MINI_OVERLAP_PX : 0

  const canGoNext = selectedIndex < (days.length - 1)
  const scrollNext = () => api?.scrollNext()
  const scrollPrev = () => api?.scrollPrev()

  return (
    <div className="relative h-full">
      {/* Collapsed mini-card stack (click to go back) */}
      <div
        className="absolute inset-y-0 left-0 hidden md:block"
        style={{ width: `${stackWidth}px` }}
        onClick={() => {
          if (collapsedCount > 0) scrollPrev()
        }}
        role="button"
        aria-label="Previous week"
      >
        {Array.from({ length: visibleStack }).map((_, i) => {
          const realIndex = startIndex + i
          const day = days[realIndex]
          const left = i * MINI_OVERLAP_PX
          const dateShort =
            typeof day.dateLabel === "string" && day.dateLabel.includes(", ")
              ? day.dateLabel.split(", ")[1]
              : day.dateLabel
          return (
            <div
              key={realIndex}
              className="absolute top-0 bottom-0 border bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
              style={{
                left: `${left}px`,
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

      {/* Right detail area with dynamic left padding that grows as stack builds */}
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
            {days.map((day, idx) => (
              <CarouselItem key={idx} className="h-full">
                <div className="h-full">
                  <WeatherCard
                    day={day}
                    location={location}
                    isPrimary={false}
                    isRecommended={initialRightRecommended === true && idx === 0 && selectedIndex === 0}
                    recommendationReason={initialRightRecommended === true && idx === 0 && selectedIndex === 0 ? recommendationReason : undefined}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Next arrow (advance to subsequent week) */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full"
            onClick={scrollNext}
            disabled={!canGoNext}
            aria-label="Next week"
          >
            <ArrowRight />
          </Button>
        </Carousel>
      </div>
    </div>
  )
}



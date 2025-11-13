"use client"

import { useState } from "react"
import { Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { LocationSelector } from "@/components/selects/location"
import { formatTime12Hour } from "@/lib/utils"

interface ControllerBarProps {
  location: string
  dayOfWeek: string
  timeRange: string
  onLocationChange: (location: string, coords: { lat: number; lon: number }) => void
  onDayChange: (day: string) => void
  onTimeRangeChange: (range: string) => void
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_RANGES = [
  { label: "Morning", value: "morning", hours: "8–12" },
  { label: "Afternoon", value: "afternoon", hours: "12–5" },
  { label: "Evening", value: "evening", hours: "5–9" },
]

export function ControllerBar({
  location,
  dayOfWeek,
  timeRange,
  onLocationChange,
  onDayChange,
  onTimeRangeChange,
}: ControllerBarProps) {
  const [customTimeRange, setCustomTimeRange] = useState<[number, number]>([8, 17])
  
  const currentTimeRange = TIME_RANGES.find((t) => t.value === timeRange) || TIME_RANGES[1]
  
  const handleCustomTimeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]]
    setCustomTimeRange(newRange)
    // Update the time range with custom format
    onTimeRangeChange(`custom (${newRange[0]}-${newRange[1]})`)
  }
  
  const getDisplayText = () => {
    if (timeRange.startsWith("custom")) {
      return `${formatTime12Hour(customTimeRange[0])} - ${formatTime12Hour(customTimeRange[1])}`
    }
    return `${currentTimeRange.label}`
  }

  return (
    <div className="sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Location Selector */}
          <div className="flex-1 min-w-0">
            <LocationSelector value={location} onChange={onLocationChange} />
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 md:flex-initial bg-background justify-start">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">Every {dayOfWeek}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {WEEKDAYS.map((day) => (
                  <DropdownMenuItem key={day} onClick={() => onDayChange(day)}>
                    Every {day}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Range Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 md:flex-initial bg-background justify-start">
                  <Clock className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">
                    {getDisplayText()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {TIME_RANGES.map((range) => (
                  <DropdownMenuItem 
                    key={range.value} 
                    onClick={() => onTimeRangeChange(range.value)}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-3 py-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Custom Range</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTime12Hour(customTimeRange[0])} - {formatTime12Hour(customTimeRange[1])}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={23}
                      step={1}
                      value={customTimeRange}
                      onValueChange={handleCustomTimeChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12am</span>
                      <span>6am</span>
                      <span>12pm</span>
                      <span>6pm</span>
                      <span>11pm</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}



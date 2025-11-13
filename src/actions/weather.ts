"use server"

import type { HourlyWeatherData, WeatherDay, VisualCrossingDay } from "../lib/types"
import { formatTime12Hour } from "../lib/utils"

// Map icon names to icons
function mapIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    "clear-day": "sun",
    "clear-night": "moon",
    "partly-cloudy-day": "cloud-sun",
    "partly-cloudy-night": "cloud-moon",
    cloudy: "cloud",
    rain: "cloud-rain",
    "rain-snow": "cloud-snow",
    snow: "snowflake",
    wind: "wind",
    fog: "cloud-fog",
  }
  return iconMap[icon] || "cloud"
}

// Extract time window data from hourly data
function extractTimeWindowData(hours: any[], timeOfDay: string): HourlyWeatherData[] {
  const result: HourlyWeatherData[] = []

  let startHour = 12 // afternoon
  let endHour = 17 // 5 PM
  
  // Check if it's a custom range
  if (timeOfDay.includes("custom")) {
    // Parse custom range: "custom (8-17)"
    const match = timeOfDay.match(/\((\d+)-(\d+)\)/)
    if (match) {
      startHour = Number.parseInt(match[1])
      endHour = Number.parseInt(match[2])
    }
  } else if (timeOfDay.includes("morning")) {
    startHour = 8
    endHour = 12
  } else if (timeOfDay.includes("evening")) {
    startHour = 17
    endHour = 21 // 9 PM
  }

  const duration = endHour - startHour

  for (let i = 0; i <= duration; i++) {
    const hour = hours.find((h) => {
      const hourNum = Number.parseInt(h.datetime.split(":")[0])
      return hourNum === startHour + i
    })

    if (hour) {
      result.push({
        time: formatTime12Hour(startHour + i),
        temp: Math.round(hour.temp),
        feelsLike: Math.round(hour.feelslike || hour.temp),
        wind: Math.round(hour.windspeed),
        windGust: Math.round(hour.windgust || hour.windspeed * 1.3), // Estimate gust if not available
        // keep precip with decimals for threshold checks (e.g., 0.10 in, 0.20 in)
        precip: typeof hour.precip === "number" ? Math.round(hour.precip * 100) / 100 : 0,
        precipProb: Math.round(hour.precipprob || 0),
      })
    }
  }

  return result
}

export async function getWeatherData(
  latitude: number,
  longitude: number,
  dayOfWeek: string,
  timeOfDay: string,
): Promise<WeatherDay[]> {
  const apiKey = process.env.VISUAL_CROSSING_API_KEY

  if (!apiKey) {
    throw new Error("VISUAL_CROSSING_API_KEY environment variable is not set")
  }

  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/next14days?unitGroup=us&include=days,hours&key=${apiKey}`,
      { cache: "no-store" }, // Not caching to avoid stale data
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.days) {
      throw new Error("Invalid API response")
    }

    // Filter for the day of week and get 2 occurrences
    const results: WeatherDay[] = []
    const targetDayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(
      dayOfWeek.toLowerCase(),
    )

    if (targetDayIndex === -1) {
      throw new Error(`Invalid day of week: ${dayOfWeek}`)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

    for (const day of data.days) {
      const dayDate = new Date(day.datetime)
      dayDate.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

      // Skip dates that are before today
      if (dayDate < today) continue

      if (dayDate.getDay() === targetDayIndex) {
        const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" })
        const monthDay = dayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })

        // Create labels: "This Friday, Nov 10" or "Next Friday, Nov 17"
        const isFirst = results.length === 0
        const prefix = isFirst ? "This" : "Next"
        const dateLabel = `${prefix} ${dayName}, ${monthDay}`

        const daysUntil = Math.round((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let timeOfDayLabel = "Afternoon (12pm-5pm)"
        if (timeOfDay.includes("custom")) {
          // Parse custom range: "custom (8-17)"
          const match = timeOfDay.match(/\((\d+)-(\d+)\)/)
          if (match) {
            const start = Number.parseInt(match[1])
            const end = Number.parseInt(match[2])
            timeOfDayLabel = `${formatTime12Hour(start)}-${formatTime12Hour(end)}`
          }
        } else if (timeOfDay.includes("morning")) {
          timeOfDayLabel = "Morning (8am-12pm)"
        } else if (timeOfDay.includes("evening")) {
          timeOfDayLabel = "Evening (5pm-9pm)"
        }

        const avgTemp = day.temp || Math.round((day.tempmax! + day.tempmin!) / 2)
        const hourlyData = day.hours ? extractTimeWindowData(day.hours, timeOfDay) : []
        const avgFeelsLike = hourlyData.length > 0
          ? Math.round(hourlyData.reduce((sum, h) => sum + h.feelsLike, 0) / hourlyData.length)
          : avgTemp

        results.push({
          dateLabel,
          dayOfWeek: dayDate.toLocaleDateString("en-US", { weekday: "long" }),
          timeOfDay: timeOfDayLabel,
          temperature: avgTemp,
          feelsLike: avgFeelsLike,
          condition: day.conditions,
          icon: mapIcon(day.icon),
          windSpeed: Math.round(day.windspeed),
          windGust: Math.round(day.windgust || day.windspeed * 1.3),
          precipitation: Math.round(day.precip || 0),
          precipProb: Math.round(day.precipprob || 0),
          hourlyData,
          daysUntil,
        })

        if (results.length === 2) break
      }
    }

    if (results.length === 0) {
      console.log(
        "No matches found. Available days in forecast:",
        data.days.map((d: VisualCrossingDay) =>
          new Date(d.datetime).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        ),
      )
      throw new Error(`No matching ${dayOfWeek} days found in the 14-day forecast`)
    }

    return results
  } catch (error) {
    console.error("Weather API error:", error)
    throw error
  }
}

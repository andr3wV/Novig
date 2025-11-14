import type { HourlyWeatherData, WeatherDay, VisualCrossingDay, WeatherMessage } from "./types"
import { formatTime12Hour } from "./utils"

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

function mapIcon(icon: string): string {
  return iconMap[icon] || "cloud"
}

function extractTimeWindowData(hours: any[], timeOfDay: string): HourlyWeatherData[] {
  const result: HourlyWeatherData[] = []

  let startHour = 12
  let endHour = 17
  
  if (timeOfDay.includes("custom")) {
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
    endHour = 21
  }

  const duration = endHour - startHour

  for (let i = 0; i <= duration; i++) {
    const hour = hours.find((h) => {
      let hourStr = ""
      if (typeof h.datetime === "string") {
        if (h.datetime.includes("T")) {
          hourStr = h.datetime.split("T")[1]?.split(":")[0] || ""
        } else {
          hourStr = h.datetime.split(":")[0] || ""
        }
      } else if (typeof h.datetimeEpoch === "number") {
        return new Date(h.datetimeEpoch * 1000).getHours() === startHour + i
      }
      return Number.parseInt(hourStr) === startHour + i
    })

    if (hour) {
      result.push({
        time: formatTime12Hour(startHour + i),
        temp: Math.round(hour.temp),
        feelsLike: Math.round(hour.feelslike || hour.temp),
        wind: Math.round(hour.windspeed),
        windGust: Math.round(hour.windgust || hour.windspeed * 1.3),
        precip: typeof hour.precip === "number" ? Math.round(hour.precip * 100) / 100 : 0,
        precipProb: Math.round(hour.precipprob || 0),
      })
    }
  }

  return result
}

/**
 * Generates weather message badges based on weather conditions
 */
export function generateWeatherMessages(day: VisualCrossingDay): WeatherMessage[] {
  const messages: WeatherMessage[] = []
  const temp = day.temp || (day.tempmax && day.tempmin ? (day.tempmax + day.tempmin) / 2 : undefined)
  const humidity = day.humidity
  const precipProb = day.precipprob
  const windSpeed = day.windspeed
  const cloudCover = day.cloudcover
  const uvIndex = day.uvindex

  // Temperature-based messages
  if (temp !== undefined) {
    if (temp >= 60 && temp <= 75) {
      messages.push({
        text: "Nice day",
        variant: "default"
      })
    } else if (temp > 75 && temp <= 85) {
      messages.push({
        text: "Warm",
        variant: "secondary"
      })
    } else if (temp > 85) {
      messages.push({
        text: "Hot weather",
        variant: "destructive"
      })
    } else if (temp < 60 && temp >= 45) {
      messages.push({
        text: "Cool",
        variant: "secondary"
      })
    } else if (temp < 45) {
      messages.push({
        text: "Cold",
        variant: "outline"
      })
    }
  }

  // Precipitation probability
  if (precipProb !== undefined) {
    if (precipProb >= 70) {
      messages.push({
        text: "Likely rain",
        variant: "destructive"
      })
    } else if (precipProb >= 40 && precipProb < 70) {
      messages.push({
        text: "Chance of rain",
        variant: "secondary"
      })
    }
  }

  // Humidity-based messages
  if (humidity !== undefined) {
    if (humidity >= 70) {
      messages.push({
        text: "Humid",
        variant: "secondary"
      })
    } else if (humidity <= 30) {
      messages.push({
        text: "Dry air",
        variant: "outline"
      })
    }
  }

  // Wind-based messages
  if (windSpeed !== undefined) {
    if (windSpeed >= 25) {
      messages.push({
        text: "Very windy",
        variant: "destructive"
      })
    } else if (windSpeed >= 15 && windSpeed < 25) {
      messages.push({
        text: "Windy",
        variant: "secondary"
      })
    }
  }

  // Cloud cover messages
  if (cloudCover !== undefined) {
    if (cloudCover >= 80) {
      messages.push({
        text: "Overcast",
        variant: "outline"
      })
    } else if (cloudCover <= 20) {
      messages.push({
        text: "Clear skies",
        variant: "default"
      })
    }
  }

  // UV index warnings
  if (uvIndex !== undefined && uvIndex >= 8) {
    messages.push({
      text: "High UV",
      variant: "destructive"
    })
  }

  return messages
}

export function processDayData(
  day: VisualCrossingDay,
  targetDate: string,
  timeOfDay: string,
  occurrenceIndex: number
): WeatherDay {
  const dayDate = new Date(targetDate)
  dayDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" })
  const monthDay = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const dateLabel = 
    occurrenceIndex === 0 ? `This ${dayName}, ${monthDay}` :
    occurrenceIndex === 1 ? `Next ${dayName}, ${monthDay}` :
    `${dayName}, ${monthDay}`

  const daysUntil = Math.round((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  let timeOfDayLabel = "Afternoon"
  if (timeOfDay.includes("custom")) {
    const match = timeOfDay.match(/\((\d+)-(\d+)\)/)
    if (match) {
      const [, start, end] = match
      timeOfDayLabel = `${formatTime12Hour(Number(start))}-${formatTime12Hour(Number(end))}`
    }
  } else if (timeOfDay.includes("morning")) {
    timeOfDayLabel = "Morning"
  } else if (timeOfDay.includes("evening")) {
    timeOfDayLabel = "Evening"
  }

  const avgTemp = day.temp || Math.round((day.tempmax! + day.tempmin!) / 2)
  const hourlyData = day.hours ? extractTimeWindowData(day.hours, timeOfDay) : []
  const avgFeelsLike = hourlyData.length > 0
    ? Math.round(hourlyData.reduce((sum, h) => sum + h.feelsLike, 0) / hourlyData.length)
    : avgTemp

  // Generate weather messages
  const messages = generateWeatherMessages(day)

  return {
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
    messages,
  }
}


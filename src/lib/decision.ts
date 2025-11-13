import type { WeatherDay } from "./types"

interface DayMetrics {
  avgFeels: number
  maxPrecipProb: number
  totalPrecip: number
  avgWind: number
  maxGust: number
  hasThunderstorm: boolean
  hasSnowIce: boolean
  extremeTemp: boolean
}

function analyzeDayWindow(day: WeatherDay): DayMetrics {
  const hours = day.hourlyData || []
  const count = Math.max(1, hours.length)

  const avgFeels = hours.reduce((sum, h) => sum + h.feelsLike, 0) / count
  const maxPrecipProb = Math.max(...hours.map((h) => h.precipProb))
  const totalPrecip = hours.reduce((sum, h) => sum + (h.precip || 0), 0)
  const avgWind = hours.reduce((sum, h) => sum + h.wind, 0) / count
  const maxGust = Math.max(...hours.map((h) => h.windGust || 0))

  const hasThunderstorm = /thunder|t[-\s]?storm/i.test(day.condition || "")
  const hasSnowIce = /snow|ice|sleet|freez/i.test(day.condition || "")
  const extremeTemp = hours.some((h) => h.feelsLike <= 40 || h.feelsLike >= 95)

  return {
    avgFeels,
    maxPrecipProb,
    totalPrecip,
    avgWind,
    maxGust,
    hasThunderstorm,
    hasSnowIce,
    extremeTemp,
  }
}

export function getRecommendation(
  thisDay: WeatherDay,
  nextDay: WeatherDay,
): { recommendedIndex: 0 | 1; reason: string } {
  const thisM = analyzeDayWindow(thisDay)
  const nextM = analyzeDayWindow(nextDay)

  // 1. Hazard precedence
  if (thisM.hasThunderstorm && !nextM.hasThunderstorm) {
    return { recommendedIndex: 1, reason: "Avoid thunderstorms this Friday" }
  }
  if (nextM.hasThunderstorm && !thisM.hasThunderstorm) {
    return { recommendedIndex: 0, reason: "Avoid thunderstorms next Friday" }
  }
  if (thisM.hasSnowIce && !nextM.hasSnowIce) {
    return { recommendedIndex: 1, reason: "Avoid snow/ice this Friday" }
  }
  if (nextM.hasSnowIce && !thisM.hasSnowIce) {
    return { recommendedIndex: 0, reason: "Avoid snow/ice next Friday" }
  }
  if (thisM.extremeTemp && !nextM.extremeTemp) {
    return { recommendedIndex: 1, reason: "Avoid extreme temperatures this Friday" }
  }
  if (nextM.extremeTemp && !thisM.extremeTemp) {
    return { recommendedIndex: 0, reason: "Avoid extreme temperatures next Friday" }
  }
  if (thisM.maxGust >= 35 && nextM.maxGust < 35) {
    return { recommendedIndex: 1, reason: "Avoid dangerous wind gusts this Friday" }
  }
  if (nextM.maxGust >= 35 && thisM.maxGust < 35) {
    return { recommendedIndex: 0, reason: "Avoid dangerous wind gusts next Friday" }
  }

  // 2. Rain risk (max precip probability)
  const rainThis = Math.round(thisM.maxPrecipProb)
  const rainNext = Math.round(nextM.maxPrecipProb)
  const rainDiff = Math.abs(rainThis - rainNext)
  if (rainDiff >= 15) {
    if (rainThis < rainNext) {
      return { recommendedIndex: 0, reason: `Lower rain risk (${rainThis}% vs ${rainNext}%)` }
    } else {
      return { recommendedIndex: 1, reason: `Lower rain risk (${rainNext}% vs ${rainThis}%)` }
    }
  }

  // 3. Temperature comfort (closer to 68°F ideal)
  const target = 68
  const tempThis = Math.round(thisM.avgFeels)
  const tempNext = Math.round(nextM.avgFeels)
  const comfortThis = Math.abs(tempThis - target)
  const comfortNext = Math.abs(tempNext - target)
  const comfortDiff = Math.abs(comfortThis - comfortNext)
  if (comfortDiff >= 5) {
    if (comfortThis < comfortNext) {
      return { recommendedIndex: 0, reason: `More comfortable temperature (${tempThis}°F vs ${tempNext}°F)` }
    } else {
      return { recommendedIndex: 1, reason: `More comfortable temperature (${tempNext}°F vs ${tempThis}°F)` }
    }
  }

  // 4. Wind calmness
  const windThis = Math.round(thisM.avgWind)
  const windNext = Math.round(nextM.avgWind)
  const windDiff = Math.abs(windThis - windNext)
  if (windDiff >= 5) {
    if (windThis < windNext) {
      return { recommendedIndex: 0, reason: `Calmer wind (${windThis} mph vs ${windNext} mph)` }
    } else {
      return { recommendedIndex: 1, reason: `Calmer wind (${windNext} mph vs ${windThis} mph)` }
    }
  }

  // 5. Similar conditions - prefer this Friday
  return { recommendedIndex: 0, reason: "Conditions are similar; this Friday is sooner" }
}

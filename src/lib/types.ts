export interface LocationSuggestion {
  name: string
  lat: number
  lon: number
  address: string
}

export interface HourlyWeatherData {
  time: string
  temp: number
  feelsLike: number
  wind: number
  windGust: number
  precip: number
  precipProb: number
}

export interface WeatherDay {
  dateLabel: string
  dayOfWeek: string
  timeOfDay: string
  temperature: number
  feelsLike: number
  condition: string
  icon: string
  windSpeed: number
  windGust: number
  precipitation: number
  precipProb: number
  hourlyData: HourlyWeatherData[]
  daysUntil?: number
}

export interface VisualCrossingDay {
  datetime: string
  tempmax?: number
  tempmin?: number
  temp?: number
  feelslike?: number
  conditions: string
  icon: string
  windspeed: number
  windgust?: number
  precipprob: number
  precip?: number
  hours?: Array<{
    datetime: string
    temp: number
    feelslike?: number
    windspeed: number
    windgust?: number
    precipprob: number
    precip?: number
  }>
}
"use client"

import { useState } from "react"
import { ControllerBar } from "@/components/controller-bar"
import { WeatherComparison } from "@/components/comparison"

export default function Home() {
  const [location, setLocation] = useState("Dolores Park, SF")
  const [eventTime, setEventTime] = useState("afternoon (12-5)")
  const [dayOfWeek, setDayOfWeek] = useState("Friday")
  const [coordinates, setCoordinates] = useState({ lat: 37.7694, lon: -122.4862 })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Controller Bar */}
      <ControllerBar
        location={location}
        dayOfWeek={dayOfWeek}
        timeRange={eventTime}
        onLocationChange={(loc, coords) => {
          setLocation(loc)
          setCoordinates(coords)
        }}
        onDayChange={setDayOfWeek}
        onTimeRangeChange={setEventTime}
      />

      {/* Main Content */}
      <div className="flex-1">
        <WeatherComparison
          location={location}
          coordinates={coordinates}
          dayOfWeek={dayOfWeek}
          eventTime={eventTime}
        />
      </div>
    </div>
  )
}

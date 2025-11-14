"use client"

import { useState } from "react"
import { ControllerBar } from "@/components/controller-bar"
import { WeatherComparison } from "@/components/comparison"

export default function Home() {
  const [location, setLocation] = useState("Washington, DC")
  const [eventTime, setEventTime] = useState("afternoon")
  const [dayOfWeek, setDayOfWeek] = useState("Friday")
  const [coordinates, setCoordinates] = useState({ lat: 38.8951, lon: -77.0364 })

  return (
    <div className="min-h-screen flex flex-col space-y-6">
      {/*  Controller Bar */}
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

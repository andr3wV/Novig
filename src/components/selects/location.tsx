"use client"

import { useState, useCallback } from "react"
import { MapPin, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchLocations } from "@/actions/location"
import type { LocationSuggestion } from "@/lib/types"

interface LocationSelectorProps {
  value: string
  onChange: (location: string, coordinates: { lat: number; lon: number }) => void
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [input, setInput] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSearch = useCallback(async (query: string) => {
    setInput(query)
    setError("")

    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const results = await searchLocations(query)
      if (results.length === 0) {
        setError(`No locations found for "${query}". Please try again.`)
        setSuggestions([])
      } else {
        setSuggestions(results)
        setIsOpen(true)
      }
    } catch (err) {
      setError("Error searching locations. Please try again.")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSelectLocation = (location: LocationSuggestion) => {
    setInput(location.name)
    onChange(location.name, { lat: location.lat, lon: location.lon })
    setSuggestions([])
    setIsOpen(false)
    setError("")
  }

  const handleClear = () => {
    setInput("")
    setSuggestions([])
    setIsOpen(false)
    setError("")
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search for a location..."
          className="pl-9 pr-9 font-bold"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-black" />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-background border rounded-none text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching locations...
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-none text-sm text-destructive">
          {error}
        </div>
      )}

      {isOpen && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-none shadow-lg z-50">
          {suggestions.map((location) => (
            <button
              key={`${location.lat}-${location.lon}`}
              onClick={() => handleSelectLocation(location)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
            >
              <div className="font-medium">{location.name}</div>
              {location.address && location.address !== location.name && (
                <div className="text-xs text-muted-foreground">{location.address}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

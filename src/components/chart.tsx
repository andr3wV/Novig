"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { WeatherDay } from "@/lib/types"

interface WeatherChartProps {
  day: WeatherDay
}

export function WeatherChart({ day }: WeatherChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={day.hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" vertical={true} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            stroke="hsl(0, 0%, 70%)" 
            height={60}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(39, 100%, 50%)" label={{ value: '°F', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(200, 80%, 50%)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(0, 0%, 90%)",
              borderRadius: "0px",
              padding: "8px",
            }}
            formatter={(value: number | string) => Math.round(Number(value))}
          />
          <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            stroke="hsl(39, 100%, 50%)"
            dot={false}
            name="Temp (°F)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="wind"
            stroke="hsl(200, 80%, 50%)"
            dot={false}
            name="Wind (mph)"
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="precipProb"
            stroke="hsl(120, 60%, 40%)"
            dot={false}
            name="Precip (%)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

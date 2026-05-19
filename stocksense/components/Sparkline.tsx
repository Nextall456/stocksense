import React from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export default function Sparkline({ 
  data, 
  color = '#3b82f6', 
  height = 20, 
  width = 100 
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ height, width }} className="bg-gray-100 rounded" />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding
    const y = height - ((value - min) / range) * (height - padding * 2) - padding
    return `${x},${y}`
  }).join(' ')

  return (
    <svg 
      height={height} 
      width={width} 
      viewBox={`0 0 ${width} ${height}`}
      className="rounded"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
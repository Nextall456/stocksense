import React from 'react'

interface GradeBadgeProps {
  grade: string
  score?: number
}

export default function GradeBadge({ grade, score }: GradeBadgeProps) {
  const gradeColors: Record<string, string> = {
    'A+': 'bg-yellow-400 text-black',
    'A': 'bg-green-500 text-white',
    'B+': 'bg-blue-400 text-white',
    'B': 'bg-sky-500 text-white',
    'C': 'bg-gray-400 text-white',
  }

  const bgColor = gradeColors[grade] || 'bg-gray-400 text-white'

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${bgColor}`}>
      <span>{grade}</span>
      {score !== undefined && (
        <span className="text-xs opacity-75">({score})</span>
      )}
    </div>
  )
}
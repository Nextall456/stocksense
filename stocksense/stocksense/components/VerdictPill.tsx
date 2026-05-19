import React from 'react'

interface VerdictPillProps {
  verdict: 'STRONG_BUY' | 'BUY' | 'WAIT' | 'AVOID'
}

export default function VerdictPill({ verdict }: VerdictPillProps) {
  const config = {
    STRONG_BUY: {
      label: '🔥 ซื้อแรง',
      colors: 'bg-red-500 text-white',
      icon: '⚡'
    },
    BUY: {
      label: '✅ ซื้อได้',
      colors: 'bg-green-500 text-white',
      icon: '👍'
    },
    WAIT: {
      label: '⏳ รอ',
      colors: 'bg-yellow-400 text-black',
      icon: '⏰'
    },
    AVOID: {
      label: '⛔ หนี',
      colors: 'bg-gray-500 text-white',
      icon: '🚫'
    }
  }

  const { label, colors, icon } = config[verdict]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${colors}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  )
}
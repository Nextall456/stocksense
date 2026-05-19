'use client'

import { useState, useEffect } from 'react'
import GradeBadge from '@/components/GradeBadge'
import VerdictPill from '@/components/VerdictPill'
import Sparkline from '@/components/Sparkline'

// Mock stock data
const mockStocks = [
  { symbol: 'PTT', name: 'PTT Public Company', price: 15.80, changePct: 2.3, grade: 'A+', gradeScore: 8, verdict: 'STRONG_BUY' as const, winRate: 92, support: 15.01, target: 17.69, upside: 12.0 },
  { symbol: 'ABC', name: 'ABC Company', price: 45.50, changePct: 1.8, grade: 'A' as const, gradeScore: 6, verdict: 'BUY' as const, winRate: 78, support: 43.22, target: 51.06, upside: 12.0 },
  { symbol: 'XYZ', name: 'XYZ Corporation', price: 120.25, changePct: -0.5, grade: 'B+' as const, gradeScore: 4, verdict: 'WAIT' as const, winRate: 55, support: 114.23, target: 134.68, upside: 16.2 },
]

export default function Home() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🎯 StockSense</h1>
          <div className="text-sm text-gray-600">
            {time.toLocaleTimeString('th-TH')}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">
            สแกนหุ้น
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
            หุ้นเด่น
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
            แจ้งเตือน
          </button>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">หุ้น</th>
                <th className="p-3 text-left">เกรด</th>
                <th className="p-3 text-left">ราคา</th>
                <th className="p-3 text-left">เปลี่ยนแปลง</th>
                <th className="p-3 text-left">Verdict</th>
                <th className="p-3 text-left">Upside</th>
                <th className="p-3 text-left">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {mockStocks.map((stock) => (
                <tr key={stock.symbol} className="border-t hover:bg-gray-50 cursor-pointer">
                  <td className="p-3">
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </td>
                  <td className="p-3">
                    <GradeBadge grade={stock.grade} score={stock.gradeScore} />
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{stock.price} บาท</div>
                  </td>
                  <td className="p-3">
                    <span className={stock.changePct >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stock.changePct >= 0 ? '+' : ''}{stock.changePct}%
                    </span>
                  </td>
                  <td className="p-3">
                    <VerdictPill verdict={stock.verdict} />
                  </td>
                  <td className="p-3">
                    <span className="text-blue-600 font-semibold">{stock.upside}%</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${stock.winRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stock.winRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
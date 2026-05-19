// ═══════════════════════════════════════════════════════════════
// lib/stocks/analyzer.ts — AI Verdict Logic
// ═══════════════════════════════════════════════════════════════

export type Verdict = 'STRONG_BUY' | 'BUY' | 'WAIT' | 'AVOID'

interface AnalyzerInput {
  price: number
  changePct: number
  pe?: number
  pbv?: number
  roe?: number
  divYield?: number
  debtEq?: number
  rsi?: number
  macdSignal?: 'BUY' | 'SELL'
  volume?: number
  avgVolume?: number
}

export function analyzeStock(input: AnalyzerInput) {
  let gradeScore = 0

  if (input.pe && input.pe < 15) gradeScore += 2
  else if (input.pe && input.pe < 25) gradeScore += 1

  if (input.pbv && input.pbv < 1.5) gradeScore += 2
  else if (input.pbv && input.pbv < 3) gradeScore += 1

  if (input.divYield && input.divYield > 4) gradeScore += 2
  else if (input.divYield && input.divYield > 2) gradeScore += 1

  if (input.roe && input.roe > 20) gradeScore += 2
  else if (input.roe && input.roe > 12) gradeScore += 1

  if (input.debtEq && input.debtEq < 1) gradeScore += 1
  if (input.rsi && input.rsi > 30 && input.rsi < 70) gradeScore += 1

  const grade = gradeScore >= 8 ? 'A+' :
                gradeScore >= 6 ? 'A' :
                gradeScore >= 4 ? 'B+' :
                gradeScore >= 2 ? 'B' : 'C'

  // Whale detection (volume spike)
  const whaleAction = (input.volume && input.avgVolume)
    ? input.volume > input.avgVolume * 1.5 ? 'ACCUMULATING'
      : input.volume < input.avgVolume * 0.5 ? 'DISTRIBUTING'
      : 'NEUTRAL'
    : 'NEUTRAL'

  // Verdict
  let verdict: Verdict = 'WAIT'
  let reason = 'ยังไม่มีจังหวะชัดเจน'

  if (gradeScore >= 6 && input.macdSignal === 'BUY' && (input.rsi ?? 50) < 60 && whaleAction === 'ACCUMULATING') {
    verdict = 'STRONG_BUY'
    reason = 'พื้นฐานดี + Whale เก็บของ + MACD bullish'
  } else if (gradeScore >= 4 && input.macdSignal === 'BUY' && (input.rsi ?? 50) < 65) {
    verdict = 'BUY'
    reason = 'สัญญาณเทคนิคเข้าทาง พื้นฐานยอมรับได้'
  } else if ((input.rsi ?? 0) > 75 || whaleAction === 'DISTRIBUTING') {
    verdict = 'AVOID'
    reason = 'Overbought หรือ Whale กำลังขายออก'
  } else if (gradeScore < 3) {
    verdict = 'AVOID'
    reason = 'พื้นฐานอ่อนแอ'
  }

  // Price targets
  const support = input.price * 0.95
  const target = input.price * 1.12
  const stopLoss = input.price * 0.93
  const upside = ((target - input.price) / input.price) * 100
  const downside = ((stopLoss - input.price) / input.price) * 100
  const riskReward = Math.abs(upside / downside)

  // Win Rate (heuristic)
  const winRate = Math.min(95, Math.max(20,
    50 + gradeScore * 4
    + (input.macdSignal === 'BUY' ? 8 : -8)
    + (whaleAction === 'ACCUMULATING' ? 10 : whaleAction === 'DISTRIBUTING' ? -12 : 0)
  ))

  return {
    grade,
    gradeScore,
    verdict,
    reason,
    winRate: Math.round(winRate),
    whaleAction,
    support: parseFloat(support.toFixed(2)),
    target: parseFloat(target.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    upside: parseFloat(upside.toFixed(1)),
    downside: parseFloat(downside.toFixed(1)),
    riskReward: parseFloat(riskReward.toFixed(2)),
  }
}
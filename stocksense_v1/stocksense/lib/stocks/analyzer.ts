import type { Verdict, Grade, WhaleAction, StockAnalysis } from '@/lib/types';

interface AnalyzerInput {
  price: number;
  changePct: number;
  pe?: number;
  pbv?: number;
  roe?: number;
  divYield?: number;
  debtEq?: number;
  rsi?: number;
  macdSignal?: 'BUY' | 'SELL';
  volume?: number;
  avgVolume?: number;
}

export function analyzeStock(input: AnalyzerInput): StockAnalysis {
  let gradeScore = 0;

  if (input.pe !== undefined) {
    if (input.pe < 15) gradeScore += 2;
    else if (input.pe < 25) gradeScore += 1;
  }
  if (input.pbv !== undefined) {
    if (input.pbv < 1.5) gradeScore += 2;
    else if (input.pbv < 3) gradeScore += 1;
  }
  if (input.divYield !== undefined) {
    if (input.divYield > 4) gradeScore += 2;
    else if (input.divYield > 2) gradeScore += 1;
  }
  if (input.roe !== undefined) {
    if (input.roe > 20) gradeScore += 2;
    else if (input.roe > 12) gradeScore += 1;
  }
  if (input.debtEq !== undefined && input.debtEq < 1) gradeScore += 1;
  if (input.rsi !== undefined && input.rsi > 30 && input.rsi < 70) gradeScore += 1;

  const grade: Grade =
    gradeScore >= 8 ? 'A+' :
    gradeScore >= 6 ? 'A' :
    gradeScore >= 4 ? 'B+' :
    gradeScore >= 2 ? 'B' : 'C';

  const whaleAction: WhaleAction =
    input.volume && input.avgVolume
      ? input.volume > input.avgVolume * 1.5
        ? 'ACCUMULATING'
        : input.volume < input.avgVolume * 0.5
          ? 'DISTRIBUTING'
          : 'NEUTRAL'
      : 'NEUTRAL';

  let verdict: Verdict = 'WAIT';
  let reason = 'ยังไม่มีจังหวะชัดเจน';

  const rsi = input.rsi ?? 50;
  const macdSignal = input.macdSignal ?? 'SELL';

  if (gradeScore >= 6 && macdSignal === 'BUY' && rsi < 60 && whaleAction === 'ACCUMULATING') {
    verdict = 'STRONG_BUY';
    reason = 'พื้นฐานดี + Whale เก็บของ + MACD bullish';
  } else if (gradeScore >= 4 && macdSignal === 'BUY' && rsi < 65) {
    verdict = 'BUY';
    reason = 'สัญญาณเทคนิคเข้าทาง พื้นฐานยอมรับได้';
  } else if (rsi > 75 || whaleAction === 'DISTRIBUTING') {
    verdict = 'AVOID';
    reason = 'Overbought หรือ Whale กำลังขายออก';
  } else if (gradeScore < 3) {
    verdict = 'AVOID';
    reason = 'พื้นฐานอ่อนแอ มีตัวเลือกที่ดีกว่า';
  }

  const support = parseFloat((input.price * 0.95).toFixed(2));
  const target = parseFloat((input.price * 1.12).toFixed(2));
  const stopLoss = parseFloat((input.price * 0.93).toFixed(2));
  const upside = parseFloat((((target - input.price) / input.price) * 100).toFixed(1));
  const downside = parseFloat((((stopLoss - input.price) / input.price) * 100).toFixed(1));
  const riskReward = parseFloat(Math.abs(upside / downside).toFixed(2));

  const winRate = Math.round(
    Math.min(95, Math.max(20,
      50 + gradeScore * 4
      + (macdSignal === 'BUY' ? 8 : -8)
      + (whaleAction === 'ACCUMULATING' ? 10 : whaleAction === 'DISTRIBUTING' ? -12 : 0)
    ))
  );

  return {
    grade,
    gradeScore,
    verdict,
    reason,
    winRate,
    support,
    target,
    stopLoss,
    upside,
    downside,
    riskReward,
    whaleAction,
    rsi,
    macdSignal,
  };
}

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1));
}

// ═══════════════════════════════════════════════════════════════
// lib/smc.ts — Smart Money Flow (BOS/CHoCH + Liquidity)
// ═══════════════════════════════════════════════════════════════

interface PriceData {
  high: number
  low: number
  close: number
  volume: number
}

interface SMCResult {
  bos: boolean
  choch: boolean
  liquidity: boolean
  signal: 'BUY' | 'SELL' | 'NEUTRAL'
}

// Break of Structure detection
export function detectBOS(data: PriceData[], period: number = 5): boolean {
  if (data.length < period + 1) return false
  
  const recentHighs = data.slice(-period).map(d => d.high)
  const previousHigh = Math.max(...data.slice(-(period * 2), -period).map(d => d.high))
  const currentHigh = Math.max(...recentHighs)
  
  return currentHigh > previousHigh
}

// Change of Character detection
export function detectCHoCH(data: PriceData[], period: number = 5): boolean {
  if (data.length < period + 1) return false
  
  const recentLows = data.slice(-period).map(d => d.low)
  const previousLow = Math.min(...data.slice(-(period * 2), -period).map(d => d.low))
  const currentLow = Math.min(...recentLows)
  
  return currentLow < previousLow
}

// Liquidity detection
export function detectLiquidity(data: PriceData[], threshold: number = 2): boolean {
  if (data.length < 2) return false
  
  const currentVolume = data[data.length - 1].volume
  const avgVolume = data.slice(-10, -1).reduce((sum, d) => sum + d.volume, 0) / 9
  
  return currentVolume > avgVolume * threshold
}

// Main SMC analysis
export function analyzeSMC(data: PriceData[]): SMCResult {
  const bos = detectBOS(data)
  const choch = detectCHoCH(data)
  const liquidity = detectLiquidity(data)
  
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
  
  if (bos && liquidity) signal = 'BUY'
  else if (choch && liquidity) signal = 'SELL'
  
  return { bos, choch, liquidity, signal }
}
// ═══════════════════════════════════════════════════════════════
// lib/stocks/set.ts — หุ้นไทย (ใช้ Yahoo Finance)
// ═══════════════════════════════════════════════════════════════

export async function getThaiQuote(symbol: string) {
  const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BK`
  const res = await fetch(yahoo, {
    next: { revalidate: 60 },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const data = await res.json()
  const meta = data.chart?.result?.[0]?.meta
  if (!meta) return null

  return {
    symbol,
    exchange: 'SET',
    price: meta.regularMarketPrice,
    change: meta.regularMarketPrice - meta.previousClose,
    changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
  }
}
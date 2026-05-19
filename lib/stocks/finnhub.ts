// ═══════════════════════════════════════════════════════════════
// lib/stocks/finnhub.ts — ดึงราคาหุ้นต่างประเทศ
// ═══════════════════════════════════════════════════════════════

const FINNHUB_BASE = 'https://finnhub.io/api/v1'

export async function getQuote(symbol: string) {
  const url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  return {
    symbol,
    price: data.c,
    change: data.d,
    changePct: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    prevClose: data.pc,
  }
}

export async function getCompanyProfile(symbol: string) {
  const url = `${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
  const res = await fetch(url)
  return res.json()
}

export async function getFinancials(symbol: string) {
  const url = `${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${process.env.FINNHUB_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  const m = data.metric || {}
  return {
    pe: m.peBasicExclExtraTTM,
    pbv: m.pbAnnual,
    roe: m.roeTTM,
    eps: m.epsBasicExclExtraItemsTTM,
    divYield: m.currentDividendYieldTTM,
    debtEq: m.totalDebt2EquityAnnual,
    revenue: m.revenuePerShareAnnual,
  }
}
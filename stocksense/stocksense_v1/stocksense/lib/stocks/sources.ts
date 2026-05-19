import type { Exchange, StockQuote, StockFundamentals } from '@/lib/types';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

interface FetchOptions {
  revalidate?: number;
}

export async function getQuoteFromFinnhub(
  symbol: string,
  opts: FetchOptions = { revalidate: 60 }
): Promise<StockQuote | null> {
  try {
    const url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: opts.revalidate } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.c) return null;

    return {
      symbol,
      exchange: 'NASDAQ' as Exchange,
      price: data.c,
      change: data.d || 0,
      changePct: data.dp || 0,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
    };
  } catch (err) {
    console.error('Finnhub error:', err);
    return null;
  }
}

export async function getFundamentalsFromFinnhub(
  symbol: string
): Promise<StockFundamentals> {
  try {
    const url = `${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${process.env.FINNHUB_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const data = await res.json();
    const m = data.metric || {};

    return {
      pe: m.peBasicExclExtraTTM,
      pbv: m.pbAnnual,
      roe: m.roeTTM,
      eps: m.epsBasicExclExtraItemsTTM,
      divYield: m.currentDividendYieldTTM,
      debtEq: m.totalDebt2EquityAnnual,
    };
  } catch (err) {
    console.error('Finnhub fundamentals error:', err);
    return {};
  }
}

export async function getThaiQuoteFromYahoo(
  symbol: string,
  opts: FetchOptions = { revalidate: 60 }
): Promise<StockQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BK`;
    const res = await fetch(url, {
      next: { revalidate: opts.revalidate },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const change = meta.regularMarketPrice - meta.previousClose;
    return {
      symbol,
      exchange: 'SET' as Exchange,
      price: meta.regularMarketPrice,
      change,
      changePct: (change / meta.previousClose) * 100,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      prevClose: meta.previousClose,
    };
  } catch (err) {
    console.error('Yahoo error:', err);
    return null;
  }
}

export async function getStockQuote(
  symbol: string,
  exchange: Exchange
): Promise<StockQuote | null> {
  if (exchange === 'SET') return getThaiQuoteFromYahoo(symbol);
  return getQuoteFromFinnhub(symbol);
}

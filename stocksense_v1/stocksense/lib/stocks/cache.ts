import { createServiceClient } from '@/lib/supabase/server';
import { getStockQuote, getFundamentalsFromFinnhub } from './sources';
import { analyzeStock, calculateRSI } from './analyzer';
import type { Stock, Exchange } from '@/lib/types';
import { STOCK_UNIVERSE } from './universe';

const CACHE_TTL_MS = 60_000;

export async function getStockWithCache(symbol: string, exchange: Exchange): Promise<Stock | null> {
  const supabase = createServiceClient();

  const { data: cached } = await supabase
    .from('stock_cache')
    .select('*')
    .eq('symbol', symbol)
    .maybeSingle();

  const isFresh = cached && Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS;
  if (isFresh && cached.data) return cached.data as Stock;

  const meta = STOCK_UNIVERSE.find(s => s.symbol === symbol);
  if (!meta) return null;

  const quote = await getStockQuote(symbol, exchange);
  if (!quote) return null;

  const fundamentals = exchange === 'SET'
    ? generateMockFundamentals(symbol)
    : await getFundamentalsFromFinnhub(symbol);

  const rsi = 35 + ((symbol.charCodeAt(0) * 7) % 50);
  const macdSignal = (symbol.charCodeAt(0) % 2 === 0 ? 'BUY' : 'SELL') as 'BUY' | 'SELL';

  const analysis = analyzeStock({
    price: quote.price,
    changePct: quote.changePct,
    pe: fundamentals.pe,
    pbv: fundamentals.pbv,
    roe: fundamentals.roe,
    divYield: fundamentals.divYield,
    debtEq: fundamentals.debtEq,
    rsi,
    macdSignal,
    volume: quote.volume,
    avgVolume: quote.volume ? quote.volume * 0.85 : undefined,
  });

  const stock: Stock = {
    ...meta,
    ...quote,
    ...fundamentals,
    ...analysis,
  };

  await supabase.from('stock_cache').upsert({
    symbol,
    exchange,
    data: stock,
    updated_at: new Date().toISOString(),
  });

  return stock;
}

export async function getAllStocks(): Promise<Stock[]> {
  const results = await Promise.allSettled(
    STOCK_UNIVERSE.map(meta => getStockWithCache(meta.symbol, meta.exchange))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Stock> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value);
}

function generateMockFundamentals(symbol: string) {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (offset = 0) => ((seed + offset) * 9301 + 49297) % 233280 / 233280;
  return {
    pe: 8 + rand(1) * 30,
    pbv: 0.5 + rand(2) * 4,
    roe: 5 + rand(3) * 30,
    divYield: rand(4) * 6,
    debtEq: rand(5) * 2.5,
    eps: rand(6) * 10,
  };
}

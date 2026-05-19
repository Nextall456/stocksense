import { NextResponse } from 'next/server';
import { getAllStocks, getStockWithCache } from '@/lib/stocks/cache';
import { findStock } from '@/lib/stocks/universe';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  try {
    if (symbol) {
      const meta = findStock(symbol);
      if (!meta) {
        return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
      }
      const stock = await getStockWithCache(meta.symbol, meta.exchange);
      if (!stock) {
        return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
      }
      return NextResponse.json({ stock });
    }

    const stocks = await getAllStocks();
    return NextResponse.json({ stocks, count: stocks.length });
  } catch (err: any) {
    console.error('Stocks API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

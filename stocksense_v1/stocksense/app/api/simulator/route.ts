import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateSimulator } from '@/lib/simulator';
import { getStockWithCache } from '@/lib/stocks/cache';
import { findStock } from '@/lib/stocks/universe';

const schema = z.object({
  symbol: z.string().min(1).max(10),
  amount: z.number().min(100).max(10_000_000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { symbol, amount } = parsed.data;
    const meta = findStock(symbol);
    if (!meta) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }

    const stock = await getStockWithCache(meta.symbol, meta.exchange);
    if (!stock) {
      return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
    }

    const result = calculateSimulator(stock, amount);
    return NextResponse.json({ stock, simulation: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

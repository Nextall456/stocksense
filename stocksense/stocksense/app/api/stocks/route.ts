import { NextResponse } from 'next/server'
import { getQuote, getFinancials } from '@/lib/stocks/finnhub'
import { getThaiQuote } from '@/lib/stocks/set'
import { analyzeStock } from '@/lib/stocks/analyzer'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const exchange = searchParams.get('exchange') || 'NASDAQ'

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  try {
    // Fetch fresh data
    const quote = exchange === 'SET'
      ? await getThaiQuote(symbol)
      : await getQuote(symbol)

    if (!quote) {
      return NextResponse.json({ error: 'symbol not found' }, { status: 404 })
    }

    const financials = exchange === 'SET' ? {} : await getFinancials(symbol)

    const analysis = analyzeStock({
      price: quote.price,
      changePct: quote.changePct,
      ...financials,
      macdSignal: 'BUY',
      rsi: 50,
    })

    const result = { ...quote, ...financials, ...analysis }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { analyzeStock } from '@/lib/stocks/analyzer'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { price, changePct, pe, pbv, roe, divYield, debtEq, rsi, macdSignal, volume, avgVolume } = body

    const result = analyzeStock({
      price,
      changePct,
      pe,
      pbv,
      roe,
      divYield,
      debtEq,
      rsi,
      macdSignal,
      volume,
      avgVolume,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
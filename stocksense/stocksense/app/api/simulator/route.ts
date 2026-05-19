import { NextResponse } from 'next/server'
import { calculateSimulator, INVESTMENT_OPTIONS } from '@/lib/simulator'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { investment, buyPrice, targetPrice, stopLoss } = body

    const result = calculateSimulator({
      investment,
      buyPrice,
      targetPrice,
      stopLoss,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ options: INVESTMENT_OPTIONS })
}
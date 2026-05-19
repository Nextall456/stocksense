// ═══════════════════════════════════════════════════════════════
// lib/stocks/finnhub.ts — ดึงราคาหุ้นต่างประเทศ
// ═══════════════════════════════════════════════════════════════

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export async function getQuote(symbol: string) {
  const url = `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return {
    symbol,
    price: data.c,            // current
    change: data.d,           // change
    changePct: data.dp,       // change percent
    high: data.h,
    low: data.l,
    open: data.o,
    prevClose: data.pc,
  };
}

export async function getCompanyProfile(symbol: string) {
  const url = `${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  return res.json();
}

export async function getFinancials(symbol: string) {
  const url = `${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${process.env.FINNHUB_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  const m = data.metric || {};
  return {
    pe: m.peBasicExclExtraTTM,
    pbv: m.pbAnnual,
    roe: m.roeTTM,
    eps: m.epsBasicExclExtraItemsTTM,
    divYield: m.currentDividendYieldTTM,
    debtEq: m.totalDebt2EquityAnnual,
    revenue: m.revenuePerShareAnnual,
  };
}

// ═══════════════════════════════════════════════════════════════
// lib/stocks/set.ts — หุ้นไทย (ใช้ Yahoo Finance เป็น fallback)
// ═══════════════════════════════════════════════════════════════

export async function getThaiQuote(symbol: string) {
  // Option 1: Settrade Open API (ต้องสมัครฟรี)
  // https://developer.settrade.com/

  // Option 2: Yahoo Finance (ฟรี ใช้ได้เลย)
  const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BK`;
  const res = await fetch(yahoo, {
    next: { revalidate: 60 },
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await res.json();
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta) return null;

  return {
    symbol,
    exchange: 'SET',
    price: meta.regularMarketPrice,
    change: meta.regularMarketPrice - meta.previousClose,
    changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
  };
}

// ═══════════════════════════════════════════════════════════════
// lib/stocks/analyzer.ts — AI Verdict Logic
// ═══════════════════════════════════════════════════════════════

export type Verdict = 'STRONG_BUY' | 'BUY' | 'WAIT' | 'AVOID';

interface AnalyzerInput {
  price: number;
  changePct: number;
  pe?: number;
  pbv?: number;
  roe?: number;
  divYield?: number;
  debtEq?: number;
  rsi?: number;
  macdSignal?: 'BUY' | 'SELL';
  volume?: number;
  avgVolume?: number;
}

export function analyzeStock(input: AnalyzerInput) {
  let gradeScore = 0;

  if (input.pe && input.pe < 15) gradeScore += 2;
  else if (input.pe && input.pe < 25) gradeScore += 1;

  if (input.pbv && input.pbv < 1.5) gradeScore += 2;
  else if (input.pbv && input.pbv < 3) gradeScore += 1;

  if (input.divYield && input.divYield > 4) gradeScore += 2;
  else if (input.divYield && input.divYield > 2) gradeScore += 1;

  if (input.roe && input.roe > 20) gradeScore += 2;
  else if (input.roe && input.roe > 12) gradeScore += 1;

  if (input.debtEq && input.debtEq < 1) gradeScore += 1;
  if (input.rsi && input.rsi > 30 && input.rsi < 70) gradeScore += 1;

  const grade = gradeScore >= 8 ? 'A+' :
                gradeScore >= 6 ? 'A' :
                gradeScore >= 4 ? 'B+' :
                gradeScore >= 2 ? 'B' : 'C';

  // Whale detection (volume spike)
  const whaleAction = (input.volume && input.avgVolume)
    ? input.volume > input.avgVolume * 1.5 ? 'ACCUMULATING'
      : input.volume < input.avgVolume * 0.5 ? 'DISTRIBUTING'
      : 'NEUTRAL'
    : 'NEUTRAL';

  // Verdict
  let verdict: Verdict = 'WAIT';
  let reason = 'ยังไม่มีจังหวะชัดเจน';

  if (gradeScore >= 6 && input.macdSignal === 'BUY' && (input.rsi ?? 50) < 60 && whaleAction === 'ACCUMULATING') {
    verdict = 'STRONG_BUY';
    reason = 'พื้นฐานดี + Whale เก็บของ + MACD bullish';
  } else if (gradeScore >= 4 && input.macdSignal === 'BUY' && (input.rsi ?? 50) < 65) {
    verdict = 'BUY';
    reason = 'สัญญาณเทคนิคเข้าทาง พื้นฐานยอมรับได้';
  } else if ((input.rsi ?? 0) > 75 || whaleAction === 'DISTRIBUTING') {
    verdict = 'AVOID';
    reason = 'Overbought หรือ Whale กำลังขายออก';
  } else if (gradeScore < 3) {
    verdict = 'AVOID';
    reason = 'พื้นฐานอ่อนแอ';
  }

  // Price targets
  const support = input.price * 0.95;
  const target = input.price * 1.12;
  const stopLoss = input.price * 0.93;
  const upside = ((target - input.price) / input.price) * 100;
  const downside = ((stopLoss - input.price) / input.price) * 100;
  const riskReward = Math.abs(upside / downside);

  // Win Rate (heuristic)
  const winRate = Math.min(95, Math.max(20,
    50 + gradeScore * 4
    + (input.macdSignal === 'BUY' ? 8 : -8)
    + (whaleAction === 'ACCUMULATING' ? 10 : whaleAction === 'DISTRIBUTING' ? -12 : 0)
  ));

  return {
    grade,
    gradeScore,
    verdict,
    reason,
    winRate: Math.round(winRate),
    whaleAction,
    support: parseFloat(support.toFixed(2)),
    target: parseFloat(target.toFixed(2)),
    stopLoss: parseFloat(stopLoss.toFixed(2)),
    upside: parseFloat(upside.toFixed(1)),
    downside: parseFloat(downside.toFixed(1)),
    riskReward: parseFloat(riskReward.toFixed(2)),
  };
}

// ═══════════════════════════════════════════════════════════════
// app/api/stocks/route.ts — API Endpoint
// ═══════════════════════════════════════════════════════════════
// วางในไฟล์: app/api/stocks/route.ts
/*
import { NextResponse } from 'next/server';
import { getQuote, getFinancials } from '@/lib/stocks/finnhub';
import { getThaiQuote } from '@/lib/stocks/set';
import { analyzeStock } from '@/lib/stocks/analyzer';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // Check tier (free = limit)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const exchange = searchParams.get('exchange') || 'NASDAQ';

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  // Check cache (Supabase)
  const { data: cached } = await supabase
    .from('stock_cache')
    .select('*')
    .eq('symbol', symbol)
    .single();

  const isFresh = cached && (Date.now() - new Date(cached.updated_at).getTime() < 60000);
  if (isFresh) return NextResponse.json(cached.data);

  // Fetch fresh
  const quote = exchange === 'SET'
    ? await getThaiQuote(symbol)
    : await getQuote(symbol);

  const financials = exchange === 'SET' ? {} : await getFinancials(symbol);

  const analysis = analyzeStock({
    price: quote.price,
    changePct: quote.changePct,
    ...financials,
    macdSignal: 'BUY',  // TODO: compute from indicators
    rsi: 50,            // TODO: compute from indicators
  });

  const result = { ...quote, ...financials, ...analysis };

  // Update cache
  await supabase.from('stock_cache').upsert({
    symbol,
    exchange,
    data: result,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json(result);
}
*/

// ═══════════════════════════════════════════════════════════════
// app/api/waitlist/route.ts — เก็บ Lead จาก Landing Page
// ═══════════════════════════════════════════════════════════════
/*
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { lineId, email, phone } = body;

  if (!lineId && !email && !phone) {
    return NextResponse.json({ error: 'Need at least one contact' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from('waitlist').insert({
    line_id: lineId,
    email,
    phone,
    source: req.headers.get('referer') || 'direct',
    ip: req.headers.get('x-forwarded-for') || 'unknown',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ส่ง LINE notify ทันที (optional)
  // await sendLineWelcome(lineId);

  return NextResponse.json({ ok: true });
}
*/

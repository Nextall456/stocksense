export type Verdict = 'STRONG_BUY' | 'BUY' | 'WAIT' | 'AVOID';
export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C';
export type Exchange = 'SET' | 'NASDAQ' | 'NYSE' | 'HKEX' | 'KRX';
export type Tier = 'free' | 'pro' | 'elite';
export type WhaleAction = 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';

export interface StockBase {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector?: string;
}

export interface StockQuote {
  symbol: string;
  exchange: Exchange;
  price: number;
  change: number;
  changePct: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  volume?: number;
}

export interface StockFundamentals {
  pe?: number;
  pbv?: number;
  roe?: number;
  divYield?: number;
  debtEq?: number;
  eps?: number;
  revenue?: number;
  netProfit?: number;
}

export interface StockAnalysis {
  grade: Grade;
  gradeScore: number;
  verdict: Verdict;
  reason: string;
  winRate: number;
  support: number;
  target: number;
  stopLoss: number;
  upside: number;
  downside: number;
  riskReward: number;
  whaleAction: WhaleAction;
  rsi: number;
  macdSignal: 'BUY' | 'SELL';
}

export interface Stock extends StockBase, StockQuote, StockFundamentals, StockAnalysis {}

export interface Profile {
  id: string;
  line_user_id?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  tier: Tier;
  tier_expires_at?: string;
  created_at: string;
}

export interface WaitlistEntry {
  line_id?: string;
  email?: string;
  phone?: string;
}

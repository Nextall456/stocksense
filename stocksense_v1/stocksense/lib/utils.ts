import type { Grade, Verdict, Exchange } from './types';

export const GRADE_COLORS: Record<Grade, { bg: string; text: string; border: string }> = {
  'A+': { bg: 'bg-brand-800', text: 'text-white', border: 'border-brand-600' },
  'A': { bg: 'bg-brand-600', text: 'text-white', border: 'border-brand-400' },
  'B+': { bg: 'bg-brand-50', text: 'text-brand-800', border: 'border-brand-600' },
  'B': { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200' },
  'C': { bg: 'bg-white/5', text: 'text-white/60', border: 'border-white/10' },
};

export const VERDICT_LABELS: Record<Verdict, { label: string; bg: string; text: string }> = {
  STRONG_BUY: { label: '🔥 ซื้อแรง', bg: 'bg-brand-800', text: 'text-white' },
  BUY: { label: '✅ ซื้อได้', bg: 'bg-brand-50', text: 'text-brand-800' },
  WAIT: { label: '⏳ รอ', bg: 'bg-gold-bg', text: 'text-gold' },
  AVOID: { label: '⛔ หนี', bg: 'bg-loss-bg', text: 'text-loss' },
};

export function getCurrency(exchange: Exchange): string {
  return exchange === 'SET' ? '฿' : '$';
}

export function formatPrice(price: number, exchange: Exchange): string {
  const currency = getCurrency(exchange);
  return `${currency}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(pct: number, showSign = true): string {
  const sign = pct >= 0 && showSign ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

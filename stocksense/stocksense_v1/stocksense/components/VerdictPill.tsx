import type { Verdict } from '@/lib/types';

interface Props {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
}

const STYLES: Record<Verdict, { bg: string; color: string; label: string }> = {
  STRONG_BUY: { bg: 'linear-gradient(135deg, #0C447C 0%, #185FA5 100%)', color: '#FFFFFF', label: '🔥 ซื้อแรง' },
  BUY: { bg: '#E6F1FB', color: '#0C447C', label: '✅ ซื้อได้' },
  WAIT: { bg: '#FAEEDA', color: '#412402', label: '⏳ รอ' },
  AVOID: { bg: '#FCEBEB', color: '#791F1F', label: '⛔ หนี' },
};

const SIZES = {
  sm: { padding: '3px 9px', fontSize: 10 },
  md: { padding: '5px 12px', fontSize: 12 },
  lg: { padding: '8px 16px', fontSize: 14 },
};

export function VerdictPill({ verdict, size = 'md' }: Props) {
  const s = STYLES[verdict];
  const sz = SIZES[size];
  return (
    <span
      className="inline-flex items-center font-bold rounded-md whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.color,
        padding: sz.padding,
        fontSize: sz.fontSize,
        letterSpacing: '0.3px',
      }}
    >
      {s.label}
    </span>
  );
}

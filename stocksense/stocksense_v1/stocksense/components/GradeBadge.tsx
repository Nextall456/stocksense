import type { Grade } from '@/lib/types';

interface Props {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { box: 28, font: 9 },
  md: { box: 36, font: 11 },
  lg: { box: 44, font: 13 },
};

const COLORS: Record<Grade, { bg: string; border: string; text: string }> = {
  'A+': { bg: '#0C447C', border: '#185FA5', text: '#FFFFFF' },
  'A': { bg: '#185FA5', border: '#378ADD', text: '#FFFFFF' },
  'B+': { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
  'B': { bg: 'rgba(133,183,235,0.15)', border: '#85B7EB', text: '#185FA5' },
  'C': { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', text: '#78909C' },
};

export function GradeBadge({ grade, size = 'md' }: Props) {
  const s = SIZES[size];
  const c = COLORS[grade];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-mono font-bold flex-shrink-0"
      style={{
        width: s.box,
        height: s.box,
        fontSize: s.font,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.text,
        boxShadow: grade === 'A+' || grade === 'A' ? `0 0 12px ${c.border}44` : 'none',
      }}
    >
      {grade}
    </span>
  );
}

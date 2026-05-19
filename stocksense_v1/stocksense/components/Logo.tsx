interface Props {
  size?: number;
  variant?: 'full' | 'icon';
  reversed?: boolean;
}

export function Logo({ size = 32, variant = 'full', reversed = false }: Props) {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="StockSense">
        <rect width="64" height="64" rx="14" fill="#0C447C" />
        <ellipse cx="32" cy="32" rx="20" ry="13" fill="#185FA5" stroke="#85B7EB" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="7" fill="white" />
        <circle cx="32" cy="32" r="3" fill="#185FA5" />
        <polyline points="26,34 29,28 32,31 35,25 38,29" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const navy = reversed ? '#FFFFFF' : '#0C447C';
  const accent = reversed ? '#85B7EB' : '#378ADD';
  const eyeFill = reversed ? '#185FA5' : '#E6F1FB';
  const pupilFill = reversed ? '#FFFFFF' : '#185FA5';
  const innerEye = reversed ? '#185FA5' : '#E6F1FB';
  const chartStroke = reversed ? '#FFFFFF' : '#E6F1FB';

  return (
    <svg width={size * 6.875} height={size * 2} viewBox="0 0 220 64" xmlns="http://www.w3.org/2000/svg" aria-label="StockSense">
      <ellipse cx="32" cy="32" rx="22" ry="15" fill={eyeFill} stroke={accent} strokeWidth="1.5" />
      <circle cx="32" cy="32" r="8" fill={pupilFill} />
      <circle cx="32" cy="32" r="3.5" fill={innerEye} />
      <polyline points="26,35 29,29 32,33 35,27 38,30" fill="none" stroke={chartStroke} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="32" x2="10" y2="32" stroke={accent} strokeWidth="1" strokeDasharray="2,2" />
      <line x1="50" y1="32" x2="54" y2="32" stroke={accent} strokeWidth="1" strokeDasharray="2,2" />
      <text x="64" y="27" fontSize="18" fontWeight="600" fill={navy} fontFamily="system-ui, sans-serif" letterSpacing="-0.3">Stock</text>
      <text x="64" y="47" fontSize="18" fontWeight="300" fill={accent} fontFamily="system-ui, sans-serif" letterSpacing="-0.3">Sense</text>
    </svg>
  );
}

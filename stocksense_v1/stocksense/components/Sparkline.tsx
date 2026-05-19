interface Props {
  positive: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ positive, width = 80, height = 32 }: Props) {
  const points = Array.from({ length: 20 }, (_, i) => {
    const v = 30 + Math.sin(i * 0.8 + (positive ? 0 : Math.PI)) * 10
      + i * (positive ? 0.8 : -0.8)
      + Math.random() * 6;
    return `${i * (width / 20)},${height * 1.8 - v}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#1D9E75' : '#E24B4A'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

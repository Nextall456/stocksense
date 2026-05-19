// ═══════════════════════════════════════════════════════════════
// lib/whale-tracker.ts — Whale Tracker Logic
// ═══════════════════════════════════════════════════════════════

interface WhaleTransaction {
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  price: number
  timestamp: string
}

interface WhaleAlert {
  symbol: string
  type: 'ACCUMULATING' | 'DISTRIBUTING'
  volume: number
  inflow: number
  outflow: number
  netFlow: number
}

// Simulate whale detection based on volume spikes
export function detectWhaleActivity(
  currentVolume: number,
  avgVolume: number,
  priceChange: number
): WhaleAlert | null {
  const volumeRatio = currentVolume / avgVolume
  
  // Whale accumulating: high volume + price up
  if (volumeRatio > 1.5 && priceChange > 1) {
    return {
      symbol: '',
      type: 'ACCUMULATING',
      volume: currentVolume,
      inflow: currentVolume * 0.6,
      outflow: currentVolume * 0.4,
      netFlow: (currentVolume * 0.6) - (currentVolume * 0.4),
    }
  }
  
  // Whale distributing: high volume + price down
  if (volumeRatio > 1.5 && priceChange < -1) {
    return {
      symbol: '',
      type: 'DISTRIBUTING',
      volume: currentVolume,
      inflow: currentVolume * 0.3,
      outflow: currentVolume * 0.7,
      netFlow: (currentVolume * 0.3) - (currentVolume * 0.7),
    }
  }
  
  return null
}

// Format whale activity for display
export function formatWhaleAlert(alert: WhaleAlert): string {
  const emoji = alert.type === 'ACCUMULATING' ? '🐋 เงินใหญ่กำลังเก็บ' : '🐋 เงินใหญ่กำลังขาย'
  const flow = alert.netFlow > 0 ? 'เข้า' : 'ออก'
  return `${emoji} ${alert.symbol} - ${flow} ${Math.abs(alert.netFlow).toLocaleString()} หน่วย`
}
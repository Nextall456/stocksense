// ═══════════════════════════════════════════════════════════════
// lib/risk-shield.ts — Risk Shield Logic
// ═══════════════════════════════════════════════════════════════

interface RiskShieldInput {
  entryPrice: number
  stopLoss: number
  targetPrice: number
}

export function calculateRiskShield({ 
  entryPrice, 
  stopLoss, 
  targetPrice 
}: RiskShieldInput) {
  const riskPerShare = entryPrice - stopLoss
  const rewardPerShare = targetPrice - entryPrice
  const riskRewardRatio = rewardPerShare / riskPerShare
  
  const maxLossPercent = ((entryPrice - stopLoss) / entryPrice) * 100
  const maxGainPercent = ((targetPrice - entryPrice) / entryPrice) * 100
  
  return {
    riskPerShare: parseFloat(riskPerShare.toFixed(2)),
    rewardPerShare: parseFloat(rewardPerShare.toFixed(2)),
    riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
    maxLossPercent: parseFloat(maxLossPercent.toFixed(1)),
    maxGainPercent: parseFloat(maxGainPercent.toFixed(1)),
    isFavorableRR: riskRewardRatio >= 1.5,
  }
}

// Risk level classification
export function getRiskLevel(riskRewardRatio: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (riskRewardRatio >= 2) return 'LOW'
  if (riskRewardRatio >= 1.5) return 'MEDIUM'
  return 'HIGH'
}
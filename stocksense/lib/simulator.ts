// ═══════════════════════════════════════════════════════════════
// lib/simulator.ts — Money Simulator Logic
// ═══════════════════════════════════════════════════════════════

interface SimulatorInput {
  investment: number
  buyPrice: number
  targetPrice: number
  stopLoss: number
}

export function calculateSimulator({ 
  investment, 
  buyPrice, 
  targetPrice, 
  stopLoss 
}: SimulatorInput) {
  const quantity = Math.floor(investment / buyPrice)
  const totalInvestment = quantity * buyPrice
  
  const profitAtTarget = (targetPrice - buyPrice) * quantity
  const lossAtStopLoss = (buyPrice - stopLoss) * quantity
  
  const roiTarget = ((targetPrice - buyPrice) / buyPrice) * 100
  const roiStopLoss = ((stopLoss - buyPrice) / buyPrice) * 100
  
  return {
    quantity,
    totalInvestment,
    profitAtTarget,
    lossAtStopLoss,
    roiTarget: parseFloat(roiTarget.toFixed(1)),
    roiStopLoss: parseFloat(roiStopLoss.toFixed(1)),
    potentialReturn: totalInvestment + profitAtTarget,
    worstCase: totalInvestment - lossAtStopLoss,
  }
}

// Predefined investment amounts
export const INVESTMENT_OPTIONS = [5000, 10000, 50000, 100000]
import type { Stock } from '@/lib/types';

export interface SimulatorResult {
  shares: number;
  investCost: number;
  targetReturn: number;
  targetTotal: number;
  stopLossLoss: number;
  worstCase: number;
}

export function calculateSimulator(stock: Stock, amount: number): SimulatorResult {
  const shares = Math.floor(amount / stock.price);
  const investCost = shares * stock.price;
  const targetReturn = shares * (stock.target - stock.price);
  const stopLossLoss = shares * (stock.stopLoss - stock.price);
  const targetTotal = shares * stock.target;
  const worstCase = shares * stock.stopLoss;

  return {
    shares,
    investCost: parseFloat(investCost.toFixed(2)),
    targetReturn: parseFloat(targetReturn.toFixed(2)),
    targetTotal: parseFloat(targetTotal.toFixed(2)),
    stopLossLoss: parseFloat(stopLossLoss.toFixed(2)),
    worstCase: parseFloat(worstCase.toFixed(2)),
  };
}

export const INVESTMENT_PRESETS = [5000, 10000, 50000, 100000];

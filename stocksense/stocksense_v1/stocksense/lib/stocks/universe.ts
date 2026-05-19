import type { StockBase } from '@/lib/types';

export const THAI_STOCKS: StockBase[] = [
  { symbol: 'PTT', name: 'PTT PLC', sector: 'Energy', exchange: 'SET' },
  { symbol: 'AOT', name: 'Airports of Thailand', sector: 'Transport', exchange: 'SET' },
  { symbol: 'ADVANC', name: 'Advanced Info Service', sector: 'Telecom', exchange: 'SET' },
  { symbol: 'CPALL', name: 'CP All PLC', sector: 'Retail', exchange: 'SET' },
  { symbol: 'SCB', name: 'SCB Bank', sector: 'Finance', exchange: 'SET' },
  { symbol: 'KBANK', name: 'Kasikornbank', sector: 'Finance', exchange: 'SET' },
  { symbol: 'SCC', name: 'Siam Cement Group', sector: 'Industrial', exchange: 'SET' },
  { symbol: 'GULF', name: 'Gulf Energy Dev', sector: 'Energy', exchange: 'SET' },
  { symbol: 'MINT', name: 'Minor International', sector: 'Tourism', exchange: 'SET' },
  { symbol: 'IVL', name: 'Indorama Ventures', sector: 'Chemical', exchange: 'SET' },
];

export const INTL_STOCKS: StockBase[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc', sector: 'EV/Auto', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Social Media', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com', sector: 'E-Commerce', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', exchange: 'NASDAQ' },
  { symbol: 'TSM', name: 'TSMC', sector: 'Semiconductor', exchange: 'NYSE' },
];

export const STOCK_UNIVERSE: StockBase[] = [...THAI_STOCKS, ...INTL_STOCKS];

export function findStock(symbol: string): StockBase | undefined {
  return STOCK_UNIVERSE.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
}

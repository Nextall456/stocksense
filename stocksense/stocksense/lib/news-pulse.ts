// ═══════════════════════════════════════════════════════════════
// lib/news-pulse.ts — News Pulse Logic
// ═══════════════════════════════════════════════════════════════

interface NewsItem {
  id: string
  headline: string
  source: string
  sentiment: 'BULL' | 'BEAR' | 'NEUTRAL'
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: string
  symbol?: string
}

interface NewsSentiment {
  bullish: number
  bearish: number
  neutral: number
}

// Analyze news sentiment
export function analyzeNewsSentiment(news: NewsItem[]): NewsSentiment {
  const sentiment: NewsSentiment = { bullish: 0, bearish: 0, neutral: 0 }
  
  news.forEach(n => {
    if (n.sentiment === 'BULL') sentiment.bullish++
    else if (n.sentiment === 'BEAR') sentiment.bearish++
    else sentiment.neutral++
  })
  
  return sentiment
}

// Filter news by impact
export function filterNewsByImpact(news: NewsItem[], minImpact: 'HIGH' | 'MEDIUM' | 'LOW'): NewsItem[] {
  const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
  return news.filter(n => impactOrder[n.impact] >= impactOrder[minImpact])
}

// Get news for specific symbol
export function getNewsForSymbol(news: NewsItem[], symbol: string): NewsItem[] {
  return news.filter(n => n.symbol === symbol || !n.symbol)
}

// Mock news data for demonstration
export const mockNews: NewsItem[] = [
  {
    id: '1',
    headline: 'บริษัทใหม่ประกาศจ้างขึ้น ส่งผลต่อแนวโน้มราคา',
    source: 'SET News',
    sentiment: 'BULL',
    impact: 'HIGH',
    timestamp: new Date().toISOString(),
    symbol: 'PTT'
  },
  {
    id: '2',
    headline: 'เศรษฐกิจโลกชะลอตัว เสี่ยงต่อภาวะลงทุน',
    source: 'Financial Times',
    sentiment: 'BEAR',
    impact: 'HIGH',
    timestamp: new Date().toISOString(),
    symbol: 'GLOBAL'
  },
  {
    id: '3',
    headline: 'รายงานใหม่เปิดเผยแนวโน้มการลงทุน',
    source: 'Bloomberg',
    sentiment: 'NEUTRAL',
    impact: 'MEDIUM',
    timestamp: new Date().toISOString()
  }
]
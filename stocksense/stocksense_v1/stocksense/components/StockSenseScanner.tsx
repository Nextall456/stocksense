'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GradeBadge } from './GradeBadge';
import { VerdictPill } from './VerdictPill';
import { Sparkline } from './Sparkline';
import { Logo } from './Logo';
import { calculateSimulator, INVESTMENT_PRESETS } from '@/lib/simulator';
import { formatPrice, formatPct, getCurrency } from '@/lib/utils';
import type { Stock, Verdict } from '@/lib/types';

const VERDICT_ORDER: Record<Verdict, number> = {
  STRONG_BUY: 0,
  BUY: 1,
  WAIT: 2,
  AVOID: 3,
};

export function StockSenseScanner() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Stock | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'SET' | 'INTL' | 'BUY' | 'WHALE'>('ALL');
  const [sortBy, setSortBy] = useState<'verdict' | 'winrate' | 'upside'>('verdict');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'scanner' | 'top' | 'whale'>('scanner');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const tickRef = useRef(0);

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.stocks) {
        setStocks(data.stocks);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(() => {
      tickRef.current++;
      fetchStocks();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  const filtered = stocks
    .filter(s => {
      if (filter === 'SET') return s.exchange === 'SET';
      if (filter === 'INTL') return s.exchange !== 'SET';
      if (filter === 'BUY') return s.verdict === 'STRONG_BUY' || s.verdict === 'BUY';
      if (filter === 'WHALE') return s.whaleAction === 'ACCUMULATING';
      return true;
    })
    .filter(s => !search || s.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'verdict') {
        return VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] || b.winRate - a.winRate;
      }
      if (sortBy === 'winrate') return b.winRate - a.winRate;
      return b.upside - a.upside;
    });

  const stats = {
    total: stocks.length,
    strongBuy: stocks.filter(s => s.verdict === 'STRONG_BUY').length,
    buy: stocks.filter(s => s.verdict === 'BUY').length,
    whale: stocks.filter(s => s.whaleAction === 'ACCUMULATING').length,
    avoid: stocks.filter(s => s.verdict === 'AVOID').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060A0F', paddingRight: selected ? 380 : 0, transition: 'padding-right 0.3s' }}>
      <Header lastUpdate={lastUpdate} />
      <StatsBar stats={stats} />
      <Tabs tab={tab} onChange={setTab} />

      {loading && <LoadingState />}

      {!loading && tab === 'scanner' && (
        <>
          <Controls
            search={search} onSearch={setSearch}
            filter={filter} onFilter={setFilter}
            sortBy={sortBy} onSort={setSortBy}
          />
          <ScannerTable stocks={filtered} selected={selected} onSelect={setSelected} />
        </>
      )}

      {!loading && tab === 'top' && (
        <TopStocks stocks={stocks} onSelect={s => { setSelected(s); setTab('scanner'); }} />
      )}

      {!loading && tab === 'whale' && (
        <WhaleWatch stocks={stocks} onSelect={s => { setSelected(s); setTab('scanner'); }} />
      )}

      {selected && <DetailPanel stock={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Header({ lastUpdate }: { lastUpdate: Date | null }) {
  return (
    <div style={{
      padding: '18px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo variant="icon" size={32} />
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#378ADD', letterSpacing: 3 }}>
            STOCKSENSE
          </div>
          <div style={{ fontSize: 9, color: '#37474f', letterSpacing: 2 }}>
            สัมผัสตลาด · ก่อนที่ตลาดจะบอก
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {lastUpdate && (
          <span style={{ fontSize: 10, color: '#37474f' }}>
            {lastUpdate.toLocaleTimeString('th-TH')}
          </span>
        )}
        <span className="pulse-dot" style={{
          fontSize: 9, color: '#378ADD',
          background: 'rgba(55,138,221,0.1)',
          padding: '3px 8px', borderRadius: 4,
          border: '1px solid rgba(55,138,221,0.3)',
        }}>● LIVE</span>
      </div>
    </div>
  );
}

function StatsBar({ stats }: { stats: any }) {
  const items = [
    ['หุ้นทั้งหมด', stats.total, '#78909c'],
    ['🔥 Strong Buy', stats.strongBuy, '#378ADD'],
    ['✅ Buy', stats.buy, '#85B7EB'],
    ['🐋 Whale Buying', stats.whale, '#1D9E75'],
    ['⛔ Avoid', stats.avoid, '#E24B4A'],
  ] as const;

  return (
    <div style={{ padding: '12px 24px', display: 'flex', gap: 24, overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      {items.map(([label, val, color]) => (
        <div key={label} style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: '#37474f', marginBottom: 2 }}>{label}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, color, fontWeight: 700 }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

function Tabs({ tab, onChange }: { tab: string; onChange: (t: any) => void }) {
  const tabs = [
    ['scanner', '📡 สแกนหุ้น'],
    ['top', '🏆 หุ้นเด่น'],
    ['whale', '🐋 Whale Watch'],
  ] as const;
  return (
    <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex' }}>
      {tabs.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} style={{
          padding: '12px 20px', fontSize: 12, fontWeight: 600,
          background: 'none', border: 'none', cursor: 'pointer',
          color: tab === key ? '#378ADD' : '#546e7a',
          borderBottom: tab === key ? '2px solid #378ADD' : '2px solid transparent',
          fontFamily: 'inherit',
        }}>{label}</button>
      ))}
    </div>
  );
}

function Controls({ search, onSearch, filter, onFilter, sortBy, onSort }: any) {
  const filters: [string, string][] = [
    ['ALL', 'ทั้งหมด'], ['SET', 'ไทย'], ['INTL', 'ตปท.'], ['BUY', 'ซื้อ'], ['WHALE', '🐋'],
  ];
  return (
    <div style={{ padding: '14px 24px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        value={search} onChange={e => onSearch(e.target.value)}
        placeholder="🔍 ค้นหา..."
        style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#e8eaf6',
          outline: 'none', width: 160, fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        {filters.map(([f, label]) => (
          <button key={f} onClick={() => onFilter(f)} style={{
            padding: '6px 12px', fontSize: 11, borderRadius: 5,
            cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
            background: filter === f ? 'rgba(55,138,221,0.15)' : 'rgba(255,255,255,0.04)',
            border: filter === f ? '1px solid rgba(55,138,221,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: filter === f ? '#378ADD' : '#546e7a',
          }}>{label}</button>
        ))}
      </div>
      <select value={sortBy} onChange={e => onSort(e.target.value)} style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#78909c', outline: 'none',
        fontFamily: 'inherit',
      }}>
        <option value="verdict">AI Verdict</option>
        <option value="winrate">Win Rate</option>
        <option value="upside">Upside สูงสุด</option>
      </select>
    </div>
  );
}

function ScannerTable({ stocks, selected, onSelect }: any) {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 90px 1fr 80px 70px 90px 60px 36px',
        gap: 10, padding: '6px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {['เกรด', 'Symbol', 'ชื่อ', 'ราคา', 'กราฟ', 'Verdict', 'Win%', '🐋'].map(h => (
          <div key={h} style={{ fontSize: 9, color: '#37474f', fontWeight: 700, letterSpacing: 0.5 }}>{h}</div>
        ))}
      </div>
      {stocks.map((s: Stock) => (
        <StockRow key={s.symbol} stock={s} selected={selected?.symbol === s.symbol} onSelect={onSelect} />
      ))}
    </div>
  );
}

function StockRow({ stock, selected, onSelect }: { stock: Stock; selected: boolean; onSelect: (s: Stock) => void }) {
  const pos = stock.changePct >= 0;
  return (
    <div onClick={() => onSelect(stock)} style={{
      display: 'grid',
      gridTemplateColumns: '36px 90px 1fr 80px 70px 90px 60px 36px',
      gap: 10, padding: '10px 16px',
      alignItems: 'center',
      background: selected ? 'rgba(55,138,221,0.08)' : 'rgba(255,255,255,0.02)',
      borderLeft: selected ? '2px solid #378ADD' : '2px solid transparent',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      cursor: 'pointer', transition: 'background 0.15s',
    }}>
      <GradeBadge grade={stock.grade} />
      <div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: '#e8eaf6' }}>{stock.symbol}</div>
        <div style={{ fontSize: 9, color: '#546e7a' }}>{stock.exchange}</div>
      </div>
      <div style={{ fontSize: 10, color: '#78909c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {stock.name}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#e8eaf6' }}>
          {stock.price.toFixed(2)}
        </div>
        <div style={{ fontSize: 10, color: pos ? '#1D9E75' : '#E24B4A' }}>
          {pos ? '▲' : '▼'}{Math.abs(stock.changePct).toFixed(2)}%
        </div>
      </div>
      <Sparkline positive={pos} width={70} />
      <VerdictPill verdict={stock.verdict} size="sm" />
      <div style={{
        textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 11,
        color: stock.winRate > 65 ? '#1D9E75' : stock.winRate > 45 ? '#BA7517' : '#E24B4A',
      }}>{stock.winRate}%</div>
      {stock.whaleAction === 'ACCUMULATING'
        ? <div style={{ fontSize: 14, textAlign: 'center' }}>🐋</div>
        : <div />}
    </div>
  );
}

function TopStocks({ stocks, onSelect }: { stocks: Stock[]; onSelect: (s: Stock) => void }) {
  const top = stocks
    .filter(s => s.verdict === 'STRONG_BUY' || s.verdict === 'BUY')
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 8);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 13, color: '#546e7a', marginBottom: 16 }}>
        🏆 หุ้นเด่นวันนี้ — เรียงตาม Win Rate
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {top.map((s, i) => (
          <div key={s.symbol} onClick={() => onSelect(s)} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 18px',
            border: '1px solid rgba(55,138,221,0.15)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, color: 'rgba(55,138,221,0.4)', fontWeight: 700, width: 28 }}>
              #{i + 1}
            </div>
            <GradeBadge grade={s.grade} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#e8eaf6' }}>{s.symbol}</div>
              <div style={{ fontSize: 11, color: '#78909c' }}>{s.name}</div>
            </div>
            <VerdictPill verdict={s.verdict} size="sm" />
            <div style={{
              textAlign: 'center', background: 'rgba(29,158,117,0.1)',
              borderRadius: 8, padding: '6px 12px',
              border: '1px solid rgba(29,158,117,0.3)',
            }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, color: '#1D9E75', fontWeight: 700 }}>
                +{s.upside}%
              </div>
              <div style={{ fontSize: 8, color: '#546e7a' }}>Upside</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhaleWatch({ stocks, onSelect }: { stocks: Stock[]; onSelect: (s: Stock) => void }) {
  const whales = stocks.filter(s => s.whaleAction === 'ACCUMULATING');
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 13, color: '#546e7a', marginBottom: 16 }}>
        🐋 Whale Watch — เงินใหญ่กำลังเก็บ
      </div>
      {whales.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#546e7a', fontSize: 13 }}>
          ยังไม่มีหุ้นที่ Whale กำลังเก็บในขณะนี้
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {whales.map(s => (
          <div key={s.symbol} onClick={() => onSelect(s)} style={{
            background: 'rgba(29,158,117,0.04)', borderRadius: 10, padding: '14px 18px',
            border: '1px solid rgba(29,158,117,0.2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 22 }}>🐋</div>
            <GradeBadge grade={s.grade} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#e8eaf6' }}>
                {s.symbol} · {s.name}
              </div>
              <div style={{ fontSize: 10, color: '#78909c', marginTop: 2 }}>
                {formatPrice(s.price, s.exchange)} · Upside +{s.upside}%
              </div>
            </div>
            <VerdictPill verdict={s.verdict} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ stock, onClose }: { stock: Stock; onClose: () => void }) {
  const [amount, setAmount] = useState(10000);
  const pos = stock.changePct >= 0;
  const currency = getCurrency(stock.exchange);
  const sim = calculateSimulator(stock, amount);

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
      background: '#0D1117', borderLeft: '1px solid rgba(55,138,221,0.2)',
      overflowY: 'auto', zIndex: 100, padding: 24,
      boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.06)', border: 'none', color: '#90a4ae',
        width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16,
      }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <GradeBadge grade={stock.grade} size="lg" />
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color: '#e8eaf6' }}>{stock.symbol}</div>
          <div style={{ fontSize: 11, color: '#546e7a' }}>{stock.name} · {stock.exchange}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16, padding: 14, background: 'rgba(0,0,0,0.4)', borderRadius: 10, border: '1px solid rgba(55,138,221,0.15)' }}>
        <div style={{ fontSize: 9, color: '#546e7a', letterSpacing: 1, marginBottom: 8 }}>🤖 AI VERDICT</div>
        <VerdictPill verdict={stock.verdict} size="lg" />
        <div style={{ fontSize: 11, color: '#b0bec5', lineHeight: 1.5, marginTop: 8 }}>{stock.reason}</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${stock.winRate}%`, height: '100%',
              background: stock.winRate > 65 ? '#1D9E75' : stock.winRate > 45 ? '#BA7517' : '#E24B4A',
            }} />
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#e8eaf6', fontWeight: 700 }}>{stock.winRate}%</div>
        </div>
        <div style={{ fontSize: 9, color: '#37474f', marginTop: 4 }}>โอกาสกำไรประเมินโดย AI</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: pos ? '#1D9E75' : '#E24B4A' }}>
          {currency}{stock.price.toFixed(2)}
        </div>
        <div style={{ fontSize: 12, color: pos ? '#1D9E75' : '#E24B4A', marginTop: 2 }}>
          {pos ? '▲' : '▼'} {Math.abs(stock.changePct).toFixed(2)}% วันนี้
        </div>
      </div>

      <div style={{ background: 'rgba(55,138,221,0.05)', border: '1px solid rgba(55,138,221,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#378ADD', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
          💰 ถ้าซื้อตอนนี้ จะได้กลับเท่าไหร่?
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {INVESTMENT_PRESETS.map(v => (
            <button key={v} onClick={() => setAmount(v)} style={{
              flex: 1, padding: '6px 4px', fontSize: 10,
              background: amount === v ? 'rgba(55,138,221,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${amount === v ? 'rgba(55,138,221,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: amount === v ? '#378ADD' : '#78909c',
              borderRadius: 5, cursor: 'pointer',
              fontFamily: 'Space Mono, monospace',
            }}>
              {currency}{(v / 1000)}K
            </button>
          ))}
        </div>
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: 10 }}>
          <div style={{ fontSize: 9, color: '#546e7a' }}>ถ้าถึงเป้าหมาย ({currency}{stock.target})</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, color: '#1D9E75', fontWeight: 700, marginTop: 2 }}>
            +{currency}{sim.targetReturn.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: '#78909c', marginTop: 2 }}>
            ได้ {sim.shares.toLocaleString()} หุ้น · เงินรวม {currency}{sim.targetTotal.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(226,75,74,0.04)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#ff7676', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🛡️ RISK SHIELD</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#546e7a' }}>Stop Loss</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#E24B4A', marginTop: 2 }}>
              {currency}{stock.stopLoss}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#546e7a' }}>Entry</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#e8eaf6', marginTop: 2 }}>
              {currency}{stock.support}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#546e7a' }}>Target</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#1D9E75', marginTop: 2 }}>
              {currency}{stock.target}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#78909c' }}>Risk : Reward</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: stock.riskReward > 2 ? '#1D9E75' : '#BA7517', fontWeight: 700 }}>
            1 : {stock.riskReward}
          </span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🐋 WHALE TRACKER</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700,
            color: stock.whaleAction === 'ACCUMULATING' ? '#1D9E75' : stock.whaleAction === 'DISTRIBUTING' ? '#E24B4A' : '#78909c',
          }}>
            {stock.whaleAction === 'ACCUMULATING' ? '🟢 เก็บของ' : stock.whaleAction === 'DISTRIBUTING' ? '🔴 ขายออก' : '⚪ ปกติ'}
          </div>
          <div style={{ fontSize: 10, color: '#546e7a' }}>เงินใหญ่เคลื่อนไหว</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#546e7a', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>📊 งบการเงิน</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {([
          ['P/E', stock.pe?.toFixed(1), stock.pe && stock.pe < 15],
          ['P/BV', stock.pbv?.toFixed(2), stock.pbv && stock.pbv < 1.5],
          ['Div', stock.divYield ? `${stock.divYield.toFixed(2)}%` : '-', stock.divYield && stock.divYield > 4],
          ['ROE', stock.roe ? `${stock.roe.toFixed(1)}%` : '-', stock.roe && stock.roe > 15],
          ['D/E', stock.debtEq?.toFixed(2), stock.debtEq && stock.debtEq < 1],
          ['EPS', stock.eps ? `${currency}${stock.eps.toFixed(2)}` : '-', false],
        ] as const).map(([label, val, good]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '7px 9px' }}>
            <div style={{ fontSize: 9, color: '#546e7a' }}>{label}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: good ? '#1D9E75' : '#e8eaf6', marginTop: 2 }}>
              {val || '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: 80, color: '#546e7a' }}>
      <div style={{ fontSize: 14, marginBottom: 10 }}>กำลังโหลดข้อมูลหุ้น...</div>
      <div style={{ fontSize: 11, color: '#37474f' }}>
        ดึงข้อมูลจาก SET + NASDAQ + NYSE Realtime
      </div>
    </div>
  );
}

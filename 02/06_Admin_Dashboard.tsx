"use client";

// ═══════════════════════════════════════════════════════════════════
// 📊 AlphaScout — Admin Dashboard (Full Featured)
// ═══════════════════════════════════════════════════════════════════
//
// บอกอะไรได้บ้าง:
// ✓ MRR (Monthly Recurring Revenue) Realtime
// ✓ Active Users (Free / Pro / Elite)
// ✓ Conversion Funnel
// ✓ Revenue Chart
// ✓ Recent Signups
// ✓ Churn Rate
// ✓ Top Stocks (ที่คนค้นบ่อย)
// ✓ LINE Bot Stats
//
// วาง path: app/admin/page.tsx
// Protect ด้วย Auth + Admin role check
//
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

// ─── Mock Data (Replace with Supabase queries) ───────────────────
const MOCK_STATS = {
  mrr: 12450,
  mrrGrowth: 23.5,
  totalUsers: 1247,
  userGrowth: 18.3,
  paidUsers: 87,
  churnRate: 2.1,
  
  tierBreakdown: {
    free: 1160,
    pro: 73,
    elite: 14,
  },
  
  funnel: {
    visitors: 4280,
    signups: 1247,
    activated: 892,
    paid: 87,
  },
  
  revenueByMonth: [
    { month: 'พ.ย.', revenue: 2400 },
    { month: 'ธ.ค.', revenue: 4200 },
    { month: 'ม.ค.', revenue: 6800 },
    { month: 'ก.พ.', revenue: 8900 },
    { month: 'มี.ค.', revenue: 10200 },
    { month: 'เม.ย.', revenue: 12450 },
  ],
  
  recentSignups: [
    { name: 'คุณ A', email: 'a@email.com', tier: 'pro', date: '2 นาทีที่แล้ว' },
    { name: 'คุณ B', email: 'b@email.com', tier: 'free', date: '15 นาที' },
    { name: 'คุณ C', email: 'c@email.com', tier: 'pro', date: '1 ชม.' },
    { name: 'คุณ D', email: 'd@email.com', tier: 'elite', date: '2 ชม.' },
    { name: 'คุณ E', email: 'e@email.com', tier: 'free', date: '3 ชม.' },
  ],
  
  topStocks: [
    { symbol: 'NVDA', views: 1247, change: '+12.3%' },
    { symbol: 'PTT', views: 982, change: '+5.4%' },
    { symbol: 'AAPL', views: 856, change: '-1.2%' },
    { symbol: 'AOT', views: 742, change: '+8.7%' },
    { symbol: 'TSLA', views: 681, change: '-3.4%' },
  ],
  
  lineStats: {
    friends: 3245,
    activeWeekly: 2104,
    dailyPickOpenRate: 67.3,
    avgResponse: 8.2,
  },
};

// ─── Component ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // TODO: เชื่อม Supabase
  // useEffect(() => {
  //   async function fetchStats() {
  //     const res = await fetch(`/api/admin/stats?period=${period}`);
  //     setStats(await res.json());
  //   }
  //   fetchStats();
  //   const interval = setInterval(fetchStats, 30000);
  //   return () => clearInterval(interval);
  // }, [period]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e14',
      color: '#e8eaf6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: 24,
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: #1a2332; border-radius: 4px; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: '#546e7a', letterSpacing: 2, marginBottom: 4 }}>ADMIN DASHBOARD</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>🎯 AlphaScout Stats</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#546e7a' }}>
            อัปเดต {lastUpdated.toLocaleTimeString('th-TH')}
          </span>
          <div style={{ display: 'flex', gap: 4, background: '#1a2332', padding: 4, borderRadius: 8 }}>
            {(['24h', '7d', '30d', 'all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                background: period === p ? '#00ff9d' : 'transparent',
                color: period === p ? '#000' : '#90a4ae',
                border: 'none', borderRadius: 5, cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── METRIC CARDS (4 ใบ) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        <MetricCard
          icon="💰"
          label="MRR (Monthly Recurring)"
          value={`฿${stats.mrr.toLocaleString()}`}
          delta={`+${stats.mrrGrowth}%`}
          deltaColor="#00ff9d"
        />
        <MetricCard
          icon="👥"
          label="ผู้ใช้ทั้งหมด"
          value={stats.totalUsers.toLocaleString()}
          delta={`+${stats.userGrowth}%`}
          deltaColor="#00ff9d"
        />
        <MetricCard
          icon="⭐"
          label="ลูกค้าจ่ายเงิน"
          value={stats.paidUsers.toString()}
          delta={`${((stats.paidUsers / stats.totalUsers) * 100).toFixed(1)}% conv.`}
          deltaColor="#69f0ae"
        />
        <MetricCard
          icon="📉"
          label="Churn Rate"
          value={`${stats.churnRate}%`}
          delta="ต่ำกว่าค่าเฉลี่ย"
          deltaColor="#00ff9d"
        />
      </div>

      {/* ─── 2 COLUMNS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <Card title="📈 รายได้ 6 เดือนที่ผ่านมา">
          <RevenueChart data={stats.revenueByMonth} />
        </Card>

        {/* Tier Breakdown */}
        <Card title="📊 แบ่งตาม Tier">
          <TierBreakdown data={stats.tierBreakdown} />
        </Card>
      </div>

      {/* ─── FUNNEL ─── */}
      <Card title="🎯 Conversion Funnel">
        <ConversionFunnel data={stats.funnel} />
      </Card>

      {/* ─── 2 COLUMNS (Recent + Top Stocks) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
        {/* Recent Signups */}
        <Card title="🆕 สมัครล่าสุด">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recentSignups.map((user, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                fontSize: 13,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00ff9d, #00b86b)',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 700, color: '#000',
                }}>{user.name[user.name.length-1]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: '#78909c' }}>{user.email}</div>
                </div>
                <TierBadge tier={user.tier} />
                <div style={{ fontSize: 10, color: '#546e7a', minWidth: 60, textAlign: 'right' }}>{user.date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Stocks */}
        <Card title="🔥 หุ้นที่คนค้นมากสุด">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.topStocks.map((stock, i) => (
              <div key={stock.symbol} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
              }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: 14, color: '#00ff9d',
                  fontWeight: 700, minWidth: 30,
                }}>#{i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{stock.symbol}</div>
                  <div style={{ fontSize: 10, color: '#78909c' }}>{stock.views.toLocaleString()} views</div>
                </div>
                <div style={{
                  fontSize: 12, fontFamily: 'monospace',
                  color: stock.change.startsWith('+') ? '#00ff9d' : '#ff5252',
                }}>{stock.change}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── LINE BOT STATS ─── */}
      <div style={{ marginTop: 24 }}>
        <Card title="🤖 LINE Bot Stats">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            <BotStat
              label="LINE Friends"
              value={stats.lineStats.friends.toLocaleString()}
              hint="คนที่ Add แล้ว"
            />
            <BotStat
              label="Active รายสัปดาห์"
              value={stats.lineStats.activeWeekly.toLocaleString()}
              hint={`${((stats.lineStats.activeWeekly / stats.lineStats.friends) * 100).toFixed(0)}% engagement`}
            />
            <BotStat
              label="Daily Pick Open"
              value={`${stats.lineStats.dailyPickOpenRate}%`}
              hint="Push อ่านอัตรา"
            />
            <BotStat
              label="ตอบเฉลี่ย"
              value={`${stats.lineStats.avgResponse} วิ`}
              hint="ความเร็ว Bot"
            />
          </div>
        </Card>
      </div>

      {/* ─── ACTION BUTTONS ─── */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <ActionButton icon="📢" label="ส่ง Broadcast" onClick={() => alert('Broadcast modal')} />
        <ActionButton icon="📊" label="Export Data" onClick={() => alert('Export CSV')} />
        <ActionButton icon="📧" label="ส่ง Email Campaign" onClick={() => alert('Email modal')} />
        <ActionButton icon="⚙️" label="ตั้งค่าระบบ" onClick={() => alert('Settings')} />
      </div>
    </div>
  );
}

// ─── Sub Components ──────────────────────────────────────────────

function MetricCard({ icon, label, value, delta, deltaColor }: any) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#78909c', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: deltaColor }}>↗ {delta}</div>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{ fontSize: 13, color: '#90a4ae', fontWeight: 600, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, padding: '10px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, color: '#90a4ae', fontFamily: 'monospace' }}>
            ฿{(d.revenue/1000).toFixed(1)}K
          </div>
          <div style={{
            width: '100%',
            height: `${(d.revenue / max) * 160}px`,
            background: 'linear-gradient(180deg, #00ff9d 0%, #00b86b 100%)',
            borderRadius: '6px 6px 0 0',
            boxShadow: '0 0 12px rgba(0,255,157,0.3)',
            transition: 'height 0.3s',
          }} />
          <div style={{ fontSize: 11, color: '#78909c' }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function TierBreakdown({ data }: any) {
  const total = data.free + data.pro + data.elite;
  const tiers = [
    { name: 'FREE', count: data.free, color: '#78909c' },
    { name: 'PRO', count: data.pro, color: '#00ff9d' },
    { name: 'ELITE', count: data.elite, color: '#ffca28' },
  ];
  return (
    <div>
      {/* Stacked bar */}
      <div style={{
        height: 10, borderRadius: 5, overflow: 'hidden',
        display: 'flex', marginBottom: 16,
      }}>
        {tiers.map(t => (
          <div key={t.name} style={{
            width: `${(t.count / total) * 100}%`,
            background: t.color,
          }} />
        ))}
      </div>
      {tiers.map(t => (
        <div key={t.name} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#78909c' }}>
              {((t.count / total) * 100).toFixed(1)}%
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: t.color }}>
              {t.count.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversionFunnel({ data }: any) {
  const steps = [
    { label: 'เข้าเว็บไซต์', value: data.visitors, percent: 100 },
    { label: 'สมัครสมาชิก (Signup)', value: data.signups, percent: (data.signups / data.visitors) * 100 },
    { label: 'ใช้งานครั้งแรก', value: data.activated, percent: (data.activated / data.visitors) * 100 },
    { label: 'จ่ายเงิน (Paid)', value: data.paid, percent: (data.paid / data.visitors) * 100 },
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {steps.map((step, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: '#e8eaf6' }}>{step.label}</span>
            <span style={{ color: '#78909c' }}>
              <strong style={{ color: '#fff' }}>{step.value.toLocaleString()}</strong>
              {' '}<span style={{ color: i === 0 ? '#78909c' : '#00ff9d' }}>({step.percent.toFixed(1)}%)</span>
            </span>
          </div>
          <div style={{
            height: 28,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${step.percent}%`,
              height: '100%',
              background: `linear-gradient(90deg, #00ff9d, #00b86b)`,
              opacity: 1 - (i * 0.15),
              transition: 'width 0.5s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: any = {
    free: { bg: 'rgba(120,144,156,0.15)', color: '#90a4ae' },
    pro: { bg: 'rgba(0,255,157,0.15)', color: '#00ff9d' },
    elite: { bg: 'rgba(255,202,40,0.15)', color: '#ffca28' },
  };
  const s = styles[tier];
  return (
    <span style={{
      padding: '3px 10px', fontSize: 10, fontWeight: 700,
      background: s.bg, color: s.color, borderRadius: 4,
      letterSpacing: 1, textTransform: 'uppercase',
    }}>{tier}</span>
  );
}

function BotStat({ label, value, hint }: any) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: 11, color: '#78909c', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#00ff9d', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#546e7a' }}>{hint}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      padding: '12px 20px',
      background: 'rgba(0,255,157,0.08)',
      border: '1px solid rgba(0,255,157,0.2)',
      color: '#00ff9d',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span>{icon}</span>
      {label}
    </button>
  );
}

/*
═══════════════════════════════════════════════════════════════════
📚 API Endpoints ที่ต้องสร้าง (Server Side)
═══════════════════════════════════════════════════════════════════

// app/api/admin/stats/route.ts
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  
  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  // MRR
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'successful')
    .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());
  const mrr = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Total Users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Paid Users
  const { count: paidUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('tier', ['pro', 'elite']);

  // Tier Breakdown
  const { data: tiers } = await supabase
    .from('profiles')
    .select('tier');
  const tierBreakdown = tiers?.reduce((acc, t) => {
    acc[t.tier] = (acc[t.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent Signups
  const { data: recentSignups } = await supabase
    .from('profiles')
    .select('display_name, email, tier, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return Response.json({
    mrr, totalUsers, paidUsers,
    tierBreakdown,
    recentSignups,
    // ... more stats
  });
}

═══════════════════════════════════════════════════════════════════
🛡️ Auth Protection (middleware.ts)
═══════════════════════════════════════════════════════════════════

// ใน middleware.ts เพิ่มการเช็ค admin role
if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!user) return NextResponse.redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'admin') {
    return NextResponse.redirect('/dashboard');
  }
}

═══════════════════════════════════════════════════════════════════
*/

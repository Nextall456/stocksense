import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAllStocks } from '@/lib/stocks/cache';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const stocks = await getAllStocks();
    const dailyPick = stocks
      .filter(s => s.verdict === 'STRONG_BUY')
      .sort((a, b) => b.winRate - a.winRate)[0];

    if (!dailyPick) {
      return NextResponse.json({ ok: false, reason: 'No strong buy today' });
    }

    const supabase = createServiceClient();
    const { data: users } = await supabase
      .from('profiles')
      .select('line_user_id')
      .in('tier', ['pro', 'elite'])
      .not('line_user_id', 'is', null);

    const userIds = users?.map(u => u.line_user_id).filter(Boolean) as string[];

    if (userIds.length > 0 && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      const message = {
        type: 'text',
        text: `🎁 Daily Pick วันนี้: ${dailyPick.symbol}\n\n` +
              `Win Rate ${dailyPick.winRate}% · Upside +${dailyPick.upside}%\n` +
              `ราคาเข้า ${dailyPick.exchange === 'SET' ? '฿' : '$'}${dailyPick.support}\n` +
              `เป้าหมาย ${dailyPick.exchange === 'SET' ? '฿' : '$'}${dailyPick.target}\n\n` +
              `เปิด StockSense → ${process.env.NEXT_PUBLIC_APP_URL}/liff`,
      };

      for (let i = 0; i < userIds.length; i += 500) {
        const batch = userIds.slice(i, i + 500);
        await fetch('https://api.line.me/v2/bot/message/multicast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ to: batch, messages: [message] }),
        }).catch(err => console.error('LINE push error:', err));
      }
    }

    return NextResponse.json({
      ok: true,
      pick: dailyPick.symbol,
      sent: userIds.length,
    });
  } catch (err: any) {
    console.error('Daily pick cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

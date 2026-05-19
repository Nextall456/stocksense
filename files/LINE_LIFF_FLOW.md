# 📱 AlphaScout — LINE LIFF Flow Design

## 🎯 ทำไมต้อง LINE?

**ลูกค้าไทย 54+ ล้านคนอยู่บน LINE** — ถ้าทำใน LINE ลูกค้าไม่ต้อง:
- ❌ ดาวน์โหลด App
- ❌ สร้างบัญชีใหม่
- ❌ จำรหัสผ่าน
- ❌ กรอกข้อมูลซ้ำ

แค่กดเข้าจากแชท → ใช้งานได้ทันที (Auto Login)

---

## 🗺️ Customer Journey แบบเต็ม

```
                    ┌──────────────────┐
                    │  TikTok / FB     │
                    │  Content ปั่น    │
                    └────────┬─────────┘
                             │  ลิงก์ใน Bio
                             ↓
                    ┌──────────────────┐
                    │  Landing Page    │  ← (1) เก็บ Lead
                    │  alphascout.app  │
                    └────────┬─────────┘
                             │  Add LINE Friend
                             ↓
        ┌────────────────────┴────────────────────┐
        │                                          │
        ↓                                          ↓
┌──────────────────┐                    ┌──────────────────┐
│  Greeting Bot    │                    │  Rich Menu       │
│  ส่ง PDF ฟรี      │                    │  ปุ่ม 6 ปุ่ม      │
│  + ปุ่มเปิด App   │                    │  เด้งตลอด         │
└────────┬─────────┘                    └────────┬─────────┘
         │                                        │
         └────────────────┬───────────────────────┘
                          ↓
                ┌──────────────────┐
                │  LIFF App        │  ← (2) ใช้งานหลัก
                │  AlphaScout      │
                │  (เปิดใน LINE)   │
                └────────┬─────────┘
                         │
                         ├─→ สแกนหุ้น (ฟรี 5 ตัว/วัน)
                         ├─→ ตั้งแจ้งเตือน
                         ├─→ ดู Daily Pick
                         │
                         ↓
                ┌──────────────────┐
                │  Hit Limit       │  ← (3) Upsell
                │  → Upgrade Pro   │
                └────────┬─────────┘
                         │  LINE Pay / Omise
                         ↓
                ┌──────────────────┐
                │  Pro Active      │
                │  + Push ทุกวัน   │
                └──────────────────┘
```

---

## 🎨 Rich Menu Design (เมนูใต้แชท)

```
┌─────────────────────────────────────────┐
│                                          │
│   🎯 เปิด AlphaScout      🎁 หุ้นเด่นวันนี้  │
│      (LIFF)                (Bot reply)   │
│                                          │
│   🐋 Whale Watch          🔔 ตั้งเตือน    │
│      (Bot reply)           (LIFF)        │
│                                          │
│   📞 ติดต่อทีม            ⭐ อัปเกรด Pro  │
│      (Chat)                (LIFF Pay)    │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🤖 Auto Reply (Greeting + Keywords)

### Welcome Message (ทันทีที่ Add Friend)
```
สวัสดีครับ ยินดีต้อนรับสู่ AlphaScout 🎯

🎁 ของขวัญต้อนรับ:
• PDF "หุ้นเด่นประจำสัปดาห์" → กดเลย
• สิทธิ์ Founding Member ฿199/เดือนตลอดชีพ

👇 กดปุ่มเมนูด้านล่างเพื่อเริ่มใช้งาน
```

### Keyword Triggers
| คำที่ลูกค้าพิมพ์ | Bot ตอบ |
|----------------|---------|
| `หุ้นเด่น` / `daily pick` | ส่ง Flex Message หุ้นเด่นวันนี้ |
| `whale` / `เงินใหญ่` | ส่ง Top 5 หุ้นที่ Whale กำลังเก็บ |
| `ราคา PTT` | ดึง API → ส่งราคา + AI Verdict |
| `upgrade` / `pro` | ส่งลิงก์ LIFF Pricing |
| `help` / `วิธีใช้` | ส่งวิดีโอสอน 60 วินาที |

---

## 🔧 Setup LINE ใน 30 นาที

### 1. สมัคร LINE Developers
```
1. https://developers.line.biz/console/
2. Create Provider
3. Create Channel → "Messaging API"
   → ได้ Channel Access Token + Channel Secret
4. Create Channel → "LINE Login"
   → ได้ Channel ID สำหรับ LIFF
```

### 2. สร้าง LIFF App
```
1. ใน LINE Login channel → LIFF Tab
2. Add LIFF
3. ตั้งค่า:
   - Endpoint URL: https://alphascout.app/liff
   - Scope: profile, openid
   - Bot link feature: On (Aggressive)
4. ได้ LIFF ID: 1234567890-xxxxxx
```

### 3. ใส่ Rich Menu
```bash
# Upload Rich Menu image (2500x1686 px)
curl -X POST https://api.line.me/v2/bot/richmenu \
  -H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @richmenu.json
```

---

## 💻 Code: LIFF Integration

### `app/liff/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import AlphaScout from '@/components/AlphaScout';

export default function LiffPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
          withLoginOnExternalBrowser: true,
        });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setUser(profile);

        // Sync to Supabase
        await fetch('/api/auth/line-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          }),
        });

        setLoading(false);
      } catch (err) {
        console.error('LIFF init failed:', err);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060a0f',
        display: 'grid',
        placeItems: 'center',
        color: '#00ff9d',
        fontFamily: 'monospace',
      }}>
        🎯 กำลังเข้าสู่ระบบ...
      </div>
    );
  }

  return <AlphaScout user={user} />;
}
```

### `app/api/auth/line-sync/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { lineUserId, displayName, pictureUrl } = await req.json();
  const supabase = await createServerSupabase();

  // Upsert profile by LINE user ID
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      line_user_id: lineUserId,
      display_name: displayName,
      avatar_url: pictureUrl,
    }, { onConflict: 'line_user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
```

### `app/api/webhook/line/route.ts` (Bot Reply)
```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const LINE_API = 'https://api.line.me/v2/bot/message/reply';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-line-signature') || '';

  // Verify signature
  const hash = crypto
    .createHmac('sha256', process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest('base64');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { events } = JSON.parse(body);

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.toLowerCase();
      await replyToUser(event.replyToken, text);
    }

    // Welcome new friend
    if (event.type === 'follow') {
      await sendWelcomeFlex(event.replyToken);
    }
  }

  return NextResponse.json({ ok: true });
}

async function replyToUser(replyToken: string, text: string) {
  let messages: any[] = [];

  if (text.includes('หุ้นเด่น') || text.includes('daily')) {
    messages = [createDailyPickFlex()];
  } else if (text.includes('whale') || text.includes('เงินใหญ่')) {
    messages = [{ type: 'text', text: '🐋 หุ้น Top 5 ที่ Whale กำลังเก็บ:\n\n1. NVDA +12.3M\n2. PTT +8.4M\n...\n\nดูทั้งหมด → กดเมนู AlphaScout' }];
  } else if (text.includes('upgrade') || text.includes('pro')) {
    messages = [{
      type: 'text',
      text: '⭐ อัปเกรดเป็น Pro\n\nสิทธิพิเศษ Founding Member:\n• ฿199/เดือนตลอดชีพ (ปกติ ฿599)\n• เหลือเพียง 73 ที่นั่ง\n\nกดเลย → https://alphascout.app/upgrade'
    }];
  } else {
    messages = [{ type: 'text', text: 'พิมพ์ "หุ้นเด่น" เพื่อดูหุ้นน่าสนใจวันนี้\nหรือกดเมนูด้านล่าง 👇' }];
  }

  await fetch(LINE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

function createDailyPickFlex() {
  return {
    type: 'flex',
    altText: '🎁 หุ้นเด่นวันนี้',
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#00ff9d',
        paddingAll: 'lg',
        contents: [
          { type: 'text', text: '🎁 DAILY PICK', size: 'xs', color: '#000', weight: 'bold' },
          { type: 'text', text: 'NVDA', size: 'xxl', weight: 'bold', color: '#000', margin: 'sm' },
          { type: 'text', text: 'NVIDIA Corp · NASDAQ', size: 'xs', color: '#000000aa' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [
          { type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'AI Verdict', size: 'sm', color: '#999' },
            { type: 'text', text: '🔥 ซื้อแรง', size: 'sm', weight: 'bold', color: '#00b86b', align: 'end' },
          ]},
          { type: 'separator', margin: 'md' },
          { type: 'box', layout: 'horizontal', margin: 'md', contents: [
            { type: 'text', text: 'ราคา', size: 'sm', color: '#999' },
            { type: 'text', text: '$487.23', size: 'sm', weight: 'bold', align: 'end' },
          ]},
          { type: 'box', layout: 'horizontal', margin: 'sm', contents: [
            { type: 'text', text: 'เป้าหมาย', size: 'sm', color: '#999' },
            { type: 'text', text: '$576.50', size: 'sm', weight: 'bold', align: 'end', color: '#00b86b' },
          ]},
          { type: 'box', layout: 'horizontal', margin: 'sm', contents: [
            { type: 'text', text: 'Upside', size: 'sm', color: '#999' },
            { type: 'text', text: '+18.4%', size: 'sm', weight: 'bold', align: 'end', color: '#00b86b' },
          ]},
          { type: 'box', layout: 'horizontal', margin: 'sm', contents: [
            { type: 'text', text: 'Win Rate', size: 'sm', color: '#999' },
            { type: 'text', text: '87%', size: 'sm', weight: 'bold', align: 'end' },
          ]},
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#00b86b',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียดเต็ม →',
              uri: 'https://alphascout.app/liff?symbol=NVDA',
            },
          },
        ],
      },
    },
  };
}

async function sendWelcomeFlex(replyToken: string) {
  // Welcome message + PDF + Rich content
  // ...
}
```

### `lib/line/push.ts` — Push แจ้งเตือนหุ้นเข้าเกณฑ์
```typescript
// เรียกจาก Cron Job ทุก 5 นาที
export async function pushStockAlert(lineUserId: string, stock: any) {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{
        type: 'flex',
        altText: `🔥 ${stock.symbol} เข้าเกณฑ์!`,
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '🔥 STRONG BUY ALERT', size: 'xs', color: '#00b86b', weight: 'bold' },
              { type: 'text', text: stock.symbol, size: 'xxl', weight: 'bold', margin: 'sm' },
              { type: 'text', text: `Win Rate ${stock.winRate}% · Upside +${stock.upside}%`, size: 'sm', margin: 'sm', color: '#666' },
            ],
          },
        },
      }],
    }),
  });
}
```

---

## ⏰ Cron Jobs (Vercel Cron)

### `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-pick",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/check-alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### `app/api/cron/daily-pick/route.ts`
```typescript
// ทุกวันตอน 8 โมงเช้า → ส่ง Daily Pick ไปยังลูกค้า Pro ทุกคน
import { createServerSupabase } from '@/lib/supabase/server';
import { pushStockAlert } from '@/lib/line/push';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerSupabase();
  const { data: proUsers } = await supabase
    .from('profiles')
    .select('line_user_id')
    .in('tier', ['pro', 'elite']);

  const dailyPick = { symbol: 'NVDA', winRate: 87, upside: 18.4 };

  for (const user of proUsers || []) {
    if (user.line_user_id) {
      await pushStockAlert(user.line_user_id, dailyPick);
    }
  }

  return Response.json({ sent: proUsers?.length || 0 });
}
```

---

## 🎁 Bonus: LINE Pay Integration (ทางเลือก)

ลูกค้าจ่ายผ่าน LINE Pay ได้เลย ไม่ต้องออกจาก LINE

```typescript
// app/api/pay/line-pay/route.ts
export async function POST(req: Request) {
  const { amount, productName } = await req.json();

  const orderRes = await fetch('https://api-pay.line.me/v3/payments/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID!,
      'X-LINE-Authorization-Nonce': crypto.randomUUID(),
      'X-LINE-Authorization': '...', // HMAC signature
    },
    body: JSON.stringify({
      amount,
      currency: 'THB',
      orderId: crypto.randomUUID(),
      packages: [{
        id: 'pkg-pro',
        amount,
        products: [{ name: productName, quantity: 1, price: amount }],
      }],
      redirectUrls: {
        confirmUrl: 'https://alphascout.app/pay/success',
        cancelUrl: 'https://alphascout.app/pay/cancel',
      },
    }),
  });

  return Response.json(await orderRes.json());
}
```

---

## 🚀 Action Plan

| สัปดาห์ | งาน |
|---------|-----|
| **W1** | สมัคร LINE Dev + สร้าง Channel + LIFF |
| **W1** | ออกแบบ Rich Menu (Canva ฟรี) |
| **W2** | Deploy Landing Page → เก็บ Lead |
| **W2** | Setup Auto Reply + Keywords |
| **W3** | Deploy LIFF App (AlphaScout) |
| **W3** | Test Push Notification |
| **W4** | Setup LINE Pay + Pricing |
| **W4** | Soft Launch ใน LINE OA |

---

## 📊 KPI ที่ต้องวัด

| Metric | เป้าหมายเดือนแรก |
|--------|------------------|
| Add Friend | 500 คน |
| Active LIFF Users | 200 คน/วัน |
| Daily Pick Open Rate | > 60% |
| Pro Conversion | 5% (= 25 คน) |
| MRR | ฿4,975 |

เมื่อ MRR เกิน ฿20,000 → ขยายเป็น Native App

# 🚀 AlphaScout — Next.js + Supabase Deploy Guide

## 📁 โครงสร้างโปรเจกต์

```
alphascout/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page (/)
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login (LINE/Email)
│   │   └── callback/route.ts         # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard layout
│   │   ├── page.tsx                  # Scanner หลัก (AlphaScout component)
│   │   ├── watchlist/page.tsx        # Watchlist ส่วนตัว
│   │   ├── alerts/page.tsx           # ตั้งค่าแจ้งเตือน
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── stocks/route.ts           # GET /api/stocks → ดึงราคาหุ้น
│   │   ├── stocks/[symbol]/route.ts  # GET /api/stocks/PTT
│   │   ├── analyze/route.ts          # POST → AI Verdict
│   │   ├── waitlist/route.ts         # POST → เก็บ Lead
│   │   ├── line-notify/route.ts      # POST → ส่ง LINE
│   │   └── webhook/
│   │       ├── line/route.ts         # LINE webhook
│   │       └── omise/route.ts        # Payment webhook
│   └── liff/                         # LINE LIFF Mini App
│       └── page.tsx
├── components/
│   ├── AlphaScout.tsx                # Main Scanner (จาก artifact)
│   ├── ui/
│   │   ├── GradeBadge.tsx
│   │   ├── VerdictPill.tsx
│   │   └── Sparkline.tsx
│   └── auth/
│       └── LineLoginButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts
│   ├── stocks/
│   │   ├── set.ts                    # SET API
│   │   ├── finnhub.ts                # International stocks
│   │   └── analyzer.ts               # AI logic
│   ├── line/
│   │   ├── liff.ts
│   │   └── notify.ts
│   └── utils.ts
├── middleware.ts                     # Auth middleware
├── .env.local                        # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔧 Setup ใน 10 นาที

### 1. สร้างโปรเจกต์
```bash
npx create-next-app@latest alphascout --typescript --tailwind --app
cd alphascout

# ติดตั้ง packages
npm install @supabase/supabase-js @supabase/ssr
npm install @line/liff
npm install lucide-react
npm install zod
npm install -D @types/node
```

### 2. สร้าง Supabase Project
1. ไปที่ https://supabase.com → New Project
2. เลือก Region: **Singapore** (ใกล้ไทยที่สุด)
3. Copy:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 3. Environment Variables (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Stock APIs
FINNHUB_API_KEY=xxx           # finnhub.io (ฟรี 60 req/min)
ALPHA_VANTAGE_KEY=xxx         # backup

# LINE
LINE_LIFF_ID=1234567890-xxxxxx
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx

# Payment (สำหรับ Production)
OMISE_PUBLIC_KEY=pkey_xxx
OMISE_SECRET_KEY=skey_xxx

# AI (Optional)
ANTHROPIC_API_KEY=sk-ant-xxx
```

---

## 🗄️ Supabase Database Schema

รัน SQL นี้ใน Supabase SQL Editor:

```sql
-- ผู้ใช้
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free','pro','elite')),
  tier_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Waitlist (เก็บ Lead จาก Landing Page)
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Watchlist
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- ตั้งค่าแจ้งเตือน
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  condition TEXT,  -- 'price_above', 'verdict_change', 'whale_buy'
  target_value NUMERIC,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cache ราคาหุ้น (ลดการเรียก API)
CREATE TABLE stock_cache (
  symbol TEXT PRIMARY KEY,
  exchange TEXT,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ประวัติการชำระเงิน
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount NUMERIC,
  currency TEXT DEFAULT 'THB',
  tier TEXT,
  status TEXT,
  provider TEXT,
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users CRUD own watchlist" ON watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users CRUD own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 🚀 Deploy ขึ้น Vercel ใน 3 นาที

```bash
# 1. Push code ขึ้น GitHub
git init
git add .
git commit -m "Initial AlphaScout"
git remote add origin https://github.com/yourname/alphascout.git
git push -u origin main

# 2. ไปที่ vercel.com → Import Project → Select Repo
# 3. ใส่ Environment Variables (copy จาก .env.local)
# 4. Deploy → เสร็จ!
```

---

## 💰 ค่าใช้จ่ายเริ่มต้น (ต่อเดือน)

| Service | Free Tier | ใช้จริงเริ่มต้น |
|---------|-----------|----------------|
| Vercel | 100GB | ฟรี |
| Supabase | 500MB DB | ฟรี |
| Finnhub | 60 req/min | ฟรี |
| SET API | ดู Settrade Open API | ฟรี |
| LINE Official | 1,000 msg/เดือน | ฟรี |
| Domain (.com) | - | ~฿350/ปี |
| **รวม** | | **~฿30/เดือน** |

เมื่อมีผู้ใช้ Pro 50 คน (50 × 199 = 9,950฿) คุณจะคุ้มทุนทันที

---

## 🎯 ขั้นตอนถัดไป

1. ดาวน์โหลดไฟล์ทั้งหมดจากด้านล่าง
2. ทำตาม Setup ข้างบน
3. เอาโค้ด `AlphaScout` (artifact ก่อนหน้า) มาวางใน `components/AlphaScout.tsx`
4. ทดสอบ → Deploy

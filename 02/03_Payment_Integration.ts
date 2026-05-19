// ═══════════════════════════════════════════════════════════════════
// 💳 AlphaScout — Payment Integration ครบชุด
// ═══════════════════════════════════════════════════════════════════
//
// รองรับ 2 ช่องทาง:
// 1. Omise — สำหรับลูกค้าทั่วไป (Credit Card / PromptPay / TrueMoney)
// 2. LINE Pay — สำหรับลูกค้าใน LINE (สะดวกที่สุด)
//
// ═══════════════════════════════════════════════════════════════════

/* ┌─────────────────────────────────────────────────────────────┐ */
/* │                    SETUP & PREPARATION                      │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── 1. สมัคร Omise ─────────────────────────────────────────────
// 1. https://www.omise.co/th
// 2. สมัคร → ยืนยันธุรกิจ → ได้ Dashboard
// 3. เก็บ Keys:
//    - PUBLIC_KEY (pkey_test_xxx / pkey_xxx)
//    - SECRET_KEY (skey_test_xxx / skey_xxx)
// 4. Test ก่อนด้วย Test Mode → Production เมื่อพร้อม

// ─── 2. สมัคร LINE Pay ─────────────────────────────────────────
// 1. https://pay.line.me/developers/
// 2. สมัคร Merchant Account
// 3. ได้:
//    - Channel ID
//    - Channel Secret Key
// 4. Sandbox URL: https://sandbox-api-pay.line.me
// 5. Production URL: https://api-pay.line.me

// ─── 3. ติดตั้ง packages ───────────────────────────────────────
// npm install omise
// npm install axios
// npm install crypto-js


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │              .env.local — Environment Variables             │ */
/* └─────────────────────────────────────────────────────────────┘ */

const ENV_EXAMPLE = `
# Omise
OMISE_PUBLIC_KEY=pkey_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx

# LINE Pay
LINE_PAY_CHANNEL_ID=1234567890
LINE_PAY_SECRET_KEY=xxxxxxxxxxxxx
LINE_PAY_API_URL=https://sandbox-api-pay.line.me

# App
NEXT_PUBLIC_APP_URL=https://alphascout.app
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │                 PRICING & PRODUCTS                           │ */
/* └─────────────────────────────────────────────────────────────┘ */

// lib/payment/products.ts
export const PRODUCTS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'AlphaScout Pro - Monthly',
    name_th: 'AlphaScout Pro รายเดือน',
    amount: 199,  // ฿199
    currency: 'THB',
    interval: 'monthly',
    tier: 'pro',
    is_founding: true,
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'AlphaScout Pro - Yearly',
    name_th: 'AlphaScout Pro รายปี',
    amount: 1990,  // ฿1,990 (= 10 เดือน ฟรี 2 เดือน)
    currency: 'THB',
    interval: 'yearly',
    tier: 'pro',
  },
  elite_monthly: {
    id: 'elite_monthly',
    name: 'AlphaScout Elite - Monthly',
    name_th: 'AlphaScout Elite รายเดือน',
    amount: 599,
    currency: 'THB',
    interval: 'monthly',
    tier: 'elite',
  },
};

export type ProductId = keyof typeof PRODUCTS;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │                   1. OMISE INTEGRATION                       │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── lib/payment/omise.ts ──────────────────────────────────────
import Omise from 'omise';

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

export async function createOmiseCharge({
  amount,
  source,  // จาก Omise.js (Tokenized)
  customer,
  description,
  metadata,
}: {
  amount: number;
  source: string;
  customer?: string;
  description: string;
  metadata: Record<string, any>;
}) {
  const charge = await omise.charges.create({
    amount: amount * 100,  // Omise ใช้ Satang (1 บาท = 100 satang)
    currency: 'thb',
    source,
    customer,
    description,
    metadata,
    return_uri: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  });

  return charge;
}

export async function createOmiseCustomer({
  email,
  description,
}: { email: string; description?: string }) {
  return omise.customers.create({ email, description });
}

// PromptPay QR Code
export async function createPromptPaySource(amount: number) {
  return omise.sources.create({
    type: 'promptpay',
    amount: amount * 100,
    currency: 'thb',
  });
}

// TrueMoney Wallet
export async function createTrueMoneySource(amount: number, phone: string) {
  return omise.sources.create({
    type: 'truemoney',
    amount: amount * 100,
    currency: 'thb',
    phone_number: phone,
  });
}


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │           OMISE API ROUTES — Next.js                         │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── app/api/payment/omise/charge/route.ts ────────────────────
/*
import { NextResponse } from 'next/server';
import { createOmiseCharge } from '@/lib/payment/omise';
import { PRODUCTS } from '@/lib/payment/products';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { productId, token, email } = await req.json();

    const product = PRODUCTS[productId];
    if (!product) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Create Omise Charge
    const charge = await createOmiseCharge({
      amount: product.amount,
      source: token,
      description: product.name,
      metadata: {
        user_id: user.id,
        product_id: productId,
        tier: product.tier,
      },
    });

    // Save to database
    await supabase.from('payments').insert({
      user_id: user.id,
      amount: product.amount,
      tier: product.tier,
      status: charge.status,
      provider: 'omise',
      provider_id: charge.id,
    });

    // ถ้าจ่ายผ่านบัตรเครดิตสำเร็จเลย
    if (charge.status === 'successful') {
      const expires = new Date();
      if (product.interval === 'monthly') expires.setMonth(expires.getMonth() + 1);
      else expires.setFullYear(expires.getFullYear() + 1);

      await supabase
        .from('profiles')
        .update({
          tier: product.tier,
          tier_expires_at: expires.toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      charge_id: charge.id,
      status: charge.status,
      authorize_uri: charge.authorize_uri,  // สำหรับ 3D Secure
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
*/

// ─── app/api/payment/omise/webhook/route.ts ───────────────────
/*
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Omise will POST here when charge status changes
export async function POST(req: Request) {
  const event = await req.json();

  // Verify signature (Omise webhook signature)
  const signature = req.headers.get('omise-signature');
  // TODO: Verify

  if (event.key === 'charge.complete') {
    const charge = event.data;
    const userId = charge.metadata.user_id;
    const productId = charge.metadata.product_id;

    const supabase = await createServerSupabase();

    // Update payment record
    await supabase
      .from('payments')
      .update({ status: charge.status })
      .eq('provider_id', charge.id);

    // Activate subscription if successful
    if (charge.status === 'successful') {
      const product = PRODUCTS[productId];
      const expires = new Date();
      if (product.interval === 'monthly') expires.setMonth(expires.getMonth() + 1);
      else expires.setFullYear(expires.getFullYear() + 1);

      await supabase
        .from('profiles')
        .update({
          tier: product.tier,
          tier_expires_at: expires.toISOString(),
        })
        .eq('id', userId);

      // Send LINE notification
      // await sendLineUpgradeConfirm(userId);
    }
  }

  return NextResponse.json({ ok: true });
}
*/


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │            OMISE CHECKOUT PAGE — React Component             │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── app/checkout/page.tsx ────────────────────────────────────
const CHECKOUT_PAGE = `
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

declare global { interface Window { Omise: any; OmiseCard: any; } }

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product') || 'pro_monthly';
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Omise.js
    const script = document.createElement('script');
    script.src = 'https://cdn.omise.co/omise.js.gz';
    script.onload = () => {
      window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
      window.OmiseCard.configure({
        publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
        currency: 'THB',
        frameLabel: 'AlphaScout',
        submitLabel: 'จ่ายเลย',
        buttonLabel: 'ชำระเงิน',
      });
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = () => {
    setLoading(true);
    window.OmiseCard.open({
      amount: 19900,  // 199 บาท in satang
      onCreateTokenSuccess: async (token: string) => {
        const res = await fetch('/api/payment/omise/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, token }),
        });
        const data = await res.json();

        if (data.authorize_uri) {
          // 3D Secure
          window.location.href = data.authorize_uri;
        } else if (data.success) {
          router.push('/payment/success');
        } else {
          alert('ชำระเงินไม่สำเร็จ: ' + data.error);
        }
        setLoading(false);
      },
      onFormClosed: () => setLoading(false),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a0f] text-white p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">อัปเกรดเป็น Pro</h1>
        <p className="text-white/60 mb-6">ปลดล็อกฟีเจอร์ทั้งหมด</p>

        <div className="bg-gradient-to-br from-[#00ff9d]/10 to-transparent border border-[#00ff9d]/30 rounded-xl p-6 mb-6">
          <div className="text-xs text-[#00ff9d] tracking-widest mb-2">FOUNDING MEMBER</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#00ff9d]">฿199</span>
            <span className="text-white/40">/เดือน · ตลอดชีพ</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>✓ สแกนหุ้นไม่จำกัด</li>
            <li>✓ Whale Tracker + Smart Money</li>
            <li>✓ Money Simulator</li>
            <li>✓ LINE แจ้งเตือนทุกวัน</li>
          </ul>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#00ff9d] to-[#00b86b] text-black disabled:opacity-50"
        >
          {loading ? 'กำลังประมวลผล...' : 'ชำระเงิน ฿199'}
        </button>

        <p className="text-xs text-white/40 mt-4 text-center">
          🔒 ปลอดภัย 100% · เข้ารหัสโดย Omise<br/>
          คืนเงิน 100% ภายใน 7 วันถ้าไม่พอใจ
        </p>
      </div>
    </div>
  );
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │                  2. LINE PAY INTEGRATION                     │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── lib/payment/linepay.ts ────────────────────────────────────
const LINE_PAY_CODE = `
import crypto from 'crypto';

const LINE_PAY_URL = process.env.LINE_PAY_API_URL || 'https://sandbox-api-pay.line.me';
const CHANNEL_ID = process.env.LINE_PAY_CHANNEL_ID!;
const CHANNEL_SECRET = process.env.LINE_PAY_SECRET_KEY!;

// สร้าง HMAC Signature สำหรับ LINE Pay
function createSignature(uri: string, body: string, nonce: string): string {
  const message = CHANNEL_SECRET + uri + body + nonce;
  return crypto
    .createHmac('sha256', CHANNEL_SECRET)
    .update(message)
    .digest('base64');
}

export async function requestLinePayment({
  amount,
  productName,
  orderId,
  userId,
}: {
  amount: number;
  productName: string;
  orderId: string;
  userId: string;
}) {
  const uri = '/v3/payments/request';
  const nonce = crypto.randomUUID();

  const body = {
    amount,
    currency: 'THB',
    orderId,
    packages: [{
      id: 'pkg_' + Date.now(),
      amount,
      name: productName,
      products: [{
        name: productName,
        quantity: 1,
        price: amount,
        imageUrl: 'https://alphascout.app/logo.png',
      }],
    }],
    redirectUrls: {
      confirmUrl: \`\${process.env.NEXT_PUBLIC_APP_URL}/api/payment/linepay/confirm\`,
      cancelUrl: \`\${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel\`,
    },
    options: {
      payment: {
        payType: 'NORMAL',
      },
    },
  };

  const bodyStr = JSON.stringify(body);
  const signature = createSignature(uri, bodyStr, nonce);

  const res = await fetch(LINE_PAY_URL + uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': CHANNEL_ID,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    },
    body: bodyStr,
  });

  return res.json();
}

export async function confirmLinePayment({
  transactionId,
  amount,
}: { transactionId: string; amount: number }) {
  const uri = \`/v3/payments/\${transactionId}/confirm\`;
  const nonce = crypto.randomUUID();
  const body = { amount, currency: 'THB' };
  const bodyStr = JSON.stringify(body);
  const signature = createSignature(uri, bodyStr, nonce);

  const res = await fetch(LINE_PAY_URL + uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': CHANNEL_ID,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
    },
    body: bodyStr,
  });

  return res.json();
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │            LINE PAY API ROUTES                               │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── app/api/payment/linepay/request/route.ts ─────────────────
const LINE_PAY_REQUEST = `
import { NextResponse } from 'next/server';
import { requestLinePayment } from '@/lib/payment/linepay';
import { PRODUCTS } from '@/lib/payment/products';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { productId } = await req.json();
  const product = PRODUCTS[productId];
  if (!product) return NextResponse.json({ error: 'Invalid product' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orderId = \`AS-\${Date.now()}-\${user.id.slice(0, 8)}\`;

  // Save pending payment
  await supabase.from('payments').insert({
    user_id: user.id,
    amount: product.amount,
    tier: product.tier,
    status: 'pending',
    provider: 'linepay',
    provider_id: orderId,
  });

  const result = await requestLinePayment({
    amount: product.amount,
    productName: product.name_th,
    orderId,
    userId: user.id,
  });

  if (result.returnCode === '0000') {
    return NextResponse.json({
      paymentUrl: result.info.paymentUrl.web,
      mobileUrl: result.info.paymentUrl.app,
      transactionId: result.info.transactionId,
    });
  }

  return NextResponse.json({ error: result.returnMessage }, { status: 500 });
}
`;

// ─── app/api/payment/linepay/confirm/route.ts ─────────────────
const LINE_PAY_CONFIRM = `
import { NextResponse } from 'next/server';
import { confirmLinePayment } from '@/lib/payment/linepay';
import { createServerSupabase } from '@/lib/supabase/server';
import { PRODUCTS } from '@/lib/payment/products';

// LINE redirects user here after payment authorization
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get('transactionId')!;
  const orderId = searchParams.get('orderId')!;

  const supabase = await createServerSupabase();

  // Get pending payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('provider_id', orderId)
    .single();

  if (!payment) {
    return NextResponse.redirect(\`\${process.env.NEXT_PUBLIC_APP_URL}/payment/error\`);
  }

  // Confirm with LINE Pay
  const result = await confirmLinePayment({
    transactionId,
    amount: payment.amount,
  });

  if (result.returnCode === '0000') {
    // Success! Activate subscription
    const product = Object.values(PRODUCTS).find(p => p.tier === payment.tier);
    const expires = new Date();
    if (product?.interval === 'monthly') expires.setMonth(expires.getMonth() + 1);
    else expires.setFullYear(expires.getFullYear() + 1);

    await supabase
      .from('profiles')
      .update({
        tier: payment.tier,
        tier_expires_at: expires.toISOString(),
      })
      .eq('id', payment.user_id);

    await supabase
      .from('payments')
      .update({ status: 'successful' })
      .eq('id', payment.id);

    return NextResponse.redirect(\`\${process.env.NEXT_PUBLIC_APP_URL}/payment/success\`);
  }

  return NextResponse.redirect(\`\${process.env.NEXT_PUBLIC_APP_URL}/payment/error\`);
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │         LINE PAY CHECKOUT BUTTON — From LIFF                │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── components/LinePayButton.tsx ─────────────────────────────
const LINE_PAY_BUTTON = `
'use client';

import { useState } from 'react';
import liff from '@line/liff';

export function LinePayButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);

    const res = await fetch('/api/payment/linepay/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    const { paymentUrl, mobileUrl } = await res.json();

    // ถ้าอยู่ใน LINE → ใช้ mobile URL
    if (liff.isInClient()) {
      liff.openWindow({ url: mobileUrl, external: false });
    } else {
      window.location.href = paymentUrl;
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full py-4 rounded-xl font-bold bg-[#00b900] text-white"
    >
      {loading ? 'กำลังเตรียม...' : '🟢 จ่ายด้วย LINE Pay'}
    </button>
  );
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │            UNIFIED PAYMENT PAGE (มีทุก method)              │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── app/upgrade/page.tsx ────────────────────────────────────
const UPGRADE_PAGE = `
'use client';

import { useState } from 'react';
import { LinePayButton } from '@/components/LinePayButton';

export default function UpgradePage() {
  const [method, setMethod] = useState<'card' | 'linepay' | 'promptpay'>('card');
  const [productId, setProductId] = useState('pro_monthly');

  return (
    <div className="min-h-screen bg-[#060a0f] text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">อัปเกรด Pro</h1>

        {/* Plan Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setProductId('pro_monthly')}
            className={\`p-4 rounded-xl border \${productId === 'pro_monthly' ? 'border-[#00ff9d] bg-[#00ff9d]/10' : 'border-white/10'}\`}
          >
            <div className="text-xs text-white/60">รายเดือน</div>
            <div className="text-2xl font-bold">฿199</div>
            <div className="text-xs">/เดือน</div>
          </button>
          <button
            onClick={() => setProductId('pro_yearly')}
            className={\`p-4 rounded-xl border \${productId === 'pro_yearly' ? 'border-[#00ff9d] bg-[#00ff9d]/10' : 'border-white/10'}\`}
          >
            <div className="text-xs text-[#ffca28]">รายปี ประหยัด 17%</div>
            <div className="text-2xl font-bold">฿1,990</div>
            <div className="text-xs">/ปี</div>
          </button>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <h2 className="text-sm text-white/60">เลือกวิธีชำระเงิน</h2>

          <button onClick={() => setMethod('linepay')}
            className={\`w-full p-4 rounded-xl border flex items-center gap-3 \${method === 'linepay' ? 'border-[#00b900]' : 'border-white/10'}\`}>
            <span className="text-2xl">🟢</span>
            <div className="text-left flex-1">
              <div className="font-bold">LINE Pay</div>
              <div className="text-xs text-white/60">สะดวกสุด · ใช้เครดิตในไลน์</div>
            </div>
          </button>

          <button onClick={() => setMethod('card')}
            className={\`w-full p-4 rounded-xl border flex items-center gap-3 \${method === 'card' ? 'border-[#00ff9d]' : 'border-white/10'}\`}>
            <span className="text-2xl">💳</span>
            <div className="text-left flex-1">
              <div className="font-bold">บัตรเครดิต / เดบิต</div>
              <div className="text-xs text-white/60">Visa · Master · JCB</div>
            </div>
          </button>

          <button onClick={() => setMethod('promptpay')}
            className={\`w-full p-4 rounded-xl border flex items-center gap-3 \${method === 'promptpay' ? 'border-[#00ff9d]' : 'border-white/10'}\`}>
            <span className="text-2xl">📱</span>
            <div className="text-left flex-1">
              <div className="font-bold">PromptPay</div>
              <div className="text-xs text-white/60">สแกน QR Code</div>
            </div>
          </button>
        </div>

        {/* Pay Button */}
        <div className="mt-6">
          {method === 'linepay' && <LinePayButton productId={productId} />}
          {/* TODO: Card & PromptPay buttons */}
        </div>
      </div>
    </div>
  );
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │              SUBSCRIPTION RENEWAL CRON                      │ */
/* └─────────────────────────────────────────────────────────────┘ */

// ─── app/api/cron/check-subscriptions/route.ts ─────────────────
// รันทุกวันตอนเที่ยงคืน → เช็คใครหมดอายุ → Downgrade เป็น Free
const SUBSCRIPTION_CRON = `
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = await createServerSupabase();
  const now = new Date().toISOString();

  // หา users ที่หมดอายุ
  const { data: expired } = await supabase
    .from('profiles')
    .select('id, line_user_id')
    .lt('tier_expires_at', now)
    .not('tier', 'eq', 'free');

  for (const user of expired || []) {
    // Downgrade
    await supabase
      .from('profiles')
      .update({ tier: 'free', tier_expires_at: null })
      .eq('id', user.id);

    // Notify via LINE
    if (user.line_user_id) {
      await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.LINE_CHANNEL_ACCESS_TOKEN}\`,
        },
        body: JSON.stringify({
          to: user.line_user_id,
          messages: [{
            type: 'text',
            text: 'แพ็คเกจ Pro ของคุณหมดอายุแล้ว\\n\\n🎁 ต่ออายุตอนนี้รับโบนัสฟรี 7 วัน\\nhttps://alphascout.app/upgrade',
          }],
        }),
      });
    }
  }

  return Response.json({ expired: expired?.length || 0 });
}
`;


/* ┌─────────────────────────────────────────────────────────────┐ */
/* │                  COMPARISON TABLE                            │ */
/* └─────────────────────────────────────────────────────────────┘ */

const COMPARISON = `
| Feature           | Omise               | LINE Pay              |
|-------------------|---------------------|-----------------------|
| ค่าธรรมเนียม      | 3.65% + 10฿/ครั้ง   | 3% + ไม่มี Setup Fee  |
| Setup             | ปานกลาง             | ง่ายกว่า               |
| ลูกค้าจ่ายผ่าน    | บัตร, PromptPay,    | LINE App, LINE Pay,   |
|                   | TrueMoney, Tesco    | บัตรที่ผูกใน LINE      |
| Recurring         | รองรับ              | รองรับ                 |
| ใช้ใน LIFF       | ได้ แต่ออกจาก LINE | ดีที่สุด               |
| Refund            | ผ่าน Dashboard       | ผ่าน API               |
| Settlement        | T+2 วัน             | T+2 วัน                |

แนะนำ: ใช้ทั้ง 2 พร้อมกัน
- ในไลน์ → LINE Pay
- บนเว็บ → Omise (ครอบคลุมมากกว่า)
`;

export {};

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  lineId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(
  data => data.lineId || data.email || data.phone,
  { message: 'At least one contact required' }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const { error } = await supabase.from('waitlist').insert({
      line_id: parsed.data.lineId,
      email: parsed.data.email,
      phone: parsed.data.phone,
      source: req.headers.get('referer') || 'direct',
      ip,
    });

    if (error) {
      console.error('Waitlist error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

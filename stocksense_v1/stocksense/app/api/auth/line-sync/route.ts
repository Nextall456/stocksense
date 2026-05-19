import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  lineUserId: z.string().min(1),
  displayName: z.string().optional(),
  pictureUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          line_user_id: parsed.data.lineUserId,
          display_name: parsed.data.displayName,
          avatar_url: parsed.data.pictureUrl,
        },
        { onConflict: 'line_user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('LINE sync error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

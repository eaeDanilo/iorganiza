import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('saas_plans')
    .select('*')
    .eq('saas_id', params.id)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('saas_plans')
    .insert({
      saas_id: params.id,
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price_monthly: Number(body.price_monthly),
      features: Array.isArray(body.features) ? body.features : [],
      stripe_price_id: body.stripe_price_id || null,
      has_ai_chat: !!body.has_ai_chat,
      is_default: !!body.is_default,
      sort_order: Number(body.sort_order ?? 0),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

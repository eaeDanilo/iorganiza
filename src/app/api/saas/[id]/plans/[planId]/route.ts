import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string; planId: string } }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('saas_plans')
    .update({
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
    .eq('id', params.planId)
    .eq('saas_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; planId: string } }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from('saas_plans')
    .delete()
    .eq('id', params.planId)
    .eq('saas_id', params.id);

  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

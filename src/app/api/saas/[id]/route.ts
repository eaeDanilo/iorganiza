export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonError, jsonOk } from '@/lib/api';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  external_url: z.string().url().nullable().optional(),
  price_monthly: z.number().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  stripe_product_id: z.string().nullable().optional(),
  stripe_price_id: z.string().nullable().optional(),
  trial_enabled: z.boolean().optional(),
  trial_max_uses: z.number().int().nonnegative().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('saas').select('*').eq('id', params.id).maybeSingle();
    if (error) throw error;
    if (!data) return jsonError('SaaS não encontrado', 404, 'NOT_FOUND');
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = updateSchema.parse(await req.json());
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('saas').update(body).eq('id', params.id).select('*').single();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from('saas')
      .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
      .eq('id', params.id);
    if (error) throw error;
    return jsonOk({ deleted: true });
  } catch (e) { return handleError(e); }
}

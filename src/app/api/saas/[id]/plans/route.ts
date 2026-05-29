import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { handleError, jsonOk, jsonError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const planSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(50),
  description: z.string().max(500).nullable().optional(),
  price_monthly: z.number().nonnegative(),
  features: z.array(z.string().max(200)).max(50).default([]),
  stripe_price_id: z.string().max(100).nullable().optional(),
  has_ai_chat: z.boolean().default(false),
  is_default: z.boolean().default(false),
  sort_order: z.number().int().nonnegative().default(0),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.is_admin) return jsonError('Sem permissão', 403, 'FORBIDDEN');

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('saas_plans')
      .select('*')
      .eq('saas_id', id)
      .order('sort_order', { ascending: true });

    if (error) return jsonError('Erro interno', 500, 'INTERNAL');
    return jsonOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.is_admin) return jsonError('Sem permissão', 403, 'FORBIDDEN');

    const body = await req.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0].message, 400, 'VALIDATION');

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('saas_plans')
      .insert({ saas_id: id, ...parsed.data })
      .select()
      .single();

    if (error) return jsonError('Erro interno', 500, 'INTERNAL');
    return jsonOk(data);
  } catch (err) {
    return handleError(err);
  }
}

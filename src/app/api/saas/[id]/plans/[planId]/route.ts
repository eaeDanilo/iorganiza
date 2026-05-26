import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { handleError, jsonOk, jsonError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const planUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(50).optional(),
  description: z.string().max(500).nullable().optional(),
  price_monthly: z.number().nonnegative().optional(),
  features: z.array(z.string().max(200)).max(50).optional(),
  stripe_price_id: z.string().max(100).nullable().optional(),
  has_ai_chat: z.boolean().optional(),
  is_default: z.boolean().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  try {
    const { id, planId } = await params;
    const user = await getCurrentUser();
    if (!user?.is_admin) return jsonError('Sem permissão', 403, 'FORBIDDEN');

    const body = await req.json();
    const parsed = planUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0].message, 400, 'VALIDATION');

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('saas_plans')
      .update(parsed.data)
      .eq('id', planId)
      .eq('saas_id', id)
      .select()
      .single();

    if (error) return jsonError(error.message, 500, 'INTERNAL');
    return jsonOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; planId: string }> }) {
  try {
    const { id, planId } = await params;
    const user = await getCurrentUser();
    if (!user?.is_admin) return jsonError('Sem permissão', 403, 'FORBIDDEN');

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase
      .from('saas_plans')
      .delete()
      .eq('id', planId)
      .eq('saas_id', id);

    if (error) return jsonError(error.message, 500, 'INTERNAL');
    return jsonOk(null);
  } catch (err) {
    return handleError(err);
  }
}

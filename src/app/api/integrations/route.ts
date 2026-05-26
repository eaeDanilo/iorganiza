export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonError, jsonOk } from '@/lib/api';

const schema = z.object({
  source_saas_id: z.string().uuid(),
  target_saas_id: z.string().uuid(),
  is_enabled: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('saas_integrations')
      .select('*')
      .eq('user_id', user.id);
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());
    if (body.source_saas_id === body.target_saas_id) return jsonError('Origem e destino iguais', 400);
    const supabase = await createSupabaseServerClient();

    // valida ambas assinaturas ativas
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('saas_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .in('saas_id', [body.source_saas_id, body.target_saas_id]);
    if ((subs ?? []).length < 2) return jsonError('Você precisa de assinaturas ativas em ambos SaaS', 403, 'NOT_ENTITLED');

    const { data, error } = await supabase
      .from('saas_integrations')
      .upsert({ ...body, user_id: user.id }, { onConflict: 'source_saas_id,target_saas_id,user_id' })
      .select('*')
      .single();
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

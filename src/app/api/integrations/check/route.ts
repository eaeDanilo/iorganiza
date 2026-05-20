export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonError, jsonOk } from '@/lib/api';

// GET /api/integrations/check?source=<saas_id>&target=<saas_id>
// Retorna se o usuário corrente tem ambas assinaturas ativas e a integração habilitada.
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const source = req.nextUrl.searchParams.get('source');
    const target = req.nextUrl.searchParams.get('target');
    if (!source || !target) return jsonError('source e target são obrigatórios', 400);

    const supabase = createSupabaseServerClient();
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('saas_id, status')
      .eq('user_id', user.id)
      .in('saas_id', [source, target]);

    const activeIds = new Set((subs ?? []).filter((s) => s.status === 'active').map((s) => s.saas_id));
    const allowed = activeIds.has(source) && activeIds.has(target);

    let enabled = false;
    if (allowed) {
      const { data: integ } = await supabase
        .from('saas_integrations')
        .select('is_enabled')
        .eq('user_id', user.id)
        .eq('source_saas_id', source)
        .eq('target_saas_id', target)
        .maybeSingle();
      enabled = integ?.is_enabled ?? false;
    }
    return jsonOk({ allowed, enabled });
  } catch (e) { return handleError(e); }
}

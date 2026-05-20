export const dynamic = 'force-dynamic'
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count: canceled30 }, { count: active }] = await Promise.all([
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'canceled').gte('updated_at', thirtyDaysAgo),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);
    const denom = Math.max((active ?? 0) + (canceled30 ?? 0), 1);
    const rate = (canceled30 ?? 0) / denom;
    return jsonOk({ canceled30: canceled30 ?? 0, active: active ?? 0, churnRate: rate });
  } catch (e) { return handleError(e); }
}

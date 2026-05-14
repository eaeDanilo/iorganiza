import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', since)
      .is('deleted_at', null)
      .order('created_at');
    if (error) throw error;
    const byMonth: Record<string, number> = {};
    for (const u of data || []) {
      const d = new Date(u.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[k] = (byMonth[k] || 0) + 1;
    }
    return jsonOk({ total: data?.length ?? 0, byMonth });
  } catch (e) { return handleError(e); }
}

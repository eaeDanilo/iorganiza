import { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const q = req.nextUrl.searchParams.get('q');
    let qb = supabase
      .from('users')
      .select('*, subscriptions:subscriptions(id, status, saas:saas(name))')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);
    if (q) qb = qb.ilike('email', `%${q}%`);
    const { data, error } = await qb;
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export const dynamic = 'force-dynamic'
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*, subscription:subscriptions(*, saas:saas(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

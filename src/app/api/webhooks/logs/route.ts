import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

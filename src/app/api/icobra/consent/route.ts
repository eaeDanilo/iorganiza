export const dynamic = 'force-dynamic';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServiceClient();

    const { error } = await supabase
      .from('users')
      .update({ icobra_ai_consented_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    return jsonOk({ ok: true });
  } catch (e) { return handleError(e); }
}

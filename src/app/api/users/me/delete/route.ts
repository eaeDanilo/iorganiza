export const dynamic = 'force-dynamic';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function DELETE() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServiceClient();

    const deletedAt = new Date().toISOString();

    await supabase.from('subscriptions')
      .update({ status: 'canceled', cancel_at: deletedAt })
      .eq('user_id', user.id)
      .eq('status', 'active');

    const { error } = await supabase
      .from('users')
      .update({ deleted_at: deletedAt })
      .eq('id', user.id);

    if (error) throw error;

    return jsonOk({ ok: true, deletedAt, message: 'Conta marcada para exclusão. Seus dados serão permanentemente removidos em 90 dias.' });
  } catch (e) { return handleError(e); }
}

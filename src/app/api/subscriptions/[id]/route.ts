export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonError, jsonOk } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, saas:saas(*)')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data || (data as any).user_id !== user.id) return jsonError('Não encontrado', 404, 'NOT_FOUND');
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', cancel_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonError('Assinatura não encontrada', 404, 'NOT_FOUND');
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

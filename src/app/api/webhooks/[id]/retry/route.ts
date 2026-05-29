export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonError, jsonOk } from '@/lib/api';
import { replayWebhook } from '@/lib/webhooks/processors';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const { data: log } = await supabase.from('webhook_logs').select('*').eq('id', id).maybeSingle();
    if (!log) return jsonError('Log não encontrado', 404, 'NOT_FOUND');

    try {
      await replayWebhook(log.provider, log.payload);
      await supabase.from('webhook_logs').update({
        status: 'success', error_message: null, processed_at: new Date().toISOString(),
      }).eq('id', id);
      return jsonOk({ replayed: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'replay error';
      await supabase.from('webhook_logs').update({
        status: 'failed', error_message: msg, processed_at: new Date().toISOString(),
      }).eq('id', id);
      return jsonError('Falha ao reprocessar webhook', 500);
    }
  } catch (e) { return handleError(e); }
}

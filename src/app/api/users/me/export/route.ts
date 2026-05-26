export const dynamic = 'force-dynamic';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = createSupabaseServiceClient();

    const [{ data: profile }, { data: subscriptions }, { data: payments }, { data: emprestimos }] =
      await Promise.all([
        supabase.from('users').select('id, email, full_name, created_at').eq('id', user.id).maybeSingle(),
        supabase.from('subscriptions').select('id, plan_id, status, price_paid, payment_method, current_period_start, current_period_end, created_at').eq('user_id', user.id).is('deleted_at', null),
        supabase.from('payments').select('id, amount, currency, status, payment_method, created_at').eq('user_id', user.id),
        supabase.from('emprestimos').select('id, nome_devedor, valor_emprestado, valor_total, num_parcelas, status, created_at').eq('user_id', user.id).is('deleted_at', null),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      lgpdNote: 'Exportação de dados conforme Art. 18-II da Lei nº 13.709/2018 (LGPD)',
      profile,
      subscriptions: subscriptions ?? [],
      payments: payments ?? [],
      icobra: { emprestimos: emprestimos ?? [] },
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="iorganiza-meus-dados-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) { return handleError(e); }
}

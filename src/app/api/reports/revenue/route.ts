export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { handleError, jsonOk } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const format = req.nextUrl.searchParams.get('format');
    const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('payments')
      .select('created_at, amount, currency, status')
      .eq('status', 'succeeded')
      .gte('created_at', since)
      .order('created_at');
    if (error) throw error;

    if (format === 'csv') {
      const rows = ['date,amount,currency'];
      for (const p of data || []) rows.push(`${p.created_at},${p.amount},${p.currency}`);
      return new Response(rows.join('\n'), {
        headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="revenue.csv"' },
      });
    }
    return jsonOk(data);
  } catch (e) { return handleError(e); }
}

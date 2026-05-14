import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function RelatoriosPage() {
  const supabase = createSupabaseServiceClient();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: subsBySaas }, { data: recentPayments }] = await Promise.all([
    supabase.from('subscriptions').select('saas_id, status, price_paid, saas:saas(name, price_monthly)').eq('status', 'active'),
    supabase.from('payments').select('created_at, amount, status').eq('status', 'succeeded').gte('created_at', ninetyDaysAgo),
  ]);

  const bySaas: Record<string, { name: string; count: number; mrr: number }> = {};
  for (const s of (subsBySaas ?? []) as any[]) {
    const key = s.saas?.name ?? 'Desconhecido';
    bySaas[key] = bySaas[key] || { name: key, count: 0, mrr: 0 };
    bySaas[key].count += 1;
    bySaas[key].mrr += Number(s.price_paid) || Number(s.saas?.price_monthly) || 0;
  }
  const ranked = Object.values(bySaas).sort((a, b) => b.mrr - a.mrr);

  // Receita por mês (últimos 3 meses)
  const monthly: Record<string, number> = {};
  for (const p of (recentPayments ?? []) as any[]) {
    const d = new Date(p.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
  }
  const monthlyArr = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div>
      <h1 className="text-3xl font-bold">Relatórios</h1>
      <p className="mt-1 text-muted-foreground">Análises de receita e assinaturas.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Mais vendidos (por MRR)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>SaaS</TableHead><TableHead>Assinantes</TableHead><TableHead className="text-right">MRR</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.mrr)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receita por mês (90d)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Mês</TableHead><TableHead className="text-right">Receita</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {monthlyArr.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{k}</TableCell>
                    <TableCell className="text-right">{formatCurrency(v)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Para export CSV use <code>/api/reports/revenue?format=csv</code> e endpoints similares.
      </p>
    </div>
  );
}

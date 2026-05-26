import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { paymentMethodLabel, paymentStatusLabel } from '@/lib/labels';
import type { Payment, Subscription, Saas } from '@/types/database';

type PayWithSub = Payment & { subscription: Subscription & { saas: Saas } };

export default async function FaturamentoPage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('payments')
    .select('*, subscription:subscriptions(*, saas:saas(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const payments = (data ?? []) as unknown as PayWithSub[];

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Faturamento</h1>
      <p className="mt-1 text-muted-foreground">Histórico de pagamentos e cobranças.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum pagamento registrado.</p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.created_at, true)}</TableCell>
                        <TableCell>{p.subscription?.saas?.name ?? '—'}</TableCell>
                        <TableCell>{paymentMethodLabel[p.payment_method]}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'succeeded' ? 'success' : p.status === 'pending' ? 'outline' : 'destructive'}>
                            {paymentStatusLabel[p.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(Number(p.amount), p.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="space-y-3 md:hidden">
                {payments.map((p) => (
                  <li key={p.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.subscription?.saas?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(p.created_at, true)}</p>
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatCurrency(Number(p.amount), p.currency)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{paymentMethodLabel[p.payment_method]}</span>
                      <Badge variant={p.status === 'succeeded' ? 'success' : p.status === 'pending' ? 'outline' : 'destructive'}>
                        {paymentStatusLabel[p.status]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

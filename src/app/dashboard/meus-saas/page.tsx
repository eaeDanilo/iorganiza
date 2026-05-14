import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils';
import { subscriptionStatusLabel, paymentMethodLabel } from '@/lib/labels';
import type { Subscription, Saas } from '@/types/database';

type SubWithSaas = Subscription & { saas: Saas };

export default async function MeusSaasPage() {
  const user = (await getCurrentUser())!;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*, saas:saas(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  const subs = (data ?? []) as unknown as SubWithSaas[];

  return (
    <div>
      <h1 className="text-3xl font-bold">Meus SaaS</h1>
      <p className="mt-1 text-muted-foreground">Todas as suas assinaturas, ativas e canceladas.</p>

      {subs.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma assinatura ainda.</p>
            <Button asChild className="mt-4"><Link href="/dashboard/catalogo">Explorar catálogo</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {subs.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{s.saas.name}</CardTitle>
                  <Badge variant={s.status === 'active' ? 'success' : s.status === 'pending' ? 'outline' : 'destructive'}>
                    {subscriptionStatusLabel[s.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p className="font-medium">{formatCurrency(Number(s.price_paid) || s.saas.price_monthly)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Via</p>
                    <p className="font-medium">{paymentMethodLabel[s.payment_method]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Início do período</p>
                    <p className="font-medium">{formatDate(s.current_period_start)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fim do período</p>
                    <p className="font-medium">{formatDate(s.current_period_end)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {s.status === 'active' && (
                    <Button asChild>
                      <Link href={s.saas.external_url || '#'}>Acessar {s.saas.name}</Link>
                    </Button>
                  )}
                  {s.status === 'active' && (
                    <form action={`/api/subscriptions/${s.id}/cancel`} method="post">
                      <Button variant="outline" type="submit">Cancelar</Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

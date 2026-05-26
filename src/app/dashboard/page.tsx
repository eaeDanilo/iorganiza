import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { subscriptionStatusLabel } from '@/lib/labels';
import { Package, Calendar, Wallet } from 'lucide-react';
import type { Subscription, Saas } from '@/types/database';

type SubWithSaas = Subscription & { saas: Saas };

export default async function DashboardHomePage() {
  const user = (await getCurrentUser())!;
  const supabase = await createSupabaseServerClient();
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*, saas:saas(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const list = (subs ?? []) as unknown as SubWithSaas[];
  const active = list.filter((s) => s.status === 'active');
  const nextRenewal = active.map((s) => s.current_period_end).filter(Boolean).sort()[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Olá, {user.full_name || 'usuário'}</h1>
        <p className="mt-2 text-muted-foreground">Resumo das suas assinaturas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Sistemas ativos" value={active.length} icon={<Package className="h-5 w-5" />} accent="primary" />
        <StatCard
          label="Total mensal"
          value={formatCurrency(active.reduce((acc, s) => acc + (Number(s.price_paid) || s.saas.price_monthly), 0))}
          icon={<Wallet className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="Próxima renovação"
          value={formatDate(nextRenewal)}
          icon={<Calendar className="h-5 w-5" />}
          accent="secondary"
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">Seus Sistemas</h2>
          <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
            <Link href="/dashboard/catalogo">Explorar catálogo</Link>
          </Button>
        </div>
        {list.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Você ainda não assinou nenhum sistema.</p>
              <Button asChild className="mt-4"><Link href="/dashboard/catalogo">Ver catálogo</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <Card key={s.id} className="group transition hover:scale-[1.02] hover:shadow-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{s.saas.name}</CardTitle>
                    <Badge variant={s.status === 'active' ? 'success' : s.status === 'pending' ? 'outline' : 'destructive'}>
                      {subscriptionStatusLabel[s.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Renova em {formatDate(s.current_period_end)}</p>
                  <Button asChild className="mt-4 w-full">
                    <Link href={s.saas.external_url || `/dashboard/${s.saas.slug}`}>Acessar</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

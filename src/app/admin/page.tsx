import { StatCard } from '@/components/shared/StatCard';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Users, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';

export default async function AdminHomePage() {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: usersCount }, { data: activeSubs }, { data: monthPayments }, { count: canceledLast30 }] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('subscriptions').select('price_paid, saas_id, saas:saas(name, price_monthly)').eq('status', 'active'),
    supabase.from('payments').select('amount, status').eq('status', 'succeeded').gte('created_at', firstOfMonth),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'canceled').gte('updated_at', thirtyDaysAgo),
  ]);

  const mrr = (activeSubs ?? []).reduce((acc: number, s: any) =>
    acc + (Number(s.price_paid) || Number(s.saas?.price_monthly) || 0), 0);
  const revenueMonth = (monthPayments ?? []).reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
  const churn = (canceledLast30 ?? 0) / Math.max((activeSubs?.length ?? 0) + (canceledLast30 ?? 0), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Visão geral</h1>
        <p className="mt-2 text-muted-foreground">Métricas em tempo real da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários" value={usersCount ?? 0} icon={<Users className="h-5 w-5" />} accent="muted" />
        <StatCard label="MRR" value={formatCurrency(mrr)} icon={<TrendingUp className="h-5 w-5" />} accent="primary" subtext="Receita recorrente mensal" />
        <StatCard label="Receita no mês" value={formatCurrency(revenueMonth)} icon={<DollarSign className="h-5 w-5" />} accent="success" />
        <StatCard label="Churn (30d)" value={`${(churn * 100).toFixed(1)}%`} icon={<TrendingDown className="h-5 w-5" />} accent="secondary" />
      </div>
    </div>
  );
}
